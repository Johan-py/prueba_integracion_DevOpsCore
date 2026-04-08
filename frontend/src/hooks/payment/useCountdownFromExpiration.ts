// hooks/useCountdownFromExpiration.ts
import { useState, useEffect } from "react";

export function useCountdownFromExpiration(expirationISO: string | null) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expirationISO) return;

    const update = () => {
      const expiration = new Date(expirationISO).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiration - now) / 1000));
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expirationISO]);

  return { timeLeft, expired: timeLeft <= 0 };
}
