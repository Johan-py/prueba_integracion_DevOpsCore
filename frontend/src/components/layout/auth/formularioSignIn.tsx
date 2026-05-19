"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";

type LoginResponse = {
  message?: string;
  token?: string;
  requires2FA?: boolean;
  userId?: number;
  email?: string;
  expiresInMinutes?: number;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  };
};

type MeResponse = {
  message?: string;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
    controlador?: boolean;
  };
};

type MagicLinkResponse = {
  message?: string;
};

type GooglePopupSuccessMessage = {
  type: "propbol:google-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type GooglePopupErrorMessage = {
  type: "propbol:google-login-error";
  code: "GOOGLE_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type GooglePopupMessage = GooglePopupSuccessMessage | GooglePopupErrorMessage;

type DiscordPopupSuccessMessage = {
  type: "propbol:discord-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type DiscordPopupErrorMessage = {
  type: "propbol:discord-login-error";
  code: "DISCORD_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type DiscordPopupMessage =
  | DiscordPopupSuccessMessage
  | DiscordPopupErrorMessage;

type FacebookPopupSuccessMessage = {
  type: "propbol:facebook-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type FacebookPopupErrorMessage = {
  type: "propbol:facebook-login-error";
  code: "FACEBOOK_AUTH_FAILED" | "ACCOUNT_NOT_REGISTERED" | string;
  message: string;
};

type FacebookPopupMessage =
  | FacebookPopupSuccessMessage
  | FacebookPopupErrorMessage;

type LinkedInPopupSuccessMessage = {
  type: "propbol:linkedin-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type LinkedInPopupErrorMessage = {
  type: "propbol:linkedin-login-error";
  code: string;
  message: string;
};

type LinkedInPopupMessage =
  | LinkedInPopupSuccessMessage
  | LinkedInPopupErrorMessage;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const LOGIN_TIMEOUT_MS = 10000;
const GOOGLE_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const DEFAULT_POST_LOGIN_REDIRECT = "/";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const SESSION_DURATION_MS = 60 * 60 * 1000;
const PENDING_2FA_KEY = "pending2FA";

const NO_CONNECTION_MESSAGE =
  "Sin conexión a internet. Verifica tu red e intenta nuevamente.";
const SERVER_CONNECTION_MESSAGE =
  "No se pudo conectar con el servidor. Intenta nuevamente.";
const LOGIN_TIMEOUT_MESSAGE =
  "La solicitud tardó demasiado. Por favor intenta nuevamente.";
const GOOGLE_TIMEOUT_MESSAGE =
  "La autenticación con Google tardó demasiado. Por favor intenta nuevamente.";
const FACEBOOK_TIMEOUT_MESSAGE =
  "La autenticación con Facebook tardó demasiado. Por favor intenta nuevamente.";
const DISCORD_TIMEOUT_MESSAGE =
  "La autenticación con Discord tardó demasiado. Por favor intenta nuevamente.";

const DEACTIVATED_ACCOUNT_MESSAGE = "Esta cuenta está desactivada";
const ACTIVATION_CONNECTION_ERROR_MESSAGE =
  "Ocurrió un problema de conexión. Por favor, inténtelo de nuevo más tarde";
const ACTIVATION_REQUEST_TIMEOUT_MS = 10000;
const ACTIVATION_CODE_LENGTH = 6;

const clearClientSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("propbol_session_expires");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("avatar");
  localStorage.removeItem("controlador");

  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
};

const savePending2FA = (data: {
  userId: number;
  email?: string;
  expiresInMinutes?: number;
}) => {
  localStorage.setItem(
    PENDING_2FA_KEY,
    JSON.stringify({
      userId: data.userId,
      email: data.email ?? "",
      expiresInMinutes: data.expiresInMinutes ?? 5,
      createdAt: Date.now(),
    }),
  );
};

const clearPending2FA = () => {
  localStorage.removeItem(PENDING_2FA_KEY);
};

const saveSession = (
  token: string,
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  },
  controlador?: boolean,
) => {
  localStorage.setItem("token", token);

  const sessionUser = buildSessionUser(user);

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
  localStorage.setItem("controlador", String(controlador ?? false));
  localStorage.setItem("nombre", sessionUser.name);
  localStorage.setItem("correo", sessionUser.email);
  localStorage.setItem("avatar", sessionUser.avatar ?? "");
  localStorage.setItem(
    "propbol_session_expires",
    String(Date.now() + SESSION_DURATION_MS),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
  window.dispatchEvent(new Event("propbol:token-guardado"));
};

const getRedirectAfterLogin = () => {
  const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);

  if (!redirect || !redirect.startsWith("/")) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }

  return redirect;
};

