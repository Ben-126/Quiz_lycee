"use client";

import { useEffect, useLayoutEffect, useState, useRef } from "react";

interface TimerBarProps {
  dureeSecondes: number;
  onExpire: () => void;
  reset?: number;
}

export default function TimerBar({ dureeSecondes, onExpire, reset = 0 }: TimerBarProps) {
  const [restant, setRestant] = useState(dureeSecondes);
  const onExpireRef = useRef(onExpire);
  useLayoutEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestant(dureeSecondes);
  }, [reset, dureeSecondes]);

  useEffect(() => {
    if (restant <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => setRestant((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [restant]);

  const pourcentage = Math.round((restant / dureeSecondes) * 100);
  const couleur =
    pourcentage > 50
      ? "bg-green-500"
      : pourcentage > 25
      ? "bg-orange-400"
      : "bg-red-500";

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-mono" style={{ color: "var(--text3)" }}>
        <span>⏱ Chrono</span>
        <span style={restant <= 5 ? { color: "var(--coral-l)", fontWeight: 700 } : {}}>
          {restant}s
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${couleur}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  );
}
