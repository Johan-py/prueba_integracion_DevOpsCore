"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOUR_STEPS = [
  {
    id: "tour-banner",
    title: "¡Bienvenido a PropBol!",
    description: "Aquí encontrarás las propiedades destacadas del momento.",
    required: false,
  },
  {
    id: "tour-logo",
    title: "Logo - Inicio",
    description: "Haz clic en el logo para volver a la página principal.",
    required: true,
  },
  {
    id: "tour-propiedades",
    mobileId: "tour-propiedades-mobile",
    requiresMobileMenu: true,
    title: "Propiedades",
    description: "Explora casas, departamentos, terrenos y más.",
    required: true,
  },
  {
    id: "tour-blogs",
    mobileId: "tour-blogs-mobile",
    requiresMobileMenu: true,
    title: "Blogs",
    description: "Lee artículos y consejos sobre el mercado inmobiliario.",
    required: true,
  },
  {
    id: "tour-planes",
    mobileId: "tour-planes-mobile",
    requiresMobileMenu: true,
    title: "Planes de membresía",
    description: "Conoce nuestros planes y beneficios para publicar tu inmueble.",
    required: true,
  },
  {
    id: "tour-ayuda",
    mobileId: "tour-ayuda-mobile",
    requiresMobileMenu: true,
    title: "Ayuda",
    description: "Vuelve a ver este tour cuando quieras desde aquí.",
    required: true,
  },
  {
    id: "tour-buscador",
    mobileId: "tour-buscador-mobile",
    // Sin requiresMobileMenu: el elemento existe en el DOM con otro id,
    // pero NO está dentro del menú hamburguesa
    title: "Buscador de propiedades",
    description:
      "Filtra por tipo de operación (Venta, Alquiler o Anticrético), elige el tipo de inmueble y escribe una ubicación para encontrar la propiedad ideal.",
    required: true,
  },
  {
    id: "tour-filtros-visuales",
    title: "Explora por ciudad y tipo",
    description:
      "Aquí puedes ver propiedades en alquiler o venta agrupadas por departamento, y también explorar por tipo de inmueble: casas, departamentos, oficinas y terrenos.",
    required: true,
  },
  {
    id: "tour-publicar-home",
    mobileId: "tour-publicar-home-mobile",
    requiresMobileMenu: true,
    title: "Publica tu inmueble",
    description:
      "¿Tienes una propiedad para vender o alquilar? Haz clic aquí para registrar tu inmueble y llegar a miles de compradores e inquilinos.",
    required: true,
  },
  {
    id: "tour-notificaciones",
    title: "Notificaciones",
    description: "Aquí aparecerán tus alertas y novedades importantes.",
    required: true,
  },
  {
    id: "tour-user",
    title: "Tu cuenta",
    description: "Accede a tu perfil, publicaciones y configuración.",
    required: true,
  },
  {
    id: "tour-footer-logo",
    title: "PropBol",
    description: "Nuestra misión: revolucionar el mercado inmobiliario en Bolivia.",
    required: true,
  },
  {
    id: "tour-footer-explorar",
    title: "Explorar propiedades",
    description: "Encuentra inmuebles en venta, alquiler o anticrético.",
    required: true,
  },
  {
    id: "tour-footer-conocenos",
    title: "Conócenos",
    description: "Accede a información sobre nosotros, términos y políticas de privacidad.",
    required: true,
  },
  {
    id: "tour-footer-redes",
    title: "Redes Sociales",
    description: "Síguenos en Facebook e Instagram para estar al tanto de las novedades.",
    required: true,
  },
];

type TourStep = (typeof TOUR_STEPS)[number] & {
  mobileId?: string;
  requiresMobileMenu?: boolean;
};

const FOOTER_STEP_INDEX = 11;
// Fallback máximo de espera si el MutationObserver no detecta el cierre
const MENU_CLOSE_TIMEOUT_MS = 600;

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

// FIX: detecta si el overlay del menú hamburguesa está en el DOM.
// El menú se renderiza como `fixed inset-0 z-[9999] bg-black/40 md:hidden`
// cuando isMobileMenuOpen === true en Navbar.tsx.
// Buscamos el elemento por su combinación de clases más característica.
const isMobileMenuInDOM = (): boolean => {
  return !!document.querySelector(".fixed.inset-0.bg-black\\/40");
};

