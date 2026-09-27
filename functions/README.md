# RouteLapse Strava backend

This Firebase 2nd-generation HTTPS function implements the complete server side of the Strava connection:

- OAuth authorization and signed state verification
- secure authorization-code exchange and rotating refresh tokens
- HTTP-only signed athlete sessions
- activity listing and detailed route-stream retrieval
- provider revocation, token deletion, and disconnect

The function cannot be deployed until the Firebase project is on the Blaze plan and a Strava developer application exists.

## One-time activation

1. Register the Strava app with authorization callback domain `routelapse.web.app` and callback URL `https://routelapse.web.app/api/strava/callback`.
2. Enable Firestore for `routelapse-app`.
3. Set the secrets:

   ```bash
   firebase functions:secrets:set STRAVA_CLIENT_ID
   firebase functions:secrets:set STRAVA_CLIENT_SECRET
   firebase functions:secrets:set STRAVA_SESSION_SECRET
   ```

4. Add this entry to the Hosting `rewrites` array after the first function deployment:

   ```json
   {
     "source": "/api/**",
     "function": { "functionId": "api", "region": "asia-northeast1" }
   }
   ```

5. Deploy `functions:api`, rebuild the web app with `NEXT_PUBLIC_STRAVA_ENABLED=true`, and deploy Hosting.

Secrets and refresh tokens never enter the browser bundle. Firestore must deny all client access to the `stravaTokens` collection; only the Admin SDK in this function reads it.
