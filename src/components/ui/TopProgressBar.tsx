"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isNavigating = useRef(false);
  const hasMounted = useRef(false);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Démarre la barre (appelé au clic sur un lien interne)
  const start = () => {
    clearAll();
    isNavigating.current = true;
    setFading(false);
    setVisible(true);
    setWidth(0);
    timers.current.push(setTimeout(() => setWidth(28), 60));
    timers.current.push(setTimeout(() => setWidth(58), 450));
    timers.current.push(setTimeout(() => setWidth(78), 1100));
    timers.current.push(setTimeout(() => setWidth(88), 2500));
  };

  // Intercepte les clics sur les liens internes
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clearAll(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Complète la barre quand la route change
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    if (!isNavigating.current) return;
    isNavigating.current = false;
    clearAll();
    setWidth(100);
    timers.current.push(setTimeout(() => setFading(true), 180));
    timers.current.push(setTimeout(() => { setVisible(false); setWidth(0); setFading(false); }, 580));
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 9999, pointerEvents: "none" }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, var(--indigo) 0%, var(--coral) 100%)",
          transition: fading ? "opacity 0.35s ease" : "width 0.38s ease",
          opacity: fading ? 0 : 1,
          boxShadow: "0 0 10px rgba(77,94,232,0.65)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
