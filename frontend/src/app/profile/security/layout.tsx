"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SecuritySidebar from "@/components/security/SecuritySidebar";

type SecurityLayoutProps = {
  children: ReactNode;
};

const AUTH_STORAGE_KEYS = [
  "token",
  "propbol_user",
  "propbol_session_expires",
  "nombre",
  "correo",
  "avatar",
];

export default function SecurityLayout({ children }: SecurityLayoutProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  const clearSessionAndRedirect = useCallback(() => {
    AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    setIsVerified(false);

    window.dispatchEvent(new Event("propbol:session-changed"));
    window.dispatchEvent(new Event("auth-state-changed"));

    router.replace("/sign-in");
  }, [router]);

  const validateSession = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearSessionAndRedirect();
      return false;
    }

    setIsVerified(true);
    return true;
  }, [clearSessionAndRedirect]);

  useEffect(() => {
    validateSession();

    const handleAuthError = () => {
      clearSessionAndRedirect();
    };

    const handleFocus = () => {
      validateSession();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        validateSession();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" && !event.newValue) {
        clearSessionAndRedirect();
      }
    };

    window.addEventListener("propbol:auth-error", handleAuthError);
    window.addEventListener("auth-state-changed", validateSession);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      validateSession();
    }, 1000);

    return () => {
      window.removeEventListener("propbol:auth-error", handleAuthError);
      window.removeEventListener("auth-state-changed", validateSession);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [clearSessionAndRedirect, validateSession]);

  if (!isVerified) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <SecuritySidebar />

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          {children}
        </section>
      </div>
    </div>
  );
}