// FIX: espera a que el overlay del menú desaparezca del DOM usando MutationObserver.
// Llama a `onClosed` cuando el menú ya no está presente, o tras el timeout de seguridad.
const waitForMenuClose = (onClosed: () => void): (() => void) => {
  // Si el menú ya no está en el DOM, ejecutar inmediatamente
  if (!isMobileMenuInDOM()) {
    onClosed();
    return () => { };
  }

  let done = false;
  const resolve = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
    // Un requestAnimationFrame extra para que el browser pinte el frame
    // sin el overlay antes de medir getBoundingClientRect
    requestAnimationFrame(() => requestAnimationFrame(onClosed));
  };

  const observer = new MutationObserver(() => {
    if (!isMobileMenuInDOM()) resolve();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback: si por alguna razón el observer no detecta el cambio
  const fallback = setTimeout(resolve, MENU_CLOSE_TIMEOUT_MS);

  // Retorna función de cleanup
  return () => {
    done = true;
    observer.disconnect();
    clearTimeout(fallback);
  };
};

// FIX: espera a que el overlay del menú aparezca en el DOM.
const waitForMenuOpen = (onOpened: () => void): (() => void) => {
  if (isMobileMenuInDOM()) {
    onOpened();
    return () => { };
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

export default function TourGuiado() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupMenuWaitRef = useRef<(() => void) | null>(null);
  // Cancela RAFs pendientes de pasos anteriores en navegación rápida
  const rafRef = useRef<number | null>(null);
  // IntersectionObserver activo — se cancela al cambiar de paso
  const ioRef = useRef<IntersectionObserver | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(0);
  const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const check = () =>
    setIsDark(document.documentElement.classList.contains("dark")); // Detecta el modo oscuro actual al montar el componente y cada vez que cambie la clase "dark" en el <html>
  check();
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}, []);

  // Ref para trackear el step desde el que venimos REALMENTE
  // (funciona igual en navegación hacia adelante y hacia atrás)
  const prevStepRef = useRef<number>(-1);

  const checkAndShowTour = useCallback(() => {
    if (!isLoggedIn()) return;

    // Intentar leer controlador desde localStorage para evitar HTTP
    try {
      const raw = localStorage.getItem("propbol_user");
      if (raw) {
        const sessionUser = JSON.parse(raw) as { controlador?: boolean | null };
        if (sessionUser.controlador === true) return; // tour completado — no mostrar
        if (sessionUser.controlador === false) {
          // tour pendiente — mostrar sin HTTP
          prevStepRef.current = -1;
          setCurrentStep(0);
          setHighlight(null);
          setShowTour(true);
          return;
        }
        // controlador ausente (sesión antigua sin el campo) → caer al fetch
      }
    } catch {
      // propbol_user malformado → caer al fetch
    }

    // Fallback: controlador no conocido en localStorage → preguntar al backend
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
    fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const controlador = data?.user?.controlador;

        // Cachear el valor en localStorage para que futuras recargas no caigan aquí
        try {
          const raw = localStorage.getItem("propbol_user");
          if (raw && typeof controlador === "boolean") {
            const sessionUser = JSON.parse(raw);
            localStorage.setItem(
              "propbol_user",
              JSON.stringify({ ...sessionUser, controlador })
            );
          }
        } catch { /* ignorar */ }

        // Solo mostrar si el backend confirma explícitamente false o null
        // (undefined = error de red / respuesta inválida → no mostrar)
        if (controlador === false || controlador === null) {
          prevStepRef.current = -1;
          setCurrentStep(0);
          setHighlight(null);
          setShowTour(true);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    checkAndShowTour();
    window.addEventListener("propbol:login", checkAndShowTour);
    return () => window.removeEventListener("propbol:login", checkAndShowTour);
  }, [checkAndShowTour]);

  useEffect(() => {
    const handleSessionChanged = () => {
      if (!isLoggedIn()) {
        setShowTour(false);
        setCurrentStep(0);
        prevStepRef.current = -1;
        setHighlight(null);
      }
    };
    window.addEventListener("propbol:session-changed", handleSessionChanged);
    return () => window.removeEventListener("propbol:session-changed", handleSessionChanged);
  }, []);

  useEffect(() => {
  if (showTour) {
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "auto" });
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [showTour]);

  useEffect(() => {
    if (!showTour) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
      if (e.key === "Escape") handleSkip();
      if (e.key === "ArrowLeft" && currentStep > 0)
        setCurrentStep((prev) => prev - 1);
      if (e.key === "ArrowRight") {
        if (currentStep < TOUR_STEPS.length - 1)
          setCurrentStep((prev) => prev + 1);
        else setShowTour(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showTour, currentStep]);

  useEffect(() => {
    const handleIniciarTour = () => {
      setHighlight(null);
      prevStepRef.current = -1;
      setCurrentStep(0);
      setShowTour(true);
    };
    window.addEventListener("propbol:iniciar-tour", handleIniciarTour);
    return () =>
      window.removeEventListener("propbol:iniciar-tour", handleIniciarTour);
  }, []);

  // Solo recalcula posición por resize/scroll, sin measure() inicial
  useEffect(() => {
    if (!showTour) return;

    const measure = () => {
      if (tooltipRef.current) {
        setTooltipH(tooltipRef.current.offsetHeight);
      }
      const step = TOUR_STEPS[currentStep] as TourStep;
      const isMobileNav =
        (window.visualViewport?.width ?? window.innerWidth) < 768;
      const id = isMobileNav && step.mobileId ? step.mobileId : step.id;
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.visualViewport?.height ?? window.innerHeight;
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < vh &&
          rect.bottom > 0
        ) {
          setHighlight(rect);
        }
      }
    };

    const ro = tooltipRef.current ? new ResizeObserver(measure) : null;
    if (ro && tooltipRef.current) ro.observe(tooltipRef.current);

    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [currentStep, showTour]);

  // applyHighlight recibe stepIndex explícitamente para evitar closure stale.
  // Usa IntersectionObserver para medir el elemento solo cuando ya es visible
  // en el viewport — sin importar cuánto tarde el scroll en llegar. Esto
  // elimina el retraso perceptible al navegar entre pasos muy alejados.
  const applyHighlight = (el: HTMLElement, stepIndex: number) => {
    const isFooter = stepIndex >= FOOTER_STEP_INDEX;

    // Cancelar cualquier medición pendiente del paso anterior
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }

    const measure = (isFooter: boolean) => {
      rafRef.current = requestAnimationFrame(() => {
        setHighlight(el.getBoundingClientRect());
        if (isFooter) document.body.style.overflow = "hidden";
      });
    };

    if (isFooter) {
      document.body.style.overflow = "";
      el.scrollIntoView({ behavior: "auto", block: "start" });
    } else {
      el.scrollIntoView({ behavior: "auto", block: "center" });
    }

    // Si el elemento ya es visible, medimos en el siguiente frame directamente.
    // Si aún no lo es (scroll en curso), el IO dispara en cuanto entra al viewport.
    const rect = el.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const alreadyVisible =
      rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= vh;

    if (alreadyVisible) {
      measure(isFooter);
    } else {
      ioRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            ioRef.current?.disconnect();
            ioRef.current = null;
            measure(isFooter);
          }
        },
        { threshold: 0.5 },
      );
      ioRef.current.observe(el);

      // Fallback: si el IO no dispara en 600 ms (elemento off-screen o muy pequeño)
      timeoutRef.current = setTimeout(() => {
        ioRef.current?.disconnect();
        ioRef.current = null;
        measure(isFooter);
      }, 600);
    }
  };

  useEffect(() => {
    if (!showTour) return;

    const step = TOUR_STEPS[currentStep] as TourStep;
    const isMobileNav =
      (window.visualViewport?.width ?? window.innerWidth) < 768;

    const needsMobileMenu = isMobileNav && !!step.requiresMobileMenu;

    const prevIndex = prevStepRef.current;
    const prevStep = prevIndex >= 0 ? (TOUR_STEPS[prevIndex] as TourStep) : null;
    const prevNeededMobileMenu = isMobileNav && !!prevStep?.requiresMobileMenu;

    // Actualizar ref con el step actual antes de cualquier async
    prevStepRef.current = currentStep;

    const id = isMobileNav && step.mobileId ? step.mobileId : step.id;

    // Limpiar cualquier espera de menú anterior
    if (cleanupMenuWaitRef.current) {
      cleanupMenuWaitRef.current();
      cleanupMenuWaitRef.current = null;
    }

    const menuIsClosing = !needsMobileMenu && prevNeededMobileMenu;
    const menuIsOpening = needsMobileMenu && !prevNeededMobileMenu;

    let attempts = 0;
    const maxAttempts = 10;

    const tryFind = () => {
      const el = document.getElementById(id);
      if (el) {
        if (retryRef.current) clearTimeout(retryRef.current);
        applyHighlight(el, currentStep);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          retryRef.current = setTimeout(tryFind, 300);
        } else {
          if (step.required === false) {
            setCurrentStep((prev) => prev + 1);
          } else {
            console.warn(`Elemento ${id} no encontrado`);
          }
          setHighlight(null);
        }
      }
    };

    if (menuIsClosing) {
      // FIX: despachar cierre y esperar a que el overlay desaparezca del DOM
      // antes de medir. Evita que getBoundingClientRect devuelva coordenadas
      // incorrectas mientras el overlay z-[9999] sigue pintado encima.
      setHighlight(null);
      window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
      cleanupMenuWaitRef.current = waitForMenuClose(tryFind);
    } else if (menuIsOpening) {
      // FIX: despachar apertura y esperar a que el overlay esté en el DOM
      // antes de buscar los elementos que viven dentro del menú.
      setHighlight(null);
      window.dispatchEvent(new Event("propbol:abrir-menu-movil"));
      cleanupMenuWaitRef.current = waitForMenuOpen(tryFind);
    } else {
      // Sin cambio de estado del menú detectado por las flags anteriores.
      if (needsMobileMenu) {
        // El menú ya debería estar abierto, pero nos aseguramos.
        window.dispatchEvent(new Event("propbol:abrir-menu-movil"));
        tryFind();
      } else if (isMobileNav) {
        // FIX: aunque menuIsClosing sea false (p.ej. cuando se navega hacia
        // atrás desde un step sin menú, o en el primer render), si el menú
        // sigue en el DOM hay que cerrarlo y esperar antes de medir.
        // Esto corrige el bug donde "tour-notificaciones" aparecía con el
        // menú hamburguesa aún visible después de "tour-publicar-home".
        window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
        if (isMobileMenuInDOM()) {
          setHighlight(null);
          cleanupMenuWaitRef.current = waitForMenuClose(tryFind);
        } else {
          tryFind();
        }
      } else {
        tryFind();
      }
    }

    return () => {
      if (cleanupMenuWaitRef.current) {
        cleanupMenuWaitRef.current();
        cleanupMenuWaitRef.current = null;
      }
      if (retryRef.current) clearTimeout(retryRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }
    };
  }, [currentStep, showTour]);

  const completeTour = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Marcar controlador: true en localStorage de forma inmediata para que
    // checkAndShowTour no vuelva a mostrar el tour en la próxima visita
    try {
      const raw = localStorage.getItem("propbol_user");
      if (raw) {
        const sessionUser = JSON.parse(raw);
        localStorage.setItem(
          "propbol_user",
          JSON.stringify({ ...sessionUser, controlador: true })
        );
      }
    } catch {
      // ignorar — el backend es la fuente de verdad
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
    fetch(`${apiUrl}/api/auth/tour`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => { });
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
      completeTour();
      setShowTour(false);
    }
  };

  const handleSkip = () => {
    window.dispatchEvent(new Event("propbol:cerrar-menu-movil"));
    completeTour();
    setShowTour(false);
  };
  const theme = {
  bg:           isDark ? "#111111" : "#ffffff",
  text:         isDark ? "#ffffff" : "#111827",
  textMuted:    isDark ? "#d1d5db" : "#374151",
  textSubtle:   isDark ? "#6b7280" : "#9ca3af",
  stepInactive: isDark ? "#374151" : "#e5e7eb",
};

  if (!showTour) return null;
  

  const PADDING = 8;
  const hasValid = highlight !== null;

  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const vOffsetTop = window.visualViewport?.offsetTop ?? 0;
  const vOffsetLeft = window.visualViewport?.offsetLeft ?? 0;

  const tooltipW = Math.min(300, vw - 24);
  const isMobile = vw < 480;
  const tooltipPad = isMobile ? "12px" : "16px";
  const fontTitle = isMobile ? 13 : 14;
  const fontDesc = isMobile ? 12 : 13;
  const fontMeta = isMobile ? 10 : 11;
  const fontBtn = isMobile ? 12 : 13;
  const fontSkip = isMobile ? 11 : 12;

  let top = vOffsetTop + 80;
  let left = vOffsetLeft + (vw - tooltipW) / 2;

  if (hasValid) {
    const H = tooltipH;
    const GAP = PADDING + 12;
    const spaceBelow = vOffsetTop + vh - highlight.bottom;
    const spaceAbove = highlight.top - vOffsetTop;

    top =
      spaceBelow >= H + GAP || spaceBelow > spaceAbove
        ? highlight.bottom + GAP
        : highlight.top - H - GAP;

    const clampedH = Math.min(H, vh - 20);
    top = Math.max(vOffsetTop + 10, Math.min(top, vOffsetTop + vh - clampedH - 10));

    left = Math.max(
      vOffsetLeft + 12,
      Math.min(
        highlight.left + highlight.width / 2 - tooltipW / 2,
        vOffsetLeft + vw - tooltipW - 12,
      ),
    );
  }

  const tooltipVisible = hasValid && tooltipH > 0;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "all",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            <mask id="tm">
              <rect width="100%" height="100%" fill="white" />
              {hasValid && (
                <rect
                  x={highlight.left - PADDING}
                  y={highlight.top - PADDING}
                  width={highlight.width + PADDING * 2}
                  height={highlight.height + PADDING * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#tm)"
          />
        </svg>
      </div>

      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          top,
          left,
          width: tooltipW,
          zIndex: 9999,
          background: theme.bg,
          color: theme.text,
          borderRadius: 12,
          padding: tooltipPad,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          opacity: tooltipVisible ? 1 : 0,
          pointerEvents: tooltipVisible ? "all" : "none",
          transition: "opacity 0.15s ease",
          maxHeight: `${vh - 20}px`,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: i <= currentStep ? "#E68B25" : theme.stepInactive,
              }}
            />
          ))}
        </div>

        <p style={{ fontWeight: 700, fontSize: fontTitle, marginBottom: 4 }}>
          {TOUR_STEPS[currentStep].title}
        </p>

        <p style={{ fontSize: fontDesc, color: theme.textMuted, marginBottom: !hasValid ? 8 : 14 }}>
          {TOUR_STEPS[currentStep].description}
        </p>

        {!hasValid && (
          <p
            style={{
              fontSize: fontMeta,
              color: theme.textSubtle,
              marginBottom: 14,
            fontStyle: "italic",
            }}
          >
            Esta sección no está visible en tu dispositivo actual.
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              fontSize: fontSkip,
              color: theme.textSubtle,
              background: "none",
              border: "none",
              cursor: "pointer",
              minHeight: 44,
              padding: "0 4px",
            }}
          >
            Saltar tour
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="propbol-tour-btn-prev"
                style={{
                 background: "none",
                 color: "#E68B25",
                 border: "1px solid #E68B25",
                 borderRadius: 8,
                 padding: isMobile ? "8px 12px" : "10px 18px",
                 fontSize: fontBtn,
                 fontWeight: 600,
                 cursor: "pointer",
                 minHeight: 44,
                 backgroundColor: isDark ? "transparent" : "transparent",
                 WebkitTextFillColor: "#E68B25",
            }}
              >
                ← Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                background: "#E68B25",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: fontBtn,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              {currentStep < TOUR_STEPS.length - 1 ? "Siguiente →" : "Finalizar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}