"use client";

import { Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const MENSAJE_SALIDA_SIN_GUARDAR =
  "Tienes cambios sin guardar. Si sales ahora, la nueva contraseña no se guardará. ¿Deseas continuar?";

type PasswordFieldProps = Readonly<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}>;

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>

      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3">
        <LockKeyhole className="h-4 w-4 text-neutral-400" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full border-none bg-transparent px-3 text-sm text-neutral-900 outline-none disabled:cursor-not-allowed disabled:text-neutral-400"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-neutral-400 transition hover:text-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-300"
          aria-label={
            showPassword
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSection() {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null);
  const [tiempoActual, setTiempoActual] = useState(() => Date.now());
  const bloqueoHistorialActivado = useRef(false);

  const formularioTieneCambios =
    passwordActual.trim() !== "" ||
    nuevaPassword.trim() !== "" ||
    confirmarPassword.trim() !== "";

  const PASSWORD_SEGURA_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const MENSAJE_PASSWORD_SEGURA =
    "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";

  const usuarioGuardado =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("propbol_user") || "{}")
      : {};

  const usuarioKey =
    usuarioGuardado?.email || usuarioGuardado?.correo || "anonimo";

  const claveIntentos = useMemo(
    () => `cambio_password_intentos_${usuarioKey}`,
    [usuarioKey]
  );

  const claveBloqueo = useMemo(
    () => `cambio_password_bloqueado_hasta_${usuarioKey}`,
    [usuarioKey]
  );

  const bloqueado =
  bloqueadoHasta !== null && tiempoActual < Number(bloqueadoHasta);

  const tiempoRestanteBloqueo = useMemo(() => {
    if (!bloqueadoHasta) return null;

    const diferenciaMs = bloqueadoHasta - tiempoActual;

    if (diferenciaMs <= 0) return null;

    const totalSegundos = Math.ceil(diferenciaMs / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    if (minutos <= 0) {
      return `${segundos} segundo(s)`;
    }

    return `${minutos} minuto(s) y ${segundos} segundo(s)`;
  }, [bloqueadoHasta, tiempoActual]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const intentosGuardados = localStorage.getItem(claveIntentos);
    const bloqueoGuardado = localStorage.getItem(claveBloqueo);

    if (intentosGuardados) {
      setIntentosFallidos(Number(intentosGuardados));
    } else {
      setIntentosFallidos(0);
    }

    if (bloqueoGuardado) {
      const tiempoBloqueo = Number(bloqueoGuardado);

      if (Date.now() < tiempoBloqueo) {
        setBloqueadoHasta(tiempoBloqueo);
      } else {
        localStorage.removeItem(claveIntentos);
        localStorage.removeItem(claveBloqueo);
        setBloqueadoHasta(null);
        setIntentosFallidos(0);
      }
    } else {
      setBloqueadoHasta(null);
    }
  }, [claveIntentos, claveBloqueo]);

  useEffect(() => {
  if (!bloqueadoHasta) return;

  const intervalo = setInterval(() => {
    const ahora = Date.now();

    setTiempoActual(ahora);

    if (ahora >= bloqueadoHasta) {
      setBloqueadoHasta(null);
      setIntentosFallidos(0);
      localStorage.removeItem(claveIntentos);
      localStorage.removeItem(claveBloqueo);
      clearInterval(intervalo);
    }
  }, 1000);

  return () => clearInterval(intervalo);
}, [bloqueadoHasta, claveIntentos, claveBloqueo]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!formularioTieneCambios) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formularioTieneCambios]);

  useEffect(() => {
    const handleIntentoSalida = (event: MouseEvent) => {
      if (!formularioTieneCambios) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const estaDentroDelFormulario = target.closest(
        "[data-password-form='true']"
      );

      if (estaDentroDelFormulario) return;

      const enlace = target.closest("a[href]") as HTMLAnchorElement | null;
      const botonConNavegacion = target.closest(
        "[data-confirm-exit='true']"
      ) as HTMLElement | null;

      if (!enlace && !botonConNavegacion) return;

      if (enlace) {
        const mismaPagina = enlace.href === window.location.href;

        if (mismaPagina) return;
      }

      const confirmaSalida = window.confirm(MENSAJE_SALIDA_SIN_GUARDAR);

      if (!confirmaSalida) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener("click", handleIntentoSalida, true);

    return () => {
      document.removeEventListener("click", handleIntentoSalida, true);
    };
  }, [formularioTieneCambios]);

  useEffect(() => {
    if (!formularioTieneCambios) {
      bloqueoHistorialActivado.current = false;
      return;
    }

    if (!bloqueoHistorialActivado.current) {
      window.history.pushState(
        { bloqueoFormularioPassword: true },
        "",
        window.location.href
      );
      bloqueoHistorialActivado.current = true;
    }

    const handlePopState = () => {
      const confirmaSalida = window.confirm(MENSAJE_SALIDA_SIN_GUARDAR);

      if (!confirmaSalida) {
        window.history.pushState(
          { bloqueoFormularioPassword: true },
          "",
          window.location.href
        );
        return;
      }

      bloqueoHistorialActivado.current = false;
      window.removeEventListener("popstate", handlePopState);
      window.history.back();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formularioTieneCambios]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setSuccess("");

    if (bloqueado) {
  setError(
    tiempoRestanteBloqueo
      ? `La acción está bloqueada. Intenta nuevamente en ${tiempoRestanteBloqueo}.`
      : "La acción está bloqueada temporalmente. Intenta más tarde."
  );
  return;
}

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    if (
      !passwordActual.trim() ||
      !nuevaPassword.trim() ||
      !confirmarPassword.trim()
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!PASSWORD_SEGURA_REGEX.test(nuevaPassword.trim())) {
      setError(MENSAJE_PASSWORD_SEGURA);
      return;
    }

    if (passwordActual.trim() === nuevaPassword.trim()) {
      setError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    if (nuevaPassword.trim() !== confirmarPassword.trim()) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/perfil/cambiar-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordActual: passwordActual.trim(),
          nuevaPassword: nuevaPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (typeof data.intentosFallidos === "number") {
          setIntentosFallidos(data.intentosFallidos);
          localStorage.setItem(claveIntentos, String(data.intentosFallidos));
        }

        if (data.bloqueado && data.bloqueoHasta) {
          const tiempoBloqueo = new Date(data.bloqueoHasta).getTime();
          setBloqueadoHasta(tiempoBloqueo);
          localStorage.setItem(claveBloqueo, String(tiempoBloqueo));
        }

        throw new Error(data.msg || "Error al actualizar la contraseña");
      }

      setIntentosFallidos(0);
      setBloqueadoHasta(null);
      localStorage.removeItem(claveIntentos);
      localStorage.removeItem(claveBloqueo);

      setSuccess("Contraseña actualizada correctamente");
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la contraseña";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Cambiar contraseña
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Actualiza tu contraseña para mantener tu cuenta segura.
        </p>
      </header>

      <div className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form
          data-password-form="true"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <PasswordField
            label="Ingresa tu contraseña actual"
            placeholder="••••••••"
            value={passwordActual}
            onChange={setPasswordActual}
            disabled={isLoading || bloqueado}
          />

          <PasswordField
            label="Ingresa tu nueva contraseña"
            placeholder="••••••••"
            value={nuevaPassword}
            onChange={setNuevaPassword}
            disabled={isLoading || bloqueado}
          />

          <PasswordField
            label="Confirma tu nueva contraseña"
            placeholder="••••••••"
            value={confirmarPassword}
            onChange={setConfirmarPassword}
            disabled={isLoading || bloqueado}
          />

          {error && !bloqueado && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          {bloqueado && (
            <p className="text-sm font-medium text-red-600">
              La acción está bloqueada temporalmente.
              {tiempoRestanteBloqueo && (
                <> Intenta nuevamente en {tiempoRestanteBloqueo}.</>
              )}
            </p>
          )}

          {!error && intentosFallidos > 0 && !bloqueado && (
            <p className="text-sm font-medium text-amber-600">
              Intentos fallidos: {intentosFallidos} de 5
            </p>
          )}

          {success && (
            <p className="text-sm font-medium text-green-600">{success}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || bloqueado}
            className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
              isLoading || bloqueado
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isLoading ? (
  <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : bloqueado && tiempoRestanteBloqueo ? (
              `Bloqueado ${tiempoRestanteBloqueo}`
            ) : bloqueado ? (
              "Bloqueado"
            ) : (
              "Cambiar contraseña"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}