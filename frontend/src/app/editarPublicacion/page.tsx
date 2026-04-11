"use client";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import Modal from "@/components/Modal";
import EditForm from "@/components/EditForm";
// @ts-ignore
import { initialProperties, currentUser, emptyErrors } from "@/data/properties";
import { api } from "@/lib/api";

export default function Home() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // 1. CARGA DE DATOS (Backend)
  useEffect(() => {
    api.getPublicaciones(currentUser.id)
      .then((data: any) => {
        // Solo actualizamos si el backend devuelve datos válidos
        if (data && Array.isArray(data)) setProperties(data);
      })
      .catch(() => console.warn("Modo offline: Usando datos locales"))
      .finally(() => setLoading(false));
  }, []);

  // Filtramos las propiedades del usuario actual
  const userProperties = properties.filter((p: any) => p.ownerId === currentUser.id);

  // 2. MANEJO DE EVENTOS
  const handleEditClick = (property: any) => {
    setPendingEdit(property);
    setShowConfirmEdit(true);
  };

  const handleConfirmEdit = () => {
    setFormData({ ...pendingEdit });
    setEditingProperty(pendingEdit);
    setFieldErrors(emptyErrors); // Limpiamos errores previos al abrir
    setShowConfirmEdit(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Limpiamos el error específico del campo mientras el usuario escribe
    setFieldErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const handleSaveClick = () => {
    if (!formData) return;

    const errors = { ...emptyErrors };
    let hasError = false;
    
    // Validaciones robustas
    if (!formData.title?.trim()) { errors.title = "El título es requerido"; hasError = true; }
    if (!formData.details?.trim()) { errors.details = "Los detalles son requeridos"; hasError = true; }
    if (!formData.operationType) { errors.operationType = "Seleccione un tipo"; hasError = true; }
    if (!formData.price || Number(formData.price) <= 0) { errors.price = "Precio inválido"; hasError = true; }
    if (!formData.location?.trim()) { errors.location = "La ubicación es requerida"; hasError = true; }
    
    if (hasError) {
      setFieldErrors(errors);
      return;
    }
    setShowConfirmSave(true);
  };

  const handleConfirmSave = async () => {
    if (!formData) return;
    try {
      await api.updatePublicacion(formData.id, formData);
      
      // Actualizamos el estado local solo si la API responde bien
      setProperties((prev: any[]) => 
        prev.map((p) => (p.id === formData.id ? { ...formData } : p))
      );
      
      setSuccessMessage("Publicación actualizada correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error("Error al guardar:", e);
      setGlobalError("No se pudo conectar con el servidor.");
    } finally {
      setEditingProperty(null);
      setFormData(null);
      setShowConfirmSave(false);
    }
  };

  const handleDelete = async (id: any) => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar esta publicación?");
    if (!confirmDelete) return;

    try {
      await api.deletePublicacion(id);
      setProperties((prev: any[]) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  // 3. RENDERIZADO
  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-center">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-gray-400 rounded-full mb-2"></div>
      <p className="text-gray-500">Cargando tus publicaciones...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis publicaciones</h1>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 shadow-sm" role="alert">
          <p className="font-bold">¡Éxito!</p>
          <p>{successMessage}</p>
        </div>
      )}

      {userProperties.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          No tienes publicaciones activas.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProperties.map((property: any) => (
            <PropertyCard
              key={property.id}
              property={property}
              canEdit={true}
              onEdit={() => handleEditClick(property)}
              onDelete={() => handleDelete(property.id)}
            />
          ))}
        </div>
      )}

      {/* MODAL 1: PRE-CONFIRMACIÓN DE EDICIÓN */}
      {showConfirmEdit && (
        <Modal onClose={() => setShowConfirmEdit(false)}>
          <div className="p-2">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Editar publicación</h2>
            <p className="text-gray-500 mb-6">¿Quieres abrir el formulario de edición para esta propiedad?</p>
            <div className="flex gap-3 justify-end">
              <button 
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                onClick={() => setShowConfirmEdit(false)}
              >
                Cerrar
              </button>
              <button 
                className="px-8 py-2 rounded-xl text-white bg-[#1a1a1a] hover:bg-black transition-colors" 
                onClick={handleConfirmEdit}
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: FORMULARIO DE EDICIÓN */}
      {editingProperty && formData && !showConfirmSave && (
        <Modal onClose={() => setEditingProperty(null)}>
          <EditForm
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            onSave={handleSaveClick}
            onCancel={() => setEditingProperty(null)}
            globalError={globalError}
          />
        </Modal>
      )}

      {/* MODAL 3: CONFIRMAR GUARDADO FINAL */}
      {showConfirmSave && (
        <Modal onClose={() => setShowConfirmSave(false)}>
          <div className="p-2 text-center"> 
            <div className="w-16 h-16 bg-orange-100 text-[#e67e22] rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Confirmar cambios</h2>
            <p className="text-gray-500 mb-8">
              ¿Desea guardar los cambios realizados en la publicación permanentemente?
            </p>
            <div className="flex gap-4">
              <button 
                className="px-8 py-3 rounded-xl bg-[#e5e1d8] text-gray-700 font-semibold hover:bg-gray-300 transition-all flex-1"
                onClick={() => setShowConfirmSave(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-8 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all shadow-md flex-[1.5] bg-[#e67e22]" 
                onClick={handleConfirmSave}
              >
                Sí, Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}