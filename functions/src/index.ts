import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import express from "express";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();
const database = getFirestore();
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

const clientId = defineSecret("STRAVA_CLIENT_ID");
const clientSecret = defineSecret("STRAVA_CLIENT_SECRET");
const sessionSecret = defineSecret("STRAVA_SESSION_SECRET");
const siteUrl = "https://routelapse.web.app";
const callbackUrl = `${siteUrl}/api/strava/callback`;
const cookieName = "routelapse_strava";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope?: string;
  athlete?: { id: number; firstname?: string; lastname?: string; profile_medium?: string };
};

type AthleteToken = TokenResponse & {
  athleteId: number;
  athleteName: string;
};

function sign(value: string) {
  return createHmac("sha256", sessionSecret.value()).update(value).digest("base64url");
}

function signedValue(value: string) {
  return `${value}.${sign(value)}`;
}

function verifySignedValue(value?: string) {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const supplied = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(sign(payload));
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? payload : null;
}

function cookies(header?: string) {
  return Object.fromEntries(
    (header ?? "")
      .split(";")
      .map((part) => {
        const value = part.trim();
        const separator = value.indexOf("=");
        return separator < 0 ? [value, ""] : [value.slice(0, separator), value.slice(separator + 1)];
      })
      .filter(([key]) => key),
  );
}

function athleteIdFromRequest(request: express.Request) {
  const payload = verifySignedValue(cookies(request.headers.cookie)[cookieName]);
  if (!payload) return null;
  const [athleteId, expires] = payload.split(":").map(Number);
  return Number.isSafeInteger(athleteId) && expires > Date.now() ? athleteId : null;
}

function setSession(response: express.Response, athleteId: number) {
  const maxAge = 30 * 24 * 60 * 60;
  const value = signedValue(`${athleteId}:${Date.now() + maxAge * 1_000}`);
  response.setHeader("Set-Cookie", `${cookieName}=${value}; Max-Age=${maxAge}; Path=/api/strava; HttpOnly; Secure; SameSite=Lax`);
}

function clearSession(response: express.Response) {
  response.setHeader("Set-Cookie", `${cookieName}=; Max-Age=0; Path=/api/strava; HttpOnly; Secure; SameSite=Lax`);
}

async function tokenRequest(parameters: Record<string, string>) {
  const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId.value(), client_secret: clientSecret.value(), ...parameters }),
  });
  if (!response.ok) throw new Error(`Strava token exchange failed (${response.status}).`);
  return (await response.json()) as TokenResponse;
}

