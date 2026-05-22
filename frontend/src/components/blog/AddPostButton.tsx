"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

const USER_STORAGE_KEY = "propbol_user";
const TOKEN_STORAGE_KEY = "token";

export default function AddPostButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(
        Boolean(
          localStorage.getItem(TOKEN_STORAGE_KEY) ||
            localStorage.getItem(USER_STORAGE_KEY),
        ),
      );
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("propbol:session-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("propbol:session-changed", syncAuthState);
    };
  }, []);

  // Si no hay sesión (Visitor), el botón simplemente no existe en el HTML
  if (!isAuthenticated) return null;

  return (
    <Link href="/blog/create">
      <button className="bg-[#A67C00] text-white px-8 py-3 rounded-sm font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#8b6800] transition-all shadow-lg active:scale-95">
        AÑADIR POST
      </button>
    </Link>
  );
}
