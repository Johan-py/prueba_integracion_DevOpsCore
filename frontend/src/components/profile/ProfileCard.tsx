"use client";

import { useState } from "react";

type FormData = {
  nombre: string;
  email: string;
  telefono: string;
  pais: string;
  genero: string;
  direccion: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ProfileCard() {
  const [form, setForm] = useState<FormData>({
    nombre: "Perfil1",
    email: "perfil1@gmail.com",
    telefono: "",
    pais: "",
    genero: "",
    direccion: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");

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

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Ingresa un email válido.";
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio.";
    }

    if (!form.pais) {
      newErrors.pais = "Selecciona un país.";
    }

    if (!form.genero) {
      newErrors.genero = "Selecciona un género.";
    }

    if (!form.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validate();

    if (isValid) {
      setMessage("Datos guardados correctamente.");
    } else {
      setMessage("Corrige los errores del formulario.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow md:flex-row">
        <div className="flex w-full flex-col items-center justify-center md:w-1/3">
          <div className="h-28 w-28 rounded-full bg-gray-300"></div>
          <p className="mt-4 text-xl font-semibold text-gray-800">
            {form.nombre || "Perfil"}
          </p>
          <p className="text-sm text-gray-500">{form.email || "Sin email"}</p>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Datos Personales
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  Nombre Completo
                </label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                />
              </div>
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="text"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Ingresa tu teléfono"
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                />
              </div>
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.telefono}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  País
                </label>
                <select
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                >
                  <option value="">Selecciona un país</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Perú">Perú</option>
                </select>
              </div>
              {errors.pais && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.pais}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  Género
                </label>
                <select
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                >
                  <option value="">Selecciona un género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              {errors.genero && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.genero}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="font-medium text-gray-700 md:w-40">
                  Dirección
                </label>
                <input
                  name="direccion"
                  type="text"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ingresa tu dirección"
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
                />
              </div>
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-500 md:ml-40">
                  {errors.direccion}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 md:items-end">
            {message && (
              <p
                className={`text-sm ${message.includes("correctamente")
                    ? "text-green-600"
                    : "text-red-500"
                  }`}
              >
                {message}
              </p>
            )}
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}