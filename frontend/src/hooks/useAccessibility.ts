"use client";

import { useCallback, useEffect, useState } from "react";

export type AccessibilityOption =
  | "none"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia";

const STORAGE_KEY = "propbol-accessibility";
const DATA_ATTR = "data-accessibility";
const VALID_OPTIONS: AccessibilityOption[] = [
  "none",
  "deuteranopia",
  "protanopia",
  "tritanopia",
];

function isAccessibilityOption(
  value: string | null,
): value is AccessibilityOption {
  return VALID_OPTIONS.includes(value as AccessibilityOption);
}

function applyAccessibility(option: AccessibilityOption) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATA_ATTR, option);
}

export function useAccessibility() {
  const [accessibility, setAccessibilityState] =
    useState<AccessibilityOption>("none");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = isAccessibilityOption(saved) ? saved : "none";
    setAccessibilityState(initial);
    applyAccessibility(initial);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = isAccessibilityOption(e.newValue) ? e.newValue : "none";
      setAccessibilityState(next);
      applyAccessibility(next);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setAccessibility = useCallback((option: AccessibilityOption) => {
    setAccessibilityState(option);
    applyAccessibility(option);
    localStorage.setItem(STORAGE_KEY, option);
  }, []);

  return { accessibility, setAccessibility };
}
