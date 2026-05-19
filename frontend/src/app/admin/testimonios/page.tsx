'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  List,
  MessageCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Heart,
  Send,
} from 'lucide-react'
import FormularioTestimonios from './formularioTestimonio'

interface Testimonio {
  id: number
  nombreTestimonial: string
  creadoPor: string
  departamento: string
  zonaBarrio: string
  categoria: string
  texto: string
  avatar: string | null
  likes: number
  activo: boolean
  calificacion: number
}

interface EditingTestimonio extends Partial<Testimonio> {
  // campos para edición
}

export default function AdminTestimoniosPage() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<Partial<EditingTestimonio>>({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [editUserName, setEditUserName] = useState('')
  const [editUserLastName, setEditUserLastName] = useState('')

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

  useEffect(() => {
    if (showForm || showEditModal || showDeleteConfirm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showForm, showEditModal, showDeleteConfirm])

  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/admin/testimonios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Error al obtener testimonios')
        }

        const data = await response.json()
        setTestimonios(data)
      } catch (error) {
        console.error('Error al cargar testimonios:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonios()
  }, [API_URL])

  const handleEditClick = (testimonio: Testimonio) => {
    setEditingId(testimonio.id)
    setEditingData({
      departamento: testimonio.departamento,
      zonaBarrio: testimonio.zonaBarrio,
      categoria: testimonio.categoria,
      texto: testimonio.texto,
      activo: testimonio.activo,
    })
    const nameParts = (testimonio.nombreTestimonial || '').split(' ')
    setEditUserName(nameParts[0] || '')
    setEditUserLastName(nameParts.slice(1).join(' ') || '')
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_URL}/api/admin/testimonios/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comentario: editingData.texto,
          ciudad: editingData.departamento,
          zona: editingData.zonaBarrio,
          categoria: editingData.categoria,
          visible: editingData.activo,
          nombreAutor: editUserName.trim(),
          apellidoAutor: editUserLastName.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Error al actualizar')

      setTestimonios((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                departamento: data.departamento || t.departamento,
                zonaBarrio: data.zonaBarrio || t.zonaBarrio,
                categoria: data.categoria || t.categoria,
                texto: data.texto || t.texto,
                activo: data.activo !== undefined ? data.activo : t.activo,
                nombreTestimonial: data.nombreTestimonial || t.nombreTestimonial,
                calificacion: data.calificacion || t.calificacion,
                likes: data.likes !== undefined ? data.likes : t.likes,
              }
            : t
        )
      )

      setSuccessMessage('✅ Testimonio actualizado correctamente')
      setTimeout(() => {
        setShowEditModal(false)
        setSuccessMessage('')
      }, 2000)
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar testimonio')
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_URL}/api/admin/testimonios/${deletingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setTestimonios((prev) => prev.filter((t) => t.id !== deletingId))
      setShowDeleteConfirm(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar testimonio')
    }
  }

  const testimoniosFiltrados = testimonios.filter(
    (t) =>
      (t.departamento ?? '').toLowerCase().includes(filter.toLowerCase()) ||
      (t.zonaBarrio ?? '').toLowerCase().includes(filter.toLowerCase()) ||
      (t.categoria ?? '').toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-montserrat text-stone-900">
              Gestión de <span className="text-amber-600">Testimonios</span>
            </h1>
            <p className="mt-2 text-stone-500 text-sm max-w-2xl">
              Administra y publica los testimonios del carrusel.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:brightness-110"
          >
            <Plus className="h-5 w-5" />
            Nuevo Testimonio
          </button>
        </div>

        <div className="grid gap-8">
          <section className="space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-xl border border-amber-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <input
                    type="text"
                    placeholder="Buscar por ciudad, zona o categoría..."
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-10 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                    {testimonios.length} gestionados
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-stone-800">Testimonios creados</h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-stone-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                    <MessageCircle className="h-5 w-5 text-amber-500" />
                    <span>{testimoniosFiltrados.length} testimonios</span>
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {testimonios.length} total
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-stone-100">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-6">
                        <div className="h-24 rounded-lg bg-stone-100"></div>
                      </div>
                    ))
                  ) : testimoniosFiltrados.length > 0 ? (
                    testimoniosFiltrados.map((t) => (
                      <div key={t.id} className="flex flex-col sm:flex-row gap-4 p-6 hover:bg-stone-50 transition-colors relative">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-lg">
                            {(t.nombreTestimonial || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-col">
                            <h3 className="font-bold text-stone-900">{t.nombreTestimonial}</h3>
                            <p className="text-xs text-stone-400">{t.zonaBarrio} · {t.departamento}</p>
                          </div>
                          
                          <div className="self-start">
                            <span className="inline-block rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              {t.categoria}
                            </span>
                          </div>

                          <p className="text-sm italic text-stone-500">
                            "{t.texto}"
                          </p>

                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-stone-400">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm font-medium">{t.likes || 0}</span>
                            </div>
                            {t.activo ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                                Publicado
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-500">
                                Borrador
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-6">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 text-amber-500 transition hover:bg-amber-50"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(t.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-400 transition hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-16 text-center text-sm text-stone-500">
                      No hay testimonios registrados aún.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6 sm:px-6 overflow-hidden">
            <div className="w-full max-w-3xl rounded-2xl bg-gradient-to-br from-white via-amber-50 to-orange-50 p-4 shadow-2xl ring-1 ring-amber-100 sm:p-6 max-h-[80vh] overflow-hidden">
              <div className="flex justify-end px-2 py-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="text-stone-500 hover:text-stone-700 text-xl font-light"
                  aria-label="Cerrar formulario"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <FormularioTestimonios
                  onCreate={(nuevoTestimonio: any) => {
                    setTestimonios((prev) => [nuevoTestimonio as Testimonio, ...prev])
                    setShowForm(false)
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR */}
        {showEditModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-4 sm:px-6 overflow-hidden backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-0 shadow-2xl ring-1 ring-amber-100 flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Editar Testimonio</h3>
                  <p className="text-xs text-stone-500 mt-1">Actualiza la información del testimonio seleccionado.</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Persona (Nombre)
                    </label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                      placeholder="Nombre que aparecerá en el testimonio..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={editUserLastName}
                      onChange={(e) => setEditUserLastName(e.target.value)}
                      className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                      placeholder="Apellido..."
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Departamento
                    </label>
                    <select
                      value={editingData.departamento || ''}
                      onChange={(e) =>
                        setEditingData({ ...editingData, departamento: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">Selecciona un departamento</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Oruro">Oruro</option>
                      <option value="Potosí">Potosí</option>
                      <option value="Tarija">Tarija</option>
                      <option value="Chuquisaca">Chuquisaca</option>
                      <option value="Beni">Beni</option>
                      <option value="Pando">Pando</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Zona / Barrio
                    </label>
                    <input
                      type="text"
                      value={editingData.zonaBarrio || ''}
                      onChange={(e) =>
                        setEditingData({ ...editingData, zonaBarrio: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={editingData.categoria || ''}
                      onChange={(e) =>
                        setEditingData({ ...editingData, categoria: e.target.value })
                      }
                      className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Comentario
                  </label>
                  <textarea
                    value={editingData.texto || ''}
                    onChange={(e) => setEditingData({ ...editingData, texto: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-300 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-6 mt-2">
                  <span className="text-sm font-semibold text-stone-700">Estado de publicación</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingData.activo ?? false}
                      onClick={() => setEditingData({ ...editingData, activo: !editingData.activo })}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        editingData.activo ? 'bg-amber-500' : 'bg-stone-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          editingData.activo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${editingData.activo ? 'text-stone-500' : 'text-stone-400'}`}>
                      {editingData.activo ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-700 text-sm font-semibold animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMessage}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 bg-white flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-stone-200 px-6 py-2.5 text-sm font-bold text-stone-500 transition hover:bg-stone-50 hover:text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6 sm:px-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-200">
              <h3 className="text-lg font-bold text-stone-900 mb-2">¿Eliminar testimonio?</h3>
              <p className="text-sm text-stone-600 mb-6">
                Esta acción marcará el testimonio como eliminado. No se podrá recuperar.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingId(null)
                  }}
                  className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}