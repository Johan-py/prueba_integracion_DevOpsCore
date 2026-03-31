"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileSessionData = {
    nombre: string;
    email: string;
    telefono: string;
};

type ComplementaryData = {
    pais: string;
    genero: string;
    direccion: string;
};

type FormErrors = Partial<Record<keyof ComplementaryData, string>>;

const PAISES = [
    "Bolivia",
    "Argentina",
    "Chile",
    "Perú",
    "Paraguay",
    "Uruguay",
    "Brasil",
    "Colombia",
];

const GENEROS = ["Masculino", "Femenino", "Otro"];

const DEFAULT_SESSION_DATA: ProfileSessionData = {
    nombre: "Rodrigo Alvarez",
    email: "rodrigo54@gmail.com",
    telefono: "+591 78745578",
};

const DEFAULT_COMPLEMENTARY_DATA: ComplementaryData = {
    pais: "",
    genero: "",
    direccion: "",
};

export default function ExtraInf() {
    const router = useRouter();

    const [sessionData, setSessionData] =
        useState<ProfileSessionData>(DEFAULT_SESSION_DATA);

    const [form, setForm] = useState<ComplementaryData>(
        DEFAULT_COMPLEMENTARY_DATA
    );

    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") ?? "true";

        if (isAuthenticated !== "true") {
            router.push("/login");
            return;
        }

        const savedSessionData = localStorage.getItem("profileSessionData");
        const savedComplementaryData = localStorage.getItem(
            "profileComplementaryData"
        );

        if (savedSessionData) {
            setSessionData(JSON.parse(savedSessionData));
        } else {
            localStorage.setItem(
                "profileSessionData",
                JSON.stringify(DEFAULT_SESSION_DATA)
            );
        }

        if (savedComplementaryData) {
            const parsedData: ComplementaryData = JSON.parse(savedComplementaryData);

            setForm({
                pais: parsedData.pais ?? "",
                genero: parsedData.genero ?? "",
                direccion: parsedData.direccion ?? "",
            });
        } else {
            localStorage.setItem(
                "profileComplementaryData",
                JSON.stringify(DEFAULT_COMPLEMENTARY_DATA)
            );
        }
    }, [router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setMessage("");
    };

    const isDireccionValida = (direccion: string) => {
        const valor = direccion.trim();

        if (!valor) return false;

        // Debe tener al menos una letra o un número
        return /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(valor);
    };

    const validate = (data: ComplementaryData) => {
        const newErrors: FormErrors = {};

        if (!data.pais) {
            newErrors.pais = "Debes seleccionar un país.";
        }

        if (!data.genero) {
            newErrors.genero = "Debes seleccionar un género.";
        }

        if (!isDireccionValida(data.direccion)) {
            newErrors.direccion =
                "La dirección es obligatoria y debe contener letras o números válidos.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setMessage("");

        const cleanedForm: ComplementaryData = {
            pais: form.pais.trim(),
            genero: form.genero.trim(),
            direccion: form.direccion.trim(),
        };

        const isValid = validate(cleanedForm);

        if (!isValid) {
            setMessage("Corrige los errores del formulario.");
            return;
        }

        setIsSaving(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));

            localStorage.setItem(
                "profileComplementaryData",
                JSON.stringify(cleanedForm)
            );

            setForm(cleanedForm);
            setMessage("Datos actualizados correctamente.");
        } catch {
            setMessage("No se pudo guardar la información.");
        } finally {
            setIsSaving(false);
        }
    };

    const inputBaseStyles =
        "w-full rounded-md border border-gray-300 bg-[#f8efea] px-3 py-2 text-sm text-gray-800 outline-none";
    const readonlyStyles = `${inputBaseStyles} cursor-not-allowed bg-[#f3ece8]`;
    const editableStyles = `${inputBaseStyles} focus:border-orange-400`;

    return (
        <section className="rounded-2xl bg-white p-4 shadow sm:p-6 md:p-10">
            <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 md:mb-10 md:text-3xl">
                Datos Personales
            </h1>

            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
                <aside className="flex w-full flex-col items-center md:w-1/3">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#f7f0ec] text-5xl text-gray-500 sm:h-32 sm:w-32">
                        👤
                    </div>

                    <p className="mt-4 text-center text-xl font-bold text-gray-900">
                        {sessionData.nombre}
                    </p>
                    <p className="break-all text-center text-sm text-gray-600">
                        {sessionData.email}
                    </p>
                </aside>

                <div className="w-full md:w-2/3">
                    <div className="space-y-4 sm:space-y-5">
                        <FieldRow label="Nombre Completo">
                            <input
                                type="text"
                                value={sessionData.nombre}
                                disabled
                                className={readonlyStyles}
                            />
                        </FieldRow>

                        <FieldRow label="E-mail">
                            <input
                                type="email"
                                value={sessionData.email}
                                disabled
                                className={readonlyStyles}
                            />
                        </FieldRow>

                        <FieldRow label="Teléfono">
                            <input
                                type="text"
                                value={sessionData.telefono}
                                disabled
                                className={readonlyStyles}
                            />
                        </FieldRow>

                        <FieldRow label="País" error={errors.pais}>
                            <select
                                name="pais"
                                value={form.pais}
                                onChange={handleChange}
                                className={editableStyles}
                            >
                                <option value="">Selecciona un país</option>
                                {PAISES.map((pais) => (
                                    <option key={pais} value={pais}>
                                        {pais}
                                    </option>
                                ))}
                            </select>
                        </FieldRow>

                        <FieldRow label="Género" error={errors.genero}>
                            <select
                                name="genero"
                                value={form.genero}
                                onChange={handleChange}
                                className={editableStyles}
                            >
                                <option value="">Selecciona un género</option>
                                {GENEROS.map((genero) => (
                                    <option key={genero} value={genero}>
                                        {genero}
                                    </option>
                                ))}
                            </select>
                        </FieldRow>

                        <FieldRow label="Dirección" error={errors.direccion}>
                            <input
                                name="direccion"
                                type="text"
                                value={form.direccion}
                                onChange={handleChange}
                                placeholder="Ingresa tu dirección"
                                className={editableStyles}
                            />
                        </FieldRow>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3 md:items-end">
                        {message && (
                            <p
                                className={`text-center text-sm font-medium md:text-right ${message.includes("correctamente")
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className={`w-full rounded-md px-6 py-3 text-sm font-semibold text-white sm:w-auto ${isSaving
                                    ? "cursor-not-allowed bg-gray-400"
                                    : "bg-orange-500 hover:bg-orange-600"
                                }`}
                        >
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

type FieldRowProps = {
    label: string;
    children: React.ReactNode;
    error?: string;
};

function FieldRow({ label, children, error }: FieldRowProps) {
    return (
        <div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-sm font-semibold text-gray-800 md:w-44 md:shrink-0">
                    {label}:
                </label>

                <div className="w-full flex-1">{children}</div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-500 md:ml-44">
                    {error}
                </p>
            )}
        </div>
    );
}