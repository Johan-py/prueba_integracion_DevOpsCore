import React from "react";

const OPERATION_TYPES = ["Venta", "Alquiler", "Anticrético"];

interface FormData {
  title: string;
  details: string;
  operationType: string;
  price: string | number;
  location: string;
}

interface FieldErrors {
  title?: string;
  details?: string;
  operationType?: string;
  price?: string;
  location?: string;
}

interface EditFormProps {
  formData: FormData;
  fieldErrors: FieldErrors;
  onChange: (field: keyof FormData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  toast?: string | null;
  globalError?: string | null;
}

export default function EditForm({
  formData,
  fieldErrors,
  onChange,
  onSave,
  onCancel,
  toast,
  globalError,
}: EditFormProps) {

  // Función auxiliar para cumplir con el Criterio 12 (Solo números/decimales en precio)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite solo números y un punto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onChange("price", value);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Editar Publicación
      </h1>

      <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase mb-6">
        Información de la publicación
      </p>

      {/* Notificaciones de éxito/error */}
      {toast && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 animate-pulse">
          {toast}
        </div>
      )}

      {globalError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Título - Criterio 13 y 22 */}
        <div>
          <label htmlFor="title" className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Título Propiedad
          </label>
          <input
            id="title"
            type="text"
            maxLength={100} // Criterio 22
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.title
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            }`}
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Residencia Moderna"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{fieldErrors.title}</p>
          )}
        </div>

        {/* Detalles - Criterio 22 */}
        <div>
          <label htmlFor="details" className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Detalles de la Propiedad
          </label>
          <textarea
            id="details"
            rows={1}
            maxLength={500} // Criterio 22
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition resize-none ${
              fieldErrors.details
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            }`}
            value={formData.details}
            onChange={(e) => onChange("details", e.target.value)}
            placeholder="Descripción de la propiedad"
          />
          {fieldErrors.details && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{fieldErrors.details}</p>
          )}
        </div>

        {/* Tipo Operación */}
        <div>
          <label htmlFor="operationType" className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Tipo Operación
          </label>
          <select
            id="operationType"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.operationType
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            }`}
            value={formData.operationType}
            onChange={(e) => onChange("operationType", e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {OPERATION_TYPES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          {fieldErrors.operationType && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{fieldErrors.operationType}</p>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="location" className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Ubicación
          </label>
          <input
            id="location"
            type="text"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.location
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            }`}
            value={formData.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="Cochabamba, Sacaba"
          />
          {fieldErrors.location && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{fieldErrors.location}</p>
          )}
        </div>

        {/* Precio - Criterio 12 y 18 */}
        <div className="md:col-span-1">
          <label htmlFor="price" className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Precio (USD)
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.price
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-300 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            }`}
            value={formData.price}
            onChange={handlePriceChange}
            placeholder="Ej: 180000.00"
          />
          {fieldErrors.price && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{fieldErrors.price}</p>
          )}
        </div>
      </div>

      {/* Botones - Criterio 14 (Dimensiones consistentes) */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          className="flex-1 rounded-xl bg-[#e67e22] px-6 py-4 text-white font-bold shadow-md hover:bg-[#d35400] transition active:scale-95"
          onClick={onSave}
        >
          GUARDAR CAMBIOS
        </button>

        <button
          className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-4 text-gray-700 font-bold hover:bg-gray-50 transition active:scale-95"
          onClick={onCancel}
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
}