async function athleteToken(athleteId: number) {
  const reference = database.collection("stravaTokens").doc(String(athleteId));
  const snapshot = await reference.get();
  if (!snapshot.exists) return null;
  let token = snapshot.data() as AthleteToken;
  if (token.expires_at <= Math.floor(Date.now() / 1_000) + 3_600) {
    const refreshed = await tokenRequest({ grant_type: "refresh_token", refresh_token: token.refresh_token });
    token = { ...token, ...refreshed };
    await reference.set({ ...token, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  return token;
}

app.get("/api/strava/connect", (_request, response) => {
  const statePayload = `${randomBytes(18).toString("base64url")}:${Date.now() + 10 * 60 * 1_000}`;
  const parameters = new URLSearchParams({
    client_id: clientId.value(),
    response_type: "code",
    redirect_uri: callbackUrl,
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state: signedValue(statePayload),
  });
  response.redirect(`https://www.strava.com/oauth/authorize?${parameters}`);
});

app.get("/api/strava/callback", async (request, response) => {
  try {
    const state = verifySignedValue(typeof request.query.state === "string" ? request.query.state : undefined);
    const expires = state ? Number(state.split(":").at(-1)) : 0;
    const code = typeof request.query.code === "string" ? request.query.code : "";
    if (!state || expires < Date.now() || !code) return response.redirect(`${siteUrl}/?strava=denied`);
    const token = await tokenRequest({ grant_type: "authorization_code", code });
    if (!token.athlete?.id || !token.scope?.includes("activity:read_all")) {
      return response.redirect(`${siteUrl}/?strava=scope`);
    }
    const athleteName = [token.athlete.firstname, token.athlete.lastname].filter(Boolean).join(" ");
    await database.collection("stravaTokens").doc(String(token.athlete.id)).set({
      ...token,
      athleteId: token.athlete.id,
      athleteName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    setSession(response, token.athlete.id);
    return response.redirect(`${siteUrl}/?strava=connected`);
  } catch (error) {
    console.error(error);
    return response.redirect(`${siteUrl}/?strava=error`);
  }
});

app.get("/api/strava/status", async (request, response) => {
  const athleteId = athleteIdFromRequest(request);
  if (!athleteId) return response.status(401).json({ connected: false });
  const token = await athleteToken(athleteId);
  return token
    ? response.json({ connected: true, athlete: { id: athleteId, name: token.athleteName } })
    : response.status(401).json({ connected: false });
});

app.get("/api/strava/activities", async (request, response) => {
  const athleteId = athleteIdFromRequest(request);
  if (!athleteId) return response.status(401).json({ error: "Not connected" });
  const token = await athleteToken(athleteId);
  if (!token) return response.status(401).json({ error: "Not connected" });
  const page = Math.max(1, Number(request.query.page) || 1);
  const upstream = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=30`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  return response.status(upstream.status).type("json").send(await upstream.text());
});

app.get("/api/strava/activities/:id/track", async (request, response) => {
  const athleteId = athleteIdFromRequest(request);
  if (!athleteId || !/^\d+$/.test(request.params.id)) return response.status(401).json({ error: "Not connected" });
  const token = await athleteToken(athleteId);
  if (!token) return response.status(401).json({ error: "Not connected" });
  const [activityResponse, streamsResponse] = await Promise.all([
    fetch(`https://www.strava.com/api/v3/activities/${request.params.id}`, { headers: { Authorization: `Bearer ${token.access_token}` } }),
    fetch(`https://www.strava.com/api/v3/activities/${request.params.id}/streams?keys=latlng,time,altitude&key_by_type=true`, { headers: { Authorization: `Bearer ${token.access_token}` } }),
  ]);
  if (!activityResponse.ok || !streamsResponse.ok) return response.status(502).json({ error: "Strava activity data was unavailable" });
  const activity = await activityResponse.json() as { name: string; type?: string; sport_type?: string; start_date: string };
  const streams = await streamsResponse.json() as { latlng?: { data: [number, number][] }; time?: { data: number[] }; altitude?: { data: number[] } };
  const points = (streams.latlng?.data ?? []).map(([latitude, longitude], index) => ({
    latitude,
    longitude,
    elevation: streams.altitude?.data[index],
    time: streams.time?.data[index] === undefined ? undefined : new Date(Date.parse(activity.start_date) + streams.time.data[index] * 1_000).toISOString(),
  }));
  return response.json({ name: activity.name, sport: activity.sport_type ?? activity.type ?? "activity", points });
});

app.delete("/api/strava/disconnect", async (request, response) => {
  const athleteId = athleteIdFromRequest(request);
  if (!athleteId) return response.status(204).end();
  const token = await athleteToken(athleteId);
  if (token) {
    const authorization = Buffer.from(`${clientId.value()}:${clientSecret.value()}`).toString("base64");
    await fetch("https://www.strava.com/oauth/revoke", {
      method: "POST",
      headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: token.refresh_token, token_type_hint: "refresh_token" }),
    });
    await database.collection("stravaTokens").doc(String(athleteId)).delete();
  }
  clearSession(response);
  return response.status(204).end();
});

export const api = onRequest(
  { region: "asia-northeast1", secrets: [clientId, clientSecret, sessionSecret], timeoutSeconds: 60 },
  app,
);
