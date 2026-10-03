"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      let reloading = false;
      const reloadForUpdate = () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", reloadForUpdate);
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => registration.update())
        .catch(() => {
          // The application remains fully usable online when registration fails.
        });
      return () => navigator.serviceWorker.removeEventListener("controllerchange", reloadForUpdate);
    }
  }, []);

  return null;
}
