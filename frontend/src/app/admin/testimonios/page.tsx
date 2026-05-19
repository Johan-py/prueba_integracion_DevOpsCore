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
      calificacion: testimonio.calificacion || 5,
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
          calificacion: editingData.calificacion,
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
            <p className="mt-2 text-stone-600 font-inter max-w-2xl">
              Administra las reseñas que aparecen en el Home. Selecciona un departamento y crea testimonios con estilo.
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

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-amber-600 tracking-[0.12em]">Listado</p>
                  <h2 className="text-xl font-semibold text-stone-900">Testimonios creados</h2>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-stone-100 bg-stone-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                    <span>{testimonios.length} testimonios</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider">Departamento</th>
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider">Persona</th>
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider">Calificación</th>
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider text-center">Likes</th>
                        <th className="px-6 py-3 text-xs font-semibold text-stone-600 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {isLoading ? (
                        [1, 2, 3].map((i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-6 py-8">
                              <div className="h-4 rounded-lg bg-stone-100"></div>
                            </td>
                          </tr>
                        ))
                      ) : testimoniosFiltrados.length > 0 ? (
                        testimoniosFiltrados.map((t) => (
                          <tr key={t.id} className="group hover:bg-stone-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-amber-900 font-bold shadow-sm">
                                  {String(t.departamento || '').charAt(0) || '?'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-stone-900">{t.departamento}</span>
                                  <span className="text-xs text-stone-500">{t.zonaBarrio}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold overflow-hidden">
                                  {String(t.nombreTestimonial || '').charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-stone-900">{t.nombreTestimonial}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                {t.categoria}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= (t.calificacion || 0)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-bold text-stone-600">{t.likes || 0}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(t)}
                                  className="rounded-lg p-2 text-stone-400 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(t.id)}
                                  className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-sm text-stone-500">
                            No hay testimonios registrados aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:px-6 overflow-hidden">
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
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 sm:px-6 overflow-hidden backdrop-blur-sm">
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

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-semibold text-stone-700 mb-2">Calificación</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditingData({ ...editingData, calificacion: num })}
                          className={`h-10 w-10 rounded-xl border text-sm font-bold transition-all ${
                            (editingData.calificacion ?? 5) >= num
                              ? 'border-amber-500 bg-amber-500 text-white shadow-lg'
                              : 'border-stone-200 bg-stone-50 text-stone-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <input
                      type="checkbox"
                      id="edit-activo"
                      checked={editingData.activo ?? false}
                      onChange={(e) => setEditingData({ ...editingData, activo: e.target.checked })}
                      className="h-6 w-6 rounded-lg border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="edit-activo" className="text-sm font-bold text-stone-700 cursor-pointer">Testimonio Visible</label>
                  </div>
                </div>

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-700 text-sm font-semibold animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMessage}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-white hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:brightness-110 active:scale-[0.98]"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:px-6">
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