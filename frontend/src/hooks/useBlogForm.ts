'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BlogCategoryOption,
  getBlogCategories,
  createBlog,
  updateBlog,
  uploadBlogImage,
  BlogCreationAction
} from '@/services/blogs.service'

const AUTOSAVE_STORAGE_PREFIX = 'propbol_blog_form'

export type FieldErrors = {
  categoria_id?: string
  contenido?: string
  imagen?: string
  titulo?: string
}

export type BlogFormValues = {
  titulo: string
  imagen: string
  categoriaId: string
  contenido: string
}

export interface UseBlogFormProps {
  blogId?: number
  initialValues?: BlogFormValues
  mode: 'create' | 'edit'
}

export const INITIAL_ERRORS: FieldErrors = {}

export function useBlogForm({ blogId, initialValues, mode }: UseBlogFormProps) {
  const router = useRouter()
  const _hasHydratedDraft = useRef(false)

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? '')
  const [imagen, setImagen] = useState(initialValues?.imagen ?? '')
  const [categoriaId, setCategoriaId] = useState(initialValues?.categoriaId ?? '')
  const [contenido, setContenidoState] = useState(initialValues?.contenido ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(INITIAL_ERRORS)

  const [categories, setCategories] = useState<BlogCategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [autosaveMessage, setAutosaveMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [selectionForLink, setSelectionForLink] = useState('')

  const autosaveKey = useMemo(
    () =>
      mode === 'edit' && blogId
        ? `${AUTOSAVE_STORAGE_PREFIX}:edit:${blogId}`
        : `${AUTOSAVE_STORAGE_PREFIX}:create`,
    [blogId, mode]
  )

  const setContenido = (nextContent: string) => {
    setContenidoState(nextContent)
  }

  // Hidratación de borrador
  useEffect(() => {
    if (_hasHydratedDraft.current) return
    _hasHydratedDraft.current = true

    const rawDraft = window.localStorage.getItem(autosaveKey)
    if (!rawDraft) return

    try {
      const draft = JSON.parse(rawDraft)
      setTitulo(draft.titulo ?? initialValues?.titulo ?? '')
      setImagen(draft.imagen ?? initialValues?.imagen ?? '')
      setCategoriaId(draft.categoriaId ?? initialValues?.categoriaId ?? '')
      setContenidoState(draft.contenido ?? initialValues?.contenido ?? '')
      setAutosaveMessage('Borrador local recuperado.')
    } catch {
      window.localStorage.removeItem(autosaveKey)
    }
  }, [autosaveKey, initialValues])

  // Carga de categorías
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const rows = await getBlogCategories()
        if (isMounted) setCategories(rows)
      } catch (err) {
        if (isMounted)
          setLoadError(err instanceof Error ? err.message : 'Error al cargar categorías')
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const hasContent = Boolean(titulo.trim() || imagen.trim() || categoriaId || contenido.trim())

    if (!hasContent) {
      window.localStorage.removeItem(autosaveKey)
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        autosaveKey,
        JSON.stringify({
          titulo,
          imagen,
          categoriaId,
          contenido
        })
      )
      setAutosaveMessage('Cambios guardados localmente.')
      setTimeout(() => setAutosaveMessage(''), 3000)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [autosaveKey, titulo, imagen, categoriaId, contenido])

  // url para previsualizar imagen con limpieza de memoria
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  useEffect(() => {
    if (!selectedImageFile) {
      setImagePreviewUrl(imagen.trim() || '')
      return
    }

    const objectUrl = URL.createObjectURL(selectedImageFile)
    setImagePreviewUrl(objectUrl)

    // Cleanup para evitar memory leaks
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedImageFile, imagen])

  // Detectar cambios en el formulario (si no está “sucio”)
  const isFormDirty = useMemo(() => {
    const baseTitulo = initialValues?.titulo?.trim() ?? ''
    const baseImagen = initialValues?.imagen?.trim() ?? ''
    const baseCategoriaId = initialValues?.categoriaId ?? ''
    const baseContenido = initialValues?.contenido?.trim() ?? ''

    return (
      titulo.trim() !== baseTitulo ||
      imagen.trim() !== baseImagen ||
      categoriaId !== baseCategoriaId ||
      contenido.trim() !== baseContenido
    )
  }, [titulo, imagen, categoriaId, contenido, initialValues])

  // Advertencia de salida
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isFormDirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isFormDirty])

  const insertLink = (text: string = '') => {
    setSelectionForLink(text)
    setIsLinkModalOpen(true)
  }

  // Validar formulario
  const validate = () => {
    const nextErrors: FieldErrors = {}

    if (!titulo.trim()) {
      nextErrors.titulo = 'El título es obligatorio.'
    }

    if (!selectedImageFile && !imagen.trim()) {
      nextErrors.imagen = 'La imagen es obligatoria.'
    }

    if (!categoriaId) {
      nextErrors.categoria_id = 'Selecciona una categoría.'
    }

    if (!contenido.trim()) {
      nextErrors.contenido = 'El contenido es obligatorio.'
    }

    return nextErrors
  }

  // Envía el formulario
  const submitBlog = async (accion: BlogCreationAction) => {
    const errors = validate()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      // Subir imagen si hay un archivo seleccionado
      let finalImageUrl = imagen.trim()
      if (selectedImageFile) {
        const uploadRes = await uploadBlogImage(selectedImageFile)
        finalImageUrl = uploadRes.url
      }

      const payload = {
        titulo: titulo.trim(),
        imagen: finalImageUrl,
        categoria_id: Number(categoriaId),
        contenido: contenido.trim(),
        accion
      }

      if (mode === 'edit' && blogId) {
        await updateBlog(blogId, payload)
      } else {
        await createBlog(payload)
      }

      setSuccessMessage('Blog guardado exitosamente.')
      window.localStorage.removeItem(autosaveKey)

      setTimeout(() => {
        router.push('/blogs')
      }, 2500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    // valores
    titulo,
    imagen,
    categoriaId,
    contenido,

    // setters
    setTitulo,
    setImagen,
    setCategoriaId,
    setContenido,

    // estado general
    categories,
    isLoadingCategories,
    loadError,
    autosaveMessage,
    isSubmitting,
    submitError,
    successMessage,
    fieldErrors,

    // refs / utils
    router,
    autosaveKey,

    // derivados
    imagePreviewUrl,
    isFormDirty,

    // acciones
    setFieldErrors,
    validate,
    insertLink,
    setIsLinkModalOpen,
    isLinkModalOpen,
    selectionForLink,
    setSelectedImageFile,
    selectedImageFile,
    submitBlog
  }
}
