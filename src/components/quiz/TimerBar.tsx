"use client";

import { useEffect, useState, useRef } from "react";

interface TimerBarProps {
  dureeSecondes: number;
  onExpire: () => void;
  reset?: number;
}

export default function TimerBar({ dureeSecondes, onExpire, reset = 0 }: TimerBarProps) {
  const [restant, setRestant] = useState(dureeSecondes);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
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
      <div className="flex justify-between text-xs font-mono text-gray-500">
        <span>⏱ Chrono</span>
        <span className={restant <= 5 ? "text-red-600 font-bold" : ""}>
          {restant}s
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${couleur}`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
    </div>
  );
}
