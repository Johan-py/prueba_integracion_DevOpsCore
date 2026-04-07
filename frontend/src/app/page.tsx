"use client";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
import { initialProperties, currentUser, emptyErrors } from "@/data/properties";
import { api } from "@/lib/api";
import { toast } from "sonner";   // ← agrega este import arriba

export default function Home() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar publicaciones del backend
  useEffect(() => {
    api.getPublicaciones(currentUser.id)
      .then((data) => {
        if (data && data.length > 0) setProperties(data);
      })
      .catch(() => console.log("Usando datos locales"))
      .finally(() => setLoading(false));
  }, []);

  const userProperties = properties.filter((p) => p.ownerId === currentUser.id);

  const handleEditClick = (property) => {
    setPendingEdit(property);
    setShowConfirmEdit(true);
  };

  const handleConfirmEdit = () => {
    setFormData({ ...pendingEdit });
    setEditingProperty(pendingEdit);
    setFieldErrors(emptyErrors);
    setShowConfirmEdit(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveClick = () => {
    const errors = { ...emptyErrors };
    let hasError = false;
    if (!formData.title?.trim()) { errors.title = "El título es requerido"; hasError = true; }
    if (!formData.details?.trim()) { errors.details = "Los detalles son requeridos"; hasError = true; }
    if (!formData.operationType) { errors.operationType = "Seleccione un tipo"; hasError = true; }
    if (!formData.price) { errors.price = "El precio es requerido"; hasError = true; }
    if (!formData.location?.trim()) { errors.location = "La ubicación es requerida"; hasError = true; }
    if (hasError) { setFieldErrors(errors); return; }
    setShowConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    try {
      await api.updatePublicacion(formData.id, formData);
    } catch (e) {
      console.log("Guardado local");
    }
    setProperties((prev) => prev.map((p) => (p.id === formData.id ? formData : p)));
    setEditingProperty(null);
    setFormData(null);
    setShowConfirmSave(false);
    setSuccessMessage("Publicación Actualizada con exactitud");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePublicacion(id);
    } catch (e) {
      console.log("Eliminado local");
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <p className="text-gray-500">Cargando publicaciones...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis publicaciones</h1>

      {successMessage && (
        <div className="alert success mb-6">{successMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            canEdit={property.ownerId === currentUser.id}
            onEdit={() => handleEditClick(property)}
            onDelete={() => handleDelete(property.id)}
          />
        ))}
      </div>

      {/* MODAL 1: CONFIRMAR EDICIÓN (BOTÓN NEGRO) */}
{showConfirmEdit && (
  <Modal onClose={() => setShowConfirmEdit(false)}>
    <h2 className="text-xl font-bold mb-2 text-gray-800">Editar publicación</h2>
    <p className="text-gray-500 mb-6">¿Está seguro que desea editar?</p>
    
    {/* justify-end: Alinea los botones a la derecha sin estirarlos */}
    <div className="flex gap-3 justify-end mt-4">
      <button 
        /* px-8: Padding a los lados para dar forma rectangular / py-2: Altura pequeña */
        /* rounded-xl: Bordes muy redondeados como en tu imagen */
        className="px-8 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors" 
        onClick={() => setShowConfirmEdit(false)}
      >
        Cancelar
      </button>
      <button 
        /* Eliminamos minWidth:"120px" para que no se estire como chicle */
        className="px-10 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" 
        style={{ background: "#1a1a1a" }} // Color negro exacto
        onClick={handleConfirmEdit}
      >
        Editar
      </button>
    </div>
  </Modal>
)}

{/* MODAL 2: CONFIRMAR GUARDADO (BOTÓN NARANJA) */}
{showConfirmSave && (
  <Modal onClose={() => setShowConfirmSave(false)}>
    <h2 className="text-xl font-bold mb-2 text-gray-800">Confirmar cambios</h2>
    <p className="text-gray-500 mb-6">¿Desea guardar los cambios realizados en la publicación?</p>
    
    <div className="flex gap-3 justify-end mt-4">
      <button 
        className="px-8 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors" 
        onClick={() => setShowConfirmSave(false)}
      >
        Cancelar
      </button>
      <button 
        /* px-10: Hace que el botón sea ancho pero proporcional al texto */
        className="px-10 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" 
        style={{ background: "#e67e22" }} // Color naranja de tu referencia
        onClick={handleConfirmSave}
      >
        Guardar
      </button>
    </div>
  </Modal>
)}

      {editingProperty && formData && !showConfirmSave && (
  <Modal onClose={() => setEditingProperty(null)}>
    <EditForm
      formData={formData}
      fieldErrors={fieldErrors}
      onChange={handleChange}
      onSave={handleSaveClick}
      onCancel={() => setEditingProperty(null)}
      toast={toast}           // ← agregar
      globalError={globalError || null}  // ← agregar
    />
  </Modal>
)}

      {showConfirmSave && (
  <Modal onClose={() => setShowConfirmSave(false)}>
    {/* Contenedor principal con padding para que respire el texto */}
    <div className="p-2"> 
      <h2 className="text-2xl font-bold mb-3 text-gray-800">Confirmar cambios</h2>
      <p className="text-gray-500 mb-8 text-lg">
        ¿Desea guardar los cambios realizados en la publicación?
      </p>
      
      {/* Contenedor de botones: gap-4 para separarlos bien */}
      <div className="flex gap-4 justify-between items-center mt-6">
        
        {/* BOTÓN CANCELAR: Color crema/gris suave */}
        <button 
          className="px-8 py-3 rounded-xl bg-[#e5e1d8] text-gray-700 font-semibold hover:bg-gray-300 transition-all flex-1"
          onClick={() => setShowConfirmSave(false)}
        >
          Cancelar
        </button>

        {/* BOTÓN GUARDAR: Naranja vibrante y más ancho */}
        <button 
          className="px-12 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all shadow-md flex-[1.5]" 
          style={{ background: "#e67e22" }} // El naranja exacto de tu imagen
          onClick={handleConfirmSave}
        >
          Guardar
        </button>
        
      </div>
    </div>
  </Modal>
)}
    </div>
  );
}