const clearRedirectAfterLogin = () => {
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
};

const isGooglePopupMessage = (value: unknown): value is GooglePopupMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "type" in value;
};

const isFacebookPopupMessage = (
  value: unknown,
): value is FacebookPopupMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "type" in value;
};

const hasNoInternetConnection = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return !navigator.onLine;
};

const getRequestErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.name === "AbortError") {
    return LOGIN_TIMEOUT_MESSAGE;
  }

  if (hasNoInternetConnection()) {
    return NO_CONNECTION_MESSAGE;
  }

  return SERVER_CONNECTION_MESSAGE;
};

const fetchCurrentUser = async (
  token: string,
): Promise<NonNullable<MeResponse["user"]>> => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as MeResponse;

  if (!response.ok || !data.user) {
    throw new Error(data.message || "No se pudo validar la sesión");
  }

  return data.user;
};

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false);

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>(
    {},
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkError, setMagicLinkError] = useState("");
  const [magicLinkSuccess, setMagicLinkSuccess] = useState("");
  const [isLoadingMagicLink, setIsLoadingMagicLink] = useState(false);

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationStep, setActivationStep] = useState<
    "options" | "password" | "code"
  >("options");
  const [activationPassword, setActivationPassword] = useState("");
  const [showActivationPassword, setShowActivationPassword] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationEmail, setActivationEmail] = useState("");
  const [activationError, setActivationError] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const activationModalRef = useRef<HTMLDivElement>(null);
  const passwordContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previousTime) => Math.max(previousTime - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const authMessage = sessionStorage.getItem("authMessage");

    if (authMessage) {
      setErrorMessage(authMessage);
      sessionStorage.removeItem("authMessage");
    }
  }, []);

  const redirectAfterSuccessfulLogin = () => {
    const redirect = getRedirectAfterLogin();
    clearRedirectAfterLogin();
    router.push(redirect);
  };

  const isFormValid =
    correo.length > 0 &&
    password.length > 0 &&
    !errors.correo &&
    !errors.password;

  const hasFormContent =
    correo.trim() !== "" ||
    password.trim() !== "" ||
    errorMessage !== "" ||
    successMessage !== "" ||
    googleError !== "";

  const handleCancel = () => {
    setCorreo("");
    setPassword("");
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleError("");
    setShowPassword(false);
    setIsLoading(false);
    setIsLoadingGoogle(false);
    setIsLoadingFacebook(false);
    setIsLoadingDiscord(false);
    setIsLoadingLinkedIn(false);
  };

  const handleOpenMagicLinkForm = () => {
    const loginEmail = correo.trim();

    setMagicLinkEmail((currentMagicLinkEmail) =>
      currentMagicLinkEmail.trim() ? currentMagicLinkEmail : loginEmail,
    );
    setMagicLinkError("");
    setMagicLinkSuccess("");
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleError("");
    setShowMagicLinkForm(true);
  };

  const handleBackToLogin = () => {
    setMagicLinkError("");
    setMagicLinkSuccess("");
    setIsLoadingMagicLink(false);
    setShowMagicLinkForm(false);
  };

  const handleMagicLinkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoadingMagicLink) {
      return;
    }

    const shouldResendMagicLink = Boolean(magicLinkSuccess);
    const trimmedEmail = magicLinkEmail.trim().toLowerCase();

    setMagicLinkEmail(trimmedEmail);
    setMagicLinkError("");
    setMagicLinkSuccess("");

    if (!trimmedEmail) {
      setMagicLinkError("El correo es obligatorio");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setMagicLinkError("Formato de correo inválido");
      return;
    }

    if (hasNoInternetConnection()) {
      setMagicLinkError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingMagicLink(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, LOGIN_TIMEOUT_MS);

    try {
      const magicLinkEndpoint = shouldResendMagicLink ? "resend" : "request";

      const response = await fetch(
        `${API_URL}/api/auth/magic-link/${magicLinkEndpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: trimmedEmail,
          }),
          signal: controller.signal,
        },
      );

      const data = (await response.json()) as MagicLinkResponse;

      if (!response.ok) {
        setMagicLinkError(
          data.message || "No se pudo solicitar el link mágico.",
        );
        return;
      }

      sessionStorage.setItem("magicLinkEmail", trimmedEmail);

      setMagicLinkSuccess(
        data.message ||
          (shouldResendMagicLink
            ? "Te reenviamos un nuevo link mágico a tu correo electrónico."
            : "Te enviamos un link mágico a tu correo electrónico."),
      );
    } catch (error) {
      setMagicLinkError(getRequestErrorMessage(error));
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoadingMagicLink(false);
    }
  };

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === "correo") {
      if (!value) {
        newErrors.correo = "El correo es obligatorio";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.correo = "Formato de correo inválido";
      } else {
        delete newErrors.correo;
      }
    }

    if (field === "password") {
      if (!value) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (value.length > 16) {
        newErrors.password =
          "La contraseña no puede tener más de 16 caracteres";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const finalizeValidatedSession = async (
    token: string,
    fallbackUser?: LoginResponse["user"],
  ) => {
    const validatedUser = await fetchCurrentUser(token);

    if (!validatedUser) {
      throw new Error("No se pudo obtener el usuario autenticado.");
    }

    saveSession(
      token,
      {
        id: validatedUser.id,
        correo: validatedUser.correo,
        nombre: validatedUser.nombre ?? fallbackUser?.nombre,
        apellido: validatedUser.apellido ?? fallbackUser?.apellido,
        avatar: validatedUser.avatar ?? fallbackUser?.avatar ?? null,
      },
      validatedUser.controlador,
    );
  };

  const handleGoogleLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingGoogle(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/google/login`,
      "google-login",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed === "undefined"
    ) {
      setGoogleError(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.",
      );
      setIsLoadingGoogle(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let googleTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(googleTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingGoogle(false);
      }
    }

    async function handleMessage(event: MessageEvent<GooglePopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      if (!isGooglePopupMessage(event.data)) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (event.data.type === "propbol:google-login-success") {
        try {
          await finalizeValidatedSession(event.data.token, event.data.user);

          setSuccessMessage(
            event.data.message || "Inicio de sesión con Google exitoso",
          );
          setGoogleError("");
          setIsLoadingGoogle(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Google.",
          );
          setIsLoadingGoogle(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(
        event.data.message || "No se pudo iniciar sesión con Google.",
      );
      setIsLoadingGoogle(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved) {
        clearClientSession();

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    googleTimeoutId = window.setTimeout(() => {
      cleanup();
      clearClientSession();

      if (!popup.closed) {
        popup.close();
      }

      setGoogleError(
        hasNoInternetConnection()
          ? NO_CONNECTION_MESSAGE
          : GOOGLE_TIMEOUT_MESSAGE,
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  const handleLinkedInLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingLinkedIn(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/linkedin/login`,
      "linkedin-login",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed === "undefined"
    ) {
      setGoogleError(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.",
      );
      setIsLoadingLinkedIn(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let linkedinTimeoutId = 0;
    let wasTimeout = false;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(linkedinTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingLinkedIn(false);
      }
    }

    async function handleMessage(event: MessageEvent<LinkedInPopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        typeof data !== "object" ||
        !("type" in data) ||
        (data.type !== "propbol:linkedin-login-success" &&
          data.type !== "propbol:linkedin-login-error")
      ) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (data.type === "propbol:linkedin-login-success") {
        try {
          await finalizeValidatedSession(data.token, data.user);

          localStorage.setItem(
            "welcome_message",
            `¡Bienvenido, ${data.user.nombre ?? ""}! Has iniciado sesión con LinkedIn.`,
          );

          setSuccessMessage(
            data.message || "Inicio de sesión con LinkedIn exitoso",
          );
          setGoogleError("");
          setIsLoadingLinkedIn(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con LinkedIn.",
          );
          setIsLoadingLinkedIn(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(data.message || "No se pudo iniciar sesión con LinkedIn.");
      setIsLoadingLinkedIn(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved && !wasTimeout) {
        clearClientSession();

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con LinkedIn. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    linkedinTimeoutId = window.setTimeout(() => {
      wasTimeout = true;
      cleanup();
      clearClientSession();

      if (!popup.closed) {
        popup.close();
      }

      if (!authWasResolved) {
        setGoogleError(
          hasNoInternetConnection()
            ? NO_CONNECTION_MESSAGE
            : "El tiempo de autorización con LinkedIn expiró. Por favor, inténtalo nuevamente.",
        );
      }
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCorreo = correo.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const newErrors: { correo?: string; password?: string } = {};

    if (!trimmedCorreo) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(trimmedCorreo)) {
      newErrors.correo = "Formato de correo inválido";
    }

    if (!trimmedPassword) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleError("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (hasNoInternetConnection()) {
      setPassword("");
      setErrorMessage(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoading(true);
    clearClientSession();
    clearPending2FA();

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, LOGIN_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: trimmedCorreo,
          password: trimmedPassword,
        }),
        signal: controller.signal,
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setPassword("");

        if (response.status === 403) {
          setActivationEmail(trimmedCorreo);
          setErrorMessage(DEACTIVATED_ACCOUNT_MESSAGE);
          return;
        }

        if (response.status === 404) {
          setErrorMessage(
            "Esta cuenta no está registrada. Puedes registrarte para crear una cuenta.",
          );
          return;
        }

        setErrorMessage(data.message || "Error al iniciar sesión");
        return;
      }

      if (data.requires2FA) {
        if (!data.userId) {
          clearClientSession();
          setErrorMessage("No se pudo iniciar la verificación en dos pasos");
          return;
        }

        savePending2FA({
          userId: data.userId,
          email: data.email,
          expiresInMinutes: data.expiresInMinutes,
        });

        setSuccessMessage(
          data.message || "Te enviamos un código de verificación",
        );
        setPassword("");

        window.setTimeout(() => {
          router.push("/sign-in/verify-2fa");
        }, 800);

        return;
      }

      if (!data.token) {
        clearClientSession();
        setErrorMessage("El servidor no devolvió un token válido");
        return;
      }

      await finalizeValidatedSession(data.token, data.user);

      setSuccessMessage(data.message || "Inicio de sesión exitoso");

      window.setTimeout(() => {
        redirectAfterSuccessfulLogin();
      }, 1000);
    } catch (error) {
      clearClientSession();
      setPassword("");
      setErrorMessage(getRequestErrorMessage(error));
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const closeActivationModal = () => {
    setShowActivationModal(false);
    setActivationStep("options");
    setActivationPassword("");
    setShowActivationPassword(false);
    setActivationCode("");
    setActivationError("");
    setTimeLeft(0);
  };

  const handleActivateByPassword = async () => {
    const trimmedPassword = activationPassword.trim();

    if (!trimmedPassword) {
      setActivationError("La contraseña es obligatoria");
      return;
    }

    if (isActivating) {
      return;
    }

    if (!navigator.onLine) {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, ACTIVATION_REQUEST_TIMEOUT_MS);

    setActivationError("");
    setIsActivating(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/activate-by-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: activationEmail,
          password: trimmedPassword,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status >= 500) {
        setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
        return;
      }

      if (!response.ok) {
        setActivationError(data.message || "Error al activar la cuenta");
        return;
      }

      setSuccessMessage(
        data.message || "Cuenta activada correctamente. Ahora puedes iniciar sesión.",
      );
      setErrorMessage("");
      setPassword("");
      closeActivationModal();
      router.push("/sign-in");
    } catch {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
    } finally {
      window.clearTimeout(timeoutId);
      setIsActivating(false);
    }
  };

  const handleRequestActivationCode = async () => {
    if (!activationEmail) {
      setActivationError("No se encontró el correo de la cuenta.");
      return;
    }

    if (isActivating) {
      return;
    }

    if (!navigator.onLine) {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, ACTIVATION_REQUEST_TIMEOUT_MS);

    setActivationError("");
    setIsActivating(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/request-activation-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: activationEmail }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status >= 500) {
        setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
        return;
      }

      if (!response.ok) {
        setActivationError(data.message || "Error al enviar el código");
        return;
      }

      setActivationStep("code");
      setActivationCode("");
      setTimeLeft(60);
    } catch {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
    } finally {
      window.clearTimeout(timeoutId);
      setIsActivating(false);
    }
  };

  const handleActivateByCode = async () => {
    const trimmedCode = activationCode.trim();

    if (!trimmedCode) {
      setActivationError("El código es obligatorio");
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setActivationError("El código debe tener exactamente 6 dígitos numéricos");
      return;
    }

    if (isActivating) {
      return;
    }

    if (!navigator.onLine) {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, ACTIVATION_REQUEST_TIMEOUT_MS);

    setActivationError("");
    setIsActivating(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/activate-by-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: activationEmail,
          codigo: trimmedCode,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status >= 500) {
        setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
        return;
      }

      if (!response.ok) {
        setActivationError(data.message || "Error al activar la cuenta");
        return;
      }

      setSuccessMessage(
        data.message || "Cuenta activada correctamente. Ahora puedes iniciar sesión.",
      );
      setErrorMessage("");
      setPassword("");
      closeActivationModal();
      router.push("/sign-in");
    } catch {
      setActivationError(ACTIVATION_CONNECTION_ERROR_MESSAGE);
    } finally {
      window.clearTimeout(timeoutId);
      setIsActivating(false);
    }
  };

  useEffect(() => {
    if (!showActivationModal) {
      return;
    }

    const modal = activationModalRef.current;

    const getFocusableElements = () => {
      if (!modal) {
        return [];
      }

      return Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeActivationModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements();

      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showActivationModal, activationStep, isActivating]);

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");

    if (!name || !domain) {
      return email;
    }

    const visiblePart = name.slice(0, 3);
    const hiddenPart = "*".repeat(Math.max(name.length - 3, 3));

    return `${visiblePart}${hiddenPart}@${domain}`;
  };

  const handleFacebookLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingFacebook(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/facebook/login`,
      "facebook-login",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed === "undefined"
    ) {
      setGoogleError(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.",
      );
      setIsLoadingFacebook(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let facebookTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(facebookTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingFacebook(false);
      }
    }

    async function handleMessage(event: MessageEvent<FacebookPopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      if (!isFacebookPopupMessage(event.data)) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (event.data.type === "propbol:facebook-login-success") {
        try {
          await finalizeValidatedSession(event.data.token, event.data.user);

          setSuccessMessage(
            event.data.message || "Inicio de sesión con Facebook exitoso",
          );
          setGoogleError("");
          setIsLoadingFacebook(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Facebook.",
          );
          setIsLoadingFacebook(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(
        event.data.message || "No se pudo iniciar sesión con Facebook.",
      );
      setIsLoadingFacebook(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved) {
        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con Facebook. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    facebookTimeoutId = window.setTimeout(() => {
      cleanup();

      if (!popup.closed) {
        popup.close();
      }

      if (!authWasResolved) {
        setGoogleError(FACEBOOK_TIMEOUT_MESSAGE);
      }
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  const handleDiscordLogin = () => {
    clearClientSession();
    setGoogleError("");
    setErrorMessage("");
    setSuccessMessage("");

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE);
      return;
    }

    setIsLoadingDiscord(true);

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      `${API_URL}/api/auth/discord/login`,
      "discord-login",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed === "undefined"
    ) {
      setGoogleError(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.",
      );
      setIsLoadingDiscord(false);
      return;
    }

    const popup = popupWindow;
    popup.focus();

    const expectedOrigin = new URL(API_URL).origin;
    let authWasResolved = false;
    let checkPopupIntervalId = 0;
    let discordTimeoutId = 0;

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(checkPopupIntervalId);
      window.clearTimeout(discordTimeoutId);

      if (shouldStopLoading) {
        setIsLoadingDiscord(false);
      }
    }

    async function handleMessage(event: MessageEvent<DiscordPopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        typeof data !== "object" ||
        !("type" in data) ||
        (data.type !== "propbol:discord-login-success" &&
          data.type !== "propbol:discord-login-error")
      ) {
        return;
      }

      authWasResolved = true;
      cleanup(false);

      if (data.type === "propbol:discord-login-success") {
        try {
          await finalizeValidatedSession(data.token, data.user);

          setSuccessMessage(
            data.message || "Inicio de sesión con Discord exitoso",
          );
          setGoogleError("");
          setIsLoadingDiscord(false);
          popup.close();

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin();
          }, 1000);
        } catch (error) {
          clearClientSession();
          setGoogleError(
            error instanceof Error
              ? error.message
              : "No se pudo consolidar la sesión con Discord.",
          );
          setIsLoadingDiscord(false);
          popup.close();
        }

        return;
      }

      clearClientSession();
      setGoogleError(data.message || "No se pudo iniciar sesión con Discord.");
      setIsLoadingDiscord(false);
      popup.close();
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      cleanup();

      if (!authWasResolved) {
        clearClientSession();

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE);
          return;
        }

        setGoogleError(
          "Cancelaste el inicio de sesión con Discord. Puedes intentarlo nuevamente.",
        );
      }
    }, 500);

    discordTimeoutId = window.setTimeout(() => {
      cleanup();
      clearClientSession();

      if (!popup.closed) {
        popup.close();
      }

      setGoogleError(
        hasNoInternetConnection()
          ? NO_CONNECTION_MESSAGE
          : DISCORD_TIMEOUT_MESSAGE,
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);

    window.addEventListener("message", handleMessage);
  };

  if (showMagicLinkForm) {
    return (
      <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Ingresa sin contraseña
        </h1>

        <p className="mb-6 text-sm leading-6 text-gray-600">
          Te enviaremos un enlace de acceso único a tu correo electrónico.
        </p>

        <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              autoFocus
              placeholder="Ingresa tu correo electrónico"
              value={magicLinkEmail}
              onChange={(event) => {
                const value = event.target.value;

                setMagicLinkEmail(value);
                setMagicLinkSuccess("");

                if (!value.trim()) {
                  setMagicLinkError("");
                  return;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                  setMagicLinkError("Formato de correo inválido");
                  return;
                }

                setMagicLinkError("");
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          {magicLinkError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {magicLinkError}
            </p>
          )}

          {magicLinkSuccess && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {magicLinkSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoadingMagicLink}
            className={`w-full rounded-md py-2.5 text-sm font-semibold text-white transition ${
              isLoadingMagicLink
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isLoadingMagicLink
              ? magicLinkSuccess
                ? "Reenviando..."
                : "Enviando..."
              : magicLinkSuccess
                ? "Solicitar nuevo enlace"
                : "Enviar link mágico"}
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full rounded-md bg-[#1f2937] py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827]"
          >
            Volver al inicio de sesión
          </button>

          <p className="pt-4 text-center text-xs text-gray-500">
            El enlace expirará en 15 minutos y solo podrá usarse una vez.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            autoFocus
            placeholder="Ingresa tu correo electrónico"
            value={correo}
            onChange={(event) => {
              setCorreo(event.target.value);
              validate("correo", event.target.value);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />

          {errors.correo && (
            <p className="mt-1 text-xs text-red-500">{errors.correo}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>

          <div
            className="relative"
            ref={passwordContainerRef}
            onBlur={(event) => {
              if (
                !passwordContainerRef.current?.contains(
                  event.relatedTarget as Node,
                )
              ) {
                setShowPassword(false);
              }
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Ingresa tu contraseña"
              value={password}
              maxLength={16}
              onChange={(event) => {
                setPassword(event.target.value);
                validate("password", event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="-mt-2 text-left">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-orange-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {errorMessage === DEACTIVATED_ACCOUNT_MESSAGE ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-600">
              {DEACTIVATED_ACCOUNT_MESSAGE}
            </p>

            <p className="mt-2 text-xs text-gray-600">
              Puedes solicitar su activación para volver a ingresar.
            </p>

            <button
              type="button"
              onClick={() => {
                setActivationStep("options");
                setActivationError("");
                setShowActivationModal(true);
              }}
              className="mt-3 text-sm font-medium text-orange-500 hover:underline"
            >
              Activar cuenta
            </button>
          </div>
        ) : (
          errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )
        )}

        {successMessage && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
            !isFormValid || isLoading
              ? "cursor-not-allowed bg-orange-300"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={handleOpenMagicLinkForm}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-orange-500 bg-white py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
        >
          <span aria-hidden="true">🔗</span>
          Ingresar con link mágico
        </button>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d6d3d1] bg-white px-4 py-2.5 text-[13px] font-medium text-[#292524] transition hover:bg-[#fafaf9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.28 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.28 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.161 0 9.86-1.977 13.409-5.196l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.173 0-9.62-3.326-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.566l.003-.002 6.19 5.238C36.973 39.2 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>

            {isLoadingGoogle
              ? "Conectando con Google..."
              : "Continuar con Google"}
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoadingFacebook}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-base font-bold text-white">
              f
            </span>
            {isLoadingFacebook
              ? "Conectando con Facebook..."
              : "Continuar con Facebook"}
          </button>

          <button
            type="button"
            onClick={handleDiscordLogin}
            disabled={isLoadingDiscord}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-white"
              aria-hidden="true"
            >
              <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.191.328-.403.769-.552 1.117a18.27 18.27 0 0 0-5.333 0A11.64 11.64 0 0 0 9.448 3a19.736 19.736 0 0 0-4.433 1.369C2.211 8.58 1.443 12.686 1.826 16.735A19.923 19.923 0 0 0 7.239 19.5c.438-.6.828-1.235 1.164-1.904-.634-.24-1.239-.541-1.813-.896.152-.111.301-.227.445-.347 3.495 1.643 7.285 1.643 10.739 0 .146.12.294.236.446.347-.575.355-1.182.656-1.817.896.336.669.726 1.304 1.164 1.904a19.874 19.874 0 0 0 5.416-2.765c.451-4.695-.769-8.763-3.666-12.366ZM9.349 14.546c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.84 2.154-1.909 2.154Zm5.303 0c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.831 2.154-1.909 2.154Z" />
            </svg>
            {isLoadingDiscord
              ? "Conectando con Discord..."
              : "Continuar con Discord"}
          </button>

          <button
            type="button"
            onClick={handleLinkedInLogin}
            disabled={isLoadingLinkedIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0A66C2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#004182] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-white"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {isLoadingLinkedIn
              ? "Conectando con LinkedIn..."
              : "Continuar con LinkedIn"}
          </button>
        </div>

        {googleError && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {googleError}
          </p>
        )}

        <button
          type="button"
          onClick={handleCancel}
          disabled={!hasFormContent}
          className={`mx-auto block rounded-md px-4 py-2 text-[11px] font-semibold transition ${
            hasFormContent
              ? "bg-[#292524] text-white hover:bg-[#1c1917]"
              : "cursor-not-allowed bg-[#d6d3d1] text-[#a8a29e]"
          }`}
        >
          Cancelar Inicio de sesión
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-orange-500 hover:underline"
        >
          Regístrate
        </Link>
      </p>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-2 w-full text-center text-[12px] font-medium text-[#57534e] underline transition hover:text-[#292524]"
      >
        Ir a la página principal
      </button>

      {showActivationModal && (
        <div
          onClick={closeActivationModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          {activationStep === "password" && (
            <div
              ref={activationModalRef}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900">
                Activar cuenta
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Ingresa tu contraseña para activar tu cuenta.
              </p>

              <div className="mt-5">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showActivationPassword ? "text" : "password"}
                    value={activationPassword}
                    onChange={(event) =>
                      setActivationPassword(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") {
                        return;
                      }

                      event.preventDefault();

                      if (!isActivating && activationPassword.trim()) {
                        handleActivateByPassword();
                      }
                    }}
                    placeholder="Ingresa tu contraseña"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-16 text-sm outline-none focus:border-orange-500"
                    disabled={isActivating}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowActivationPassword(!showActivationPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-orange-500 hover:underline"
                  >
                    {showActivationPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>

                {activationError && (
                  <p className="mt-2 text-xs text-red-500">{activationError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActivationStep("options");
                  setActivationPassword("");
                  setShowActivationPassword(false);
                  setActivationError("");
                }}
                disabled={isActivating}
                className="mt-4 text-sm font-medium text-gray-500 underline hover:text-gray-700 disabled:opacity-50"
              >
                ← Volver
              </button>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeActivationModal}
                  disabled={isActivating}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleActivateByPassword}
                  disabled={isActivating || !activationPassword.trim()}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:bg-orange-300"
                >
                  {isActivating ? "Activando..." : "Confirmar"}
                </button>
              </div>
            </div>
          )}

          {activationStep === "code" && (
            <div
              ref={activationModalRef}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900">
                Activar cuenta
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Hemos enviado un código de verificación a tu correo electrónico.
                Ingresa el código para activar tu cuenta.
              </p>

              <div className="mt-5">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Código de verificación
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={activationCode}
                  onChange={(event) => {
                    const onlyNumbers = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, ACTIVATION_CODE_LENGTH);

                    setActivationCode(onlyNumbers);
                  }}
                  onPaste={(event) => {
                    event.preventDefault();

                    const pastedText = event.clipboardData.getData("text");
                    const onlyNumbers = pastedText
                      .replace(/\D/g, "")
                      .slice(0, ACTIVATION_CODE_LENGTH);

                    setActivationCode(onlyNumbers);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") {
                      return;
                    }

                    event.preventDefault();

                    if (
                      !isActivating &&
                      activationCode.length === ACTIVATION_CODE_LENGTH
                    ) {
                      handleActivateByCode();
                    }
                  }}
                  placeholder="Ingresa tu código"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  disabled={isActivating}
                />

                {activationError && (
                  <p className="mt-2 text-xs text-red-500">{activationError}</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActivationStep("options");
                    setActivationCode("");
                    setActivationError("");
                  }}
                  disabled={isActivating}
                  className="text-sm font-medium text-gray-500 underline hover:text-gray-700 disabled:opacity-50"
                >
                  ← Volver
                </button>

                {timeLeft > 0 ? (
                  <p className="text-xs text-gray-500">
                    Reenviar en {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestActivationCode}
                    disabled={isActivating}
                    className="text-xs font-semibold text-orange-500 hover:underline disabled:opacity-50"
                  >
                    Volver a enviar
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeActivationModal}
                  disabled={isActivating}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleActivateByCode}
                  disabled={
                    isActivating ||
                    activationCode.length !== ACTIVATION_CODE_LENGTH
                  }
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:bg-orange-300"
                >
                  {isActivating ? "Activando..." : "Confirmar"}
                </button>
              </div>
            </div>
          )}

          {activationStep === "options" && (
            <div
              ref={activationModalRef}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            >
              <button
                type="button"
                onClick={closeActivationModal}
                className="absolute right-4 top-4 text-2xl font-medium text-gray-700 hover:text-gray-900"
                aria-label="Cerrar ventana"
              >
                ×
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                Activar cuenta
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Correo asociado:{" "}
                <span className="font-medium text-gray-700">
                  {maskEmail(activationEmail)}
                </span>
              </p>

              <p className="mt-5 text-sm text-gray-600">
                Escoja el método de activación
              </p>

              <div className="mt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setActivationStep("password")}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                      🔒
                    </span>
                    Contraseña
                  </span>

                  <span className="text-xl text-gray-700">›</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestActivationCode}
                  disabled={isActivating}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                      ✉️
                    </span>
                    {isActivating ? "Enviando..." : "Código de Verificación"}
                  </span>

                  <span className="text-xl text-gray-700">›</span>
                </button>
              </div>

              {activationError && (
                <p className="mt-3 text-xs text-red-500">{activationError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
