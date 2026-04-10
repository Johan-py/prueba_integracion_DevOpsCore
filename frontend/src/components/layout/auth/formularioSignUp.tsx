"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import GoogleRegisterButton from "@/components/layout/auth/google/GoogleRegisterButton";
import { validateEmail, validatePassword } from "@/lib/validators/auth";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type TouchedFields = Partial<Record<keyof FormData, boolean>>;

type RegisterResponse = {
  message?: string;
  email?: string;
  verificationToken?: string;
  requiresEmailVerification?: boolean;
  expiresInMinutes?: number;
};

type GoogleAuthSuccessPayload = {
  type: "propbol:google-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre: string;
    apellido: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SESSION_DURATION_MS = 3 * 60 * 1000;

const initialFormData: FormData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function validateFirstName(value: string): string | undefined {
  const normalized = value.trim();

  if (!normalized) return "El nombre es obligatorio";
  if (normalized.length < 2)
    return "El nombre debe tener al menos 2 caracteres";
  if (normalized.length > 30) return "El nombre no puede superar 30 caracteres";

  return undefined;
}

function validateLastName(value: string): string | undefined {
  const normalized = value.trim();

  if (!normalized) return "El apellido es obligatorio";
  if (normalized.length < 2) {
    return "El apellido debe tener al menos 2 caracteres";
  }
  if (normalized.length > 30) {
    return "El apellido no puede superar 30 caracteres";
  }

  return undefined;
}

function validatePhone(value: string): string | undefined {
  const normalized = value.trim();

  if (!normalized) return "El número de teléfono es obligatorio";
  if (!/^\d{7,15}$/.test(normalized)) {
    return "Ingresa un número de teléfono válido";
  }

  return undefined;
}

function validateConfirmPassword(
  confirmPassword: string,
  password: string,
): string | undefined {
  const normalizedConfirm = confirmPassword.trim();
  const normalizedPassword = password.trim();

  if (!normalizedConfirm) return "Debes confirmar tu contraseña";
  if (normalizedConfirm !== normalizedPassword) {
    return "Las contraseñas no coinciden";
  }

  return undefined;
}

function getInputClasses(hasError: boolean, withRightIcon = false) {
  return [
    "w-full rounded-md border bg-white py-3 text-[14px] text-[#292524] outline-none transition",
    "pl-10",
    withRightIcon ? "pr-10" : "pr-3",
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#d6d3d1] focus:border-amber-500",
    "placeholder:text-[#a8a29e]",
  ].join(" ");
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[13px] font-medium text-[#292524]"
    >
      {children}
    </label>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;

  return (
    <p id={id} className="mt-1 text-[11px] text-red-500">
      {error}
    </p>
  );
}

const saveSession = (payload: GoogleAuthSuccessPayload) => {
  const userName =
    payload.user.nombre && payload.user.apellido
      ? `${payload.user.nombre} ${payload.user.apellido}`
      : payload.user.nombre || payload.user.correo || "Usuario";

  localStorage.setItem("token", payload.token);
  localStorage.setItem(
    "propbol_user",
    JSON.stringify({
      name: userName,
      email: payload.user.correo,
      avatar: null,
    }),
  );
  localStorage.setItem("nombre", userName);
  localStorage.setItem("correo", payload.user.correo);
  localStorage.setItem("avatar", "");
  localStorage.setItem(
    "propbol_session_expires",
    String(Date.now() + SESSION_DURATION_MS),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
};

export default function SignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordContainerRef = useRef<HTMLDivElement | null>(null);
  const confirmPasswordContainerRef = useRef<HTMLDivElement | null>(null);

  const handleChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      setServerError("");

      if (field === "email") {
        setErrors((prev) => ({
          ...prev,
          email: validateEmail(value) || undefined,
        }));
      }

      if (field === "firstName") {
        setErrors((prev) => ({
          ...prev,
          firstName: validateFirstName(value),
        }));
      }

      if (field === "lastName") {
        setErrors((prev) => ({
          ...prev,
          lastName: validateLastName(value),
        }));
      }

      if (field === "phone") {
        setErrors((prev) => ({
          ...prev,
          phone: validatePhone(value),
        }));
      }

      if (field === "password") {
        const passwordError = validatePassword(value);

        setErrors((prev) => ({
          ...prev,
          password: passwordError || undefined,
          confirmPassword:
            formData.confirmPassword.trim() === ""
              ? prev.confirmPassword
              : validateConfirmPassword(formData.confirmPassword, value),
        }));
      }

      if (field === "confirmPassword") {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, formData.password),
        }));
      }
    };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(formData.email) || undefined,
      }));
    }

    if (field === "firstName") {
      setErrors((prev) => ({
        ...prev,
        firstName: validateFirstName(formData.firstName),
      }));
    }

    if (field === "lastName") {
      setErrors((prev) => ({
        ...prev,
        lastName: validateLastName(formData.lastName),
      }));
    }

    if (field === "phone") {
      setErrors((prev) => ({
        ...prev,
        phone: validatePhone(formData.phone),
      }));
    }

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(formData.password) || undefined,
      }));
    }

    if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(
          formData.confirmPassword,
          formData.password,
        ),
      }));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setServerError("");
    setIsSubmitting(false);
  };

  const hasFormContent = useMemo(() => {
    return (
      formData.email.trim() !== "" ||
      formData.firstName.trim() !== "" ||
      formData.lastName.trim() !== "" ||
      formData.phone.trim() !== "" ||
      formData.password.trim() !== "" ||
      formData.confirmPassword.trim() !== "" ||
      serverError !== ""
    );
  }, [formData, serverError]);

  const isFormValid = useMemo(() => {
    const requiredFieldsCompleted =
      formData.email.trim() !== "" &&
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "";

    return (
      requiredFieldsCompleted &&
      !validateEmail(formData.email) &&
      !validateFirstName(formData.firstName) &&
      !validateLastName(formData.lastName) &&
      !validatePhone(formData.phone) &&
      !validatePassword(formData.password) &&
      !validateConfirmPassword(formData.confirmPassword, formData.password)
    );
  }, [formData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setServerError("");

    const newErrors: FormErrors = {
      email: validateEmail(formData.email) || undefined,
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password) || undefined,
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password,
      ),
    };

    setErrors(newErrors);
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    if (!API_URL) {
      setServerError("Falta configurar NEXT_PUBLIC_API_URL");
      return;
    }

    const payload = {
      nombre: formData.firstName.trim(),
      apellido: formData.lastName.trim(),
      correo: formData.email.trim().toLowerCase(),
      telefono: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: RegisterResponse | null = null;

      try {
        data = (await response.json()) as RegisterResponse;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo completar el registro");
      }

      const verificationToken = data?.verificationToken;

      if (!verificationToken) {
        throw new Error("No se recibió el token de verificación");
      }

      sessionStorage.setItem("pendingRegisterEmail", payload.correo);
      sessionStorage.setItem("pendingRegisterPassword", payload.password);
      sessionStorage.setItem("pendingRegisterToken", verificationToken);

      router.push("/verify-email");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-md border border-[#e7e5e4] bg-white px-6 py-7 shadow-sm">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-[#1c1917]">
            Registrarse
          </h1>
          <p className="mt-3 text-center text-[14px] text-[#78716c]">
            Crea tu cuenta para comenzar
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="Ingresa tu correo electrónico"
                  maxLength={255}
                  className={getInputClasses(
                    Boolean(touched.email && errors.email),
                  )}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby="email-error"
                />
              </div>
              <FieldError
                id="email-error"
                error={touched.email ? errors.email : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  placeholder="Ingresa tu nombre"
                  maxLength={30}
                  className={getInputClasses(
                    Boolean(touched.firstName && errors.firstName),
                  )}
                  aria-invalid={Boolean(touched.firstName && errors.firstName)}
                  aria-describedby="firstName-error"
                />
              </div>
              <FieldError
                id="firstName-error"
                error={touched.firstName ? errors.firstName : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="lastName">Apellido(s)</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  placeholder="Ingresa tu apellido"
                  maxLength={30}
                  className={getInputClasses(
                    Boolean(touched.lastName && errors.lastName),
                  )}
                  aria-invalid={Boolean(touched.lastName && errors.lastName)}
                  aria-describedby="lastName-error"
                />
              </div>
              <FieldError
                id="lastName-error"
                error={touched.lastName ? errors.lastName : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="phone">Numero de telefono</FieldLabel>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  placeholder="Ingresa tu numero de telefono"
                  className={getInputClasses(
                    Boolean(touched.phone && errors.phone),
                  )}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby="phone-error"
                />
              </div>
              <FieldError
                id="phone-error"
                error={touched.phone ? errors.phone : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div
                className="relative"
                ref={passwordContainerRef}
                onBlur={(e) => {
                  if (
                    !passwordContainerRef.current?.contains(
                      e.relatedTarget as Node,
                    )
                  ) {
                    setShowPassword(false);
                    handleBlur("password")();
                  }
                }}
              >
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange("password")}
                  placeholder="Ingresa tu contraseña"
                  maxLength={255}
                  className={`${getInputClasses(
                    Boolean(touched.password && errors.password),
                    true,
                  )} hide-native-password-toggle`}
                  aria-invalid={Boolean(touched.password && errors.password)}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#292524]"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <FieldError
                id="password-error"
                error={touched.password ? errors.password : undefined}
              />
            </div>

            <div>
              <FieldLabel htmlFor="confirmPassword">
                Confirmar contraseña
              </FieldLabel>
              <div
                className="relative"
                ref={confirmPasswordContainerRef}
                onBlur={(e) => {
                  if (
                    !confirmPasswordContainerRef.current?.contains(
                      e.relatedTarget as Node,
                    )
                  ) {
                    setShowConfirmPassword(false);
                    handleBlur("confirmPassword")();
                  }
                }}
              >
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Ingresa tu contraseña"
                  maxLength={255}
                  className={`${getInputClasses(
                    Boolean(touched.confirmPassword && errors.confirmPassword),
                    true,
                  )} hide-native-password-toggle`}
                  aria-invalid={Boolean(
                    touched.confirmPassword && errors.confirmPassword,
                  )}
                  aria-describedby="confirmPassword-error"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#292524]"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
              <FieldError
                id="confirmPassword-error"
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
              />
            </div>

            {serverError ? (
              <p className="text-center text-[12px] text-red-500">
                {serverError}
              </p>
            ) : null}

            <div className="pt-1">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full rounded-md px-4 py-2.5 text-[13px] font-semibold transition ${
                  isFormValid && !isSubmitting
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "cursor-not-allowed bg-[#e7e5e4] text-[#78716c]"
                }`}
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            </div>

            <div className="pt-1">
              <GoogleRegisterButton
                disabled={isSubmitting}
                onSuccess={async (payload) => {
                  saveSession(payload);
                  sessionStorage.setItem(
                    "register_success_message",
                    payload.message || "¡Registro exitoso! Bienvenido a PropBol.",
                  );
                  router.push("/");
                  setTimeout(() => {
                    window.dispatchEvent(new Event("propbol:register-success"));
                  }, 100);
                }}
              />
            </div>

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
              Cancelar registro
            </button>

            <p className="pt-1 text-center text-[12px] text-[#78716c]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-amber-600 transition hover:text-amber-700"
              >
                Inicia sesión
              </Link>
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-2 w-full text-center text-[12px] font-medium text-[#57534e] underline transition hover:text-[#292524]"
            >
              Ir a la página principal
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
