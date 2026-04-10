// public/sw.js

let etatObjectif = null; // { atteint: boolean, restant: number }

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
  planifierVerification();
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "MISE_A_JOUR_OBJECTIF") {
    etatObjectif = e.data.payload; // { atteint: boolean, restant: number }
  }
  if (e.data?.type === "NOTIFS_ACTIVEES") {
    planifierVerification();
  }
});

function planifierVerification() {
  const maintenant = new Date();
  const prochaine18h = new Date();
  prochaine18h.setHours(18, 0, 0, 0);

  if (maintenant >= prochaine18h) {
    prochaine18h.setDate(prochaine18h.getDate() + 1);
  }

  const delaiMs = prochaine18h.getTime() - maintenant.getTime();

  setTimeout(async () => {
    await verifierEtNotifier();
    planifierVerification(); // Replanifier pour le lendemain
  }, delaiMs);
}

async function verifierEtNotifier() {
  if (!etatObjectif || etatObjectif.atteint) return;

  const texte = etatObjectif.restant === 1
    ? "Il te reste 1 quiz à faire pour atteindre ton objectif !"
    : `Il te reste ${etatObjectif.restant} quiz à faire pour atteindre ton objectif !`;

  await self.registration.showNotification("QuizLycée — Rappel de révision 📚", {
    body: texte,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "rappel-quotidien",
    renotify: false,
  });
}
