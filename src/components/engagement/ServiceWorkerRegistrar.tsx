// src/components/engagement/ServiceWorkerRegistrar.tsx
"use client";
import { useEffect } from "react";
import { getParametres } from "@/lib/parametres";
import { getProgressionObjectif } from "@/lib/objectif";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const params = getParametres();
    if (!params.notificationsActivees) return;
    if (Notification.permission !== "granted") return;

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      const envoyerEtat = () => {
        const prog = getProgressionObjectif();
        reg.active?.postMessage({
          type: "MISE_A_JOUR_OBJECTIF",
          payload: { atteint: prog.atteint, restant: prog.restant },
        });
      };

      if (reg.active) {
        envoyerEtat();
      } else {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "activated") envoyerEtat();
          });
        });
      }
    });
  }, []);

  return null;
}
