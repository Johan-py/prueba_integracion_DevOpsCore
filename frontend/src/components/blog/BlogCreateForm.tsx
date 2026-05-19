"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import BlogLinkModal from "./BlogLinkModal";
import BlogPublishModal from "./BlogPublishModal";
import SuccessToast from "./SuccessToast";

import BlogFormHeader from "./form/BlogFormHeader";
import BlogImageSection from "./form/BlogImageSection";
import BlogInfoFields from "./form/BlogInfoFields";
import BlogEditorSection from "./form/BlogEditorSection";
import BlogSidebar from "./form/BlogSidebar";
import { useBlogForm } from "@/hooks/useBlogForm";

type BlogCreateFormProps = {
  blogId?: number;
  initialValues?: {
    categoriaId: string;
    contenido: string;
    imagen: string;
    titulo: string;
  };
  mode?: "create" | "edit";
  statusLabel?: "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";
  rejectionReason?: string;
};

export default function BlogCreateForm({
  blogId,
  initialValues,
  mode = "create",
  statusLabel,
  rejectionReason,
}: BlogCreateFormProps) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  const {
    titulo,
    setTitulo,
    categoriaId,
    setCategoriaId,
    contenido,
    setContenido,
    categories,
    isLoadingCategories,
    loadError,
    autosaveMessage,
    isSubmitting,
    submitError,
    successMessage,
    fieldErrors,
    setFieldErrors,
    imagePreviewUrl,
    insertLink,
    setIsLinkModalOpen,
    isLinkModalOpen,
    selectionForLink,
    setSelectedImageFile,
    submitBlog,
    validate,
  } = useBlogForm({ blogId, initialValues, mode });

  const handleAction = (accion: "borrador" | "pendiente") => {
    if (accion === "borrador") {
      void submitBlog("borrador");
      return;
    }

    // Para publicar, validamos primero
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsPublishModalOpen(true);
    }
  };

  const handleConfirmPublish = () => {
    setIsPublishModalOpen(false);
    void submitBlog("pendiente");
  };

  const handleEditorLinkConfirm = (url: string, text?: string) => {
    if (editor) {
      editor.chain()
        .focus()
        .insertContent(`<a href="${url}">${text || url}</a> `)
        .run();
    }
    setIsLinkModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Main Content Area */}
        <div className="space-y-8">
          <BlogFormHeader mode={mode} />

          {statusLabel === "PENDIENTE" && (
            <div className="rounded-[24px] bg-amber-50 border border-amber-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">En revisión</h3>
              <p className="text-amber-700 leading-relaxed">Tu blog está siendo revisado por el equipo de moderación.</p>
              <p className="text-xs text-amber-600/80 mt-3 italic">No es posible editar ni reenviar mientras esté en revisión.</p>
            </div>
          )}

          {statusLabel === "RECHAZADO" && rejectionReason && (
            <div className="rounded-[24px] bg-[#FDECEC] border border-[#F3BABA] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#D94848] uppercase tracking-wider mb-2">Motivo de rechazo</h3>
              <p className="text-[#D94848] leading-relaxed break-words">{rejectionReason}</p>
              <p className="text-xs text-[#D94848]/80 mt-3 italic">Corrige los puntos mencionados y vuelve a enviarlo para revisión.</p>
            </div>
          )}

          <form
            id="blog-form"
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              handleAction("pendiente");
            }}
          >
            {/* Image Upload Section */}
            <BlogImageSection
              imagePreviewUrl={imagePreviewUrl}
              onImageChange={(file) => {
                setSelectedImageFile(file);
                setFieldErrors((prev) => ({ ...prev, imagen: undefined }));
              }}
              error={fieldErrors.imagen}
            />

            {/* Info Fields (Title & Category) */}
            <BlogInfoFields
              titulo={titulo}
              setTitulo={setTitulo}
              categoriaId={categoriaId}
              setCategoriaId={setCategoriaId}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              errors={fieldErrors}
            />

            {/* Editor Section */}
            <BlogEditorSection
              contenido={contenido}
              setContenido={setContenido}
              insertLink={insertLink}
              editorRef={setEditor}
              error={fieldErrors.contenido}
            />

            {/* Feedback Messages */}
            {loadError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{loadError}</p>}
            {autosaveMessage && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 font-medium">{autosaveMessage}</p>}
            {submitError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {submitError}
              </p>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <BlogSidebar
          statusLabel={statusLabel}
          isSubmitting={isSubmitting}
          onAction={handleAction}
        />
      </div>

      <BlogLinkModal
        isOpen={isLinkModalOpen}
        initialText={selectionForLink}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={handleEditorLinkConfirm}
      />

      <BlogPublishModal
        isOpen={isPublishModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
      />

      <SuccessToast
        message={successMessage}
        isOpen={!!successMessage}
        onClose={() => { }} // El hook redirige rápido, así que no es crítico el reset manual aquí
      />
    </div>
  );
}
