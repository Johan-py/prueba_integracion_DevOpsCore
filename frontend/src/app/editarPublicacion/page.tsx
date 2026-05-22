"use client";

import { useState, useEffect, useCallback } from "react";
import PropertyCard from "@/components/PropertyCard";
import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
import { initialProperties, currentUser, emptyErrors } from "@/data/properties";

const normalizeProperty = (property: any) => ({
  id: property.id,
  ownerId: property.ownerId ?? currentUser.id,
  title: property.title ?? "",
  details: property.details ?? "",
  operationType: property.operationType ?? "",
  price: property.price ?? "",
  location: property.location ?? "",
  image: property.image ?? "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  beds: property.beds ?? 0,
  baths: property.baths ?? 0,
  area: property.area ?? "N/A",
});

export default function Home() {
  const [properties, setProperties] = useState(initialProperties.map((p: any) => normalizeProperty(p)));
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null); // Para detectar cambios
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Criterio: Advertencia de recarga si hay cambios pendientes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData && JSON.stringify(formData) !== JSON.stringify(originalData)) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, originalData]);

  const userProperties = properties.filter((p: any) => p.ownerId === currentUser.id);

  const handleEditClick = (property: any) => {
    setEditingProperty(property);
    setShowConfirmEdit(true);
  };

  const handleConfirmEdit = () => {
    const normalized = normalizeProperty(editingProperty);
    setFormData({ ...normalized });
    setOriginalData({ ...normalized });
    setFieldErrors(emptyErrors);
    setShowConfirmEdit(false);
  };

  // Busca esta función y reemplázala:
