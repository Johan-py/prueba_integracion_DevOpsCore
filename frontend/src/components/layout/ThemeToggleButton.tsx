"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggleButton() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div
        aria-hidden="true"
        className="h-8 w-16 rounded-full bg-gray-200 animate-pulse"
      />
        );
    }

    const isDark = resolvedTheme === "dark";  

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                isDark ? "bg-slate-700" : "bg-orange-100"
            }`}
        > 
            <span
            className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${
            isDark ? "translate-x-8" : "translate-x-0"
            }`}
        >
            {isDark ? (
            <Moon size={13} className="text-slate-700" />
            ) : (
            <Sun size={13} className="text-orange-500" />
            )}
        </span>
        </button>
    );
}