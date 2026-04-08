export type GoogleSignupPrefill = {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
};

export type GoogleSignupMissingField = "email" | "firstName" | "lastName";

const GOOGLE_SIGNUP_PREFILL_KEY = "propbol_google_signup_prefill";

type GoogleCredentialPayload = {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
};

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding =
      normalized.length % 4 === 0
        ? ""
        : "=".repeat(4 - (normalized.length % 4));

    const decoded = atob(normalized + padding);

    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
  } catch {
    return null;
  }
}

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function extractGooglePrefillFromCredential(
  credential: string,
): GoogleSignupPrefill | null {
  if (!credential) {
    return null;
  }

  const parts = credential.split(".");

  if (parts.length < 2) {
    return null;
  }

  const payloadJson = decodeBase64Url(parts[1]);

  if (!payloadJson) {
    return null;
  }

  try {
    const payload = JSON.parse(payloadJson) as GoogleCredentialPayload;
    const fallbackNames = splitFullName(payload.name ?? "");

    const email = payload.email?.trim() ?? "";
    const firstName = payload.given_name?.trim() || fallbackNames.firstName;
    const lastName = payload.family_name?.trim() || fallbackNames.lastName;

    if (!email && !firstName && !lastName) {
      return null;
    }

    return {
      email,
      firstName,
      lastName,
      fullName:
        payload.name?.trim() ||
        [firstName, lastName].filter(Boolean).join(" ").trim(),
    };
  } catch {
    return null;
  }
}

export function saveGoogleSignupPrefill(
  data: Partial<GoogleSignupPrefill>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(GOOGLE_SIGNUP_PREFILL_KEY, JSON.stringify(data));
}

export function consumeGoogleSignupPrefill(): Partial<GoogleSignupPrefill> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = sessionStorage.getItem(GOOGLE_SIGNUP_PREFILL_KEY);

  if (!rawValue) {
    return null;
  }

  sessionStorage.removeItem(GOOGLE_SIGNUP_PREFILL_KEY);

  try {
    return JSON.parse(rawValue) as Partial<GoogleSignupPrefill>;
  } catch {
    return null;
  }
}

export function buildGoogleSignupPrefillFromSearchParams(
  searchParams: URLSearchParams,
): Partial<GoogleSignupPrefill> | null {
  const email = searchParams.get("email")?.trim() ?? "";
  const firstName = searchParams.get("firstName")?.trim() ?? "";
  const lastName = searchParams.get("lastName")?.trim() ?? "";
  const fullName = searchParams.get("name")?.trim() ?? "";

  const fallbackNames = splitFullName(fullName);

  const resolvedFirstName = firstName || fallbackNames.firstName;
  const resolvedLastName = lastName || fallbackNames.lastName;

  if (!email && !resolvedFirstName && !resolvedLastName && !fullName) {
    return null;
  }

  return {
    email,
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    fullName,
  };
}

export function getMissingGoogleSignupFields(
  data: Partial<GoogleSignupPrefill> | null | undefined,
): GoogleSignupMissingField[] {
  if (!data) {
    return [];
  }

  const missingFields: GoogleSignupMissingField[] = [];

  if (!data.email?.trim()) {
    missingFields.push("email");
  }

  if (!data.firstName?.trim()) {
    missingFields.push("firstName");
  }

  if (!data.lastName?.trim()) {
    missingFields.push("lastName");
  }

  return missingFields;
}

export function extractGooglePrefillValidationFromCredential(
  credential: string,
): {
  prefill: GoogleSignupPrefill | null;
  missingFields: GoogleSignupMissingField[];
} {
  const prefill = extractGooglePrefillFromCredential(credential);

  if (!prefill) {
    return {
      prefill: null,
      missingFields: [],
    };
  }

  return {
    prefill,
    missingFields: getMissingGoogleSignupFields(prefill),
  };
}