const handleChange = (field: any, value: any) => {
  setFormData((prev: any) => ({ 
    ...prev, 
    [field]: value 
  }));

  // Esto limpia el error del campo cuando el usuario empieza a escribir
  if (fieldErrors[field as keyof typeof fieldErrors]) {
    setFieldErrors((prev: any) => ({ 
      ...prev, 
      [field]: "" 
    }));
  }
};

  const validate = () => {
    const errors = { ...emptyErrors };
    let hasError = false;

    // --- 1. VALIDACIÓN DE TÍTULO (Criterio 8, 13 y 22) ---
    const titleTrimmed = formData.title?.trim() || "";
    // Solo letras, espacios y tildes (bloquea si son solo números o símbolos)
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; 

    if (!titleTrimmed) {
      errors.title = "No se puede dejar datos obligatorios en blanco";
      hasError = true;
    } else if (titleTrimmed.length < 10 || titleTrimmed.length > 100) {
      errors.title = "El título debe tener entre 10 y 100 caracteres";
      hasError = true;
    } else if (!textRegex.test(titleTrimmed)) {
      errors.title = "El título debe contener texto legible (solo letras)";
      hasError = true;
    }

    // --- 2. VALIDACIÓN DE DETALLES (Criterio 22) ---
    const detailsTrimmed = formData.details?.trim() || "";
    if (detailsTrimmed.length < 20 || detailsTrimmed.length > 500) {
      errors.details = "La descripción debe tener entre 20 y 500 caracteres";
      hasError = true;
    }

    // --- 3. VALIDACIÓN DE PRECIO (Criterio 12 y 18) ---
    // Explicación: Solo números, opcionalmente un punto y hasta 2 decimales. 
    // No permite símbolos como $, letras, ni comas.
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    const priceValue = Number(formData.price);

    if (!formData.price || formData.price.toString().trim() === "") {
      errors.price = "No se puede dejar datos obligatorios en blanco";
      hasError = true;
    } else if (!priceRegex.test(formData.price.toString())) {
      errors.price = "Formato inválido. Use punto para decimales (ej: 1500.50) sin símbolos.";
      hasError = true;
    } else if (priceValue <= 0) {
      errors.price = "El precio debe ser un valor numérico positivo mayor a cero";
      hasError = true;
    }

    // --- 4. VALIDACIÓN DE UBICACIÓN (Criterio 8) ---
    if (!formData.location?.trim()) {
      errors.location = "No se puede dejar datos obligatorios en blanco";
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleSaveClick = () => {
  if (!validate()) return;

  // Comparamos el objeto actual con el que cargamos al inicio
  if (JSON.stringify(formData) === JSON.stringify(originalData)) {
    alert("No se detectaron cambios"); // O un aviso más elegante
    setEditingProperty(null);
    return;
  }

  setShowConfirmSave(true);
};

const handleConfirmSave = async () => {
    if (isSaving) return; // Criterio 19: Evitar duplicidad
    setIsSaving(true);

    try {
      // Simulación de tiempo de proceso (Criterio 20 y 21)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProperty = normalizeProperty(formData);
      setProperties(prev => prev.map(p => (p.id === formData.id ? updatedProperty : p)));

      setSuccessMessage("Publicación actualizada con exactitud"); // Criterio 15

      // --- ESTA ES LA PARTE QUE DEBES AÑADIR ---
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000); // Se limpia el mensaje después de 2 segundos
      // -----------------------------------------

      setEditingProperty(null);
      setFormData(null);
      setShowConfirmSave(false);
    } catch (e) {
      setGlobalError("No fue posible guardar los cambios. Intente nuevamente."); // Criterio 17
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Criterio 9: Si hay cambios, preguntar
    if (JSON.stringify(formData) !== JSON.stringify(originalData)) {
      setShowDiscardAlert(true);
    } else {
      setEditingProperty(null);
      setFormData(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 bg-[#fdfaf6] min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Mis publicaciones</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-bounce">
          <span>✅ {successMessage}</span>
        </div>
      )}

      {/* Listado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {userProperties.map((property: any) => (
          <PropertyCard
            key={property.id}
            property={property}
            canEdit={true} // Criterio 1: Solo dueño ve botón (filtrado por userProperties)
            onEdit={() => handleEditClick(property)}
            onDelete={() => {}}
          />
        ))}
      </div>

      {/* Modal 1: Confirmar intención de Editar (Criterio 2) */}
      {showConfirmEdit && (
        <Modal onClose={() => setShowConfirmEdit(false)}>
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Editar publicación</h2>
            <p className="text-gray-600 mb-8">¿Está seguro que desea editar?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirmEdit(false)} className="flex-1 px-6 py-3 rounded-xl border font-semibold">Cancelar</button>
              <button onClick={handleConfirmEdit} className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-semibold">Editar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Formulario (Criterio 3: Pre-cargado) */}
      {editingProperty && formData && !showConfirmSave && (
        <Modal onClose={handleCancel}>
          <EditForm
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            onSave={handleSaveClick}
            onCancel={handleCancel}
            globalError={globalError}
          />
        </Modal>
      )}

      {/* Modal 2: Confirmar Cambios (Criterio 4) */}
      {showConfirmSave && (
        <Modal onClose={() => setShowConfirmSave(false)}>
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-6">Confirmar cambios</h2>
            <p className="mb-8">¿Desea guardar los cambios realizados en la publicación?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirmSave(false)} className="flex-1 py-3 bg-gray-200 rounded-xl">Cancelar</button>
              <button 
                onClick={handleConfirmSave} 
                className="flex-1 py-3 bg-[#e67e22] text-white font-bold rounded-xl"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Sí, Guardar"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Alerta de Descarte (Criterio 9) */}
      {showDiscardAlert && (
        <Modal onClose={() => setShowDiscardAlert(false)}>
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Cambios pendientes</h2>
            <p className="mb-8 text-gray-600">¿Desea guardar o descartar los cambios?</p>
            <div className="flex gap-4">
              <button onClick={() => { setShowDiscardAlert(false); setEditingProperty(null); }} className="flex-1 py-3 border rounded-xl">Descartar</button>
              <button onClick={() => { setShowDiscardAlert(false); handleSaveClick(); }} className="flex-1 py-3 bg-black text-white rounded-xl">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}