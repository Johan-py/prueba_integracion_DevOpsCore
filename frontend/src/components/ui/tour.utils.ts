import { MENU_CLOSE_TIMEOUT_MS } from "./tour.constants";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

// ─── Mobile menu detection ───────────────────────────────────────────────────

// Detecta si el overlay del menú hamburguesa está en el DOM.
// El menú se renderiza como `fixed inset-0 z-[9999] bg-black/40 md:hidden`
// cuando isMobileMenuOpen === true en Navbar.tsx.
export const isMobileMenuInDOM = (): boolean => {
  return !!document.querySelector(".fixed.inset-0.bg-black\\/40");
};

// Espera a que el overlay del menú desaparezca del DOM usando MutationObserver.
// Llama a `onClosed` cuando el menú ya no está presente, o tras el timeout de seguridad.
export const waitForMenuClose = (onClosed: () => void): (() => void) => {
  if (!isMobileMenuInDOM()) {
    onClosed();
    return () => {};
  }

  let done = false;
  const resolve = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
    requestAnimationFrame(() => requestAnimationFrame(onClosed));
  };

  const observer = new MutationObserver(() => {
    if (!isMobileMenuInDOM()) resolve();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const fallback = setTimeout(resolve, MENU_CLOSE_TIMEOUT_MS);

  return () => {
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
  };
};

// Espera a que el overlay del menú aparezca en el DOM.
export const waitForMenuOpen = (onOpened: () => void): (() => void) => {
  if (isMobileMenuInDOM()) {
    onOpened();
    return () => {};
  }

  let done = false;
  const resolve = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
    requestAnimationFrame(() => requestAnimationFrame(onOpened));
  };

  const observer = new MutationObserver(() => {
    if (isMobileMenuInDOM()) resolve();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const fallback = setTimeout(resolve, MENU_CLOSE_TIMEOUT_MS);

  return () => {
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
  };
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export type TourTheme = {
  bg: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  stepInactive: string;
};

export const getTourTheme = (isDark: boolean): TourTheme => ({
  bg:           isDark ? "#111111" : "#ffffff",
  text:         isDark ? "#ffffff" : "#111827",
  textMuted:    isDark ? "#d1d5db" : "#374151",
  textSubtle:   isDark ? "#6b7280" : "#9ca3af",
  stepInactive: isDark ? "#374151" : "#e5e7eb",
});