'use client'

import { useEffect, useState } from 'react'
import { Package, Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface Plan {
  id: number
  nombre_plan: string | null
  descripcion_plan: string | null
  precio_plan: number
  duracion_plan_dias: number | null
  nro_publicaciones_plan: number | null
  imagen_gr_url: string | null
}

const EMPTY: Omit<Plan, 'id'> = {
  nombre_plan: '',
  descripcion_plan: '',
  precio_plan: 0,
  duracion_plan_dias: 30,
  nro_publicaciones_plan: 10,
  imagen_gr_url: '',
}

export default function AdminPlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Plan, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchPlanes = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/admin/planes`, { headers })
      if (!res.ok) throw new Error('Error al cargar los planes')
      setPlanes(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlanes() }, []) // eslint-disable-line

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (p: Plan) => {
    setEditId(p.id)
    setForm({
      nombre_plan: p.nombre_plan ?? '',
      descripcion_plan: p.descripcion_plan ?? '',
      precio_plan: p.precio_plan,
      duracion_plan_dias: p.duracion_plan_dias ?? 30,
      nro_publicaciones_plan: p.nro_publicaciones_plan ?? 10,
      imagen_gr_url: p.imagen_gr_url ?? '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nombre_plan?.trim()) return
    if (form.precio_plan < 0) {
      setError('El precio no puede ser negativo')
      return
    }
    setSaving(true)
    try {
      const url = editId
        ? `${API_URL}/api/admin/planes/${editId}`
        : `${API_URL}/api/admin/planes`
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      setShowForm(false)
      setSuccessMsg(editId ? 'Plan actualizado' : 'Plan creado')
      setTimeout(() => setSuccessMsg(null), 3000)
      await fetchPlanes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/planes/${deleteId}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al eliminar')
      }
      setDeleteId(null)
      setSuccessMsg('Plan eliminado')
      setTimeout(() => setSuccessMsg(null), 3000)
      await fetchPlanes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-amber-600" />
            <h1 className="text-2xl font-bold font-montserrat text-stone-900">
              Gestión de <span className="text-amber-600">Planes</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo plan
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <Check className="h-4 w-4 shrink-0" />
            <span className="text-sm">{successMsg}</span>
          </div>
        )}

        {/* Plans list */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : planes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-400">
            No hay planes aún. Crea el primero.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {planes.map((p) => (
              <div key={p.id} className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm flex flex-col gap-3">
                {p.imagen_gr_url && (
                  <img
                    src={p.imagen_gr_url}
                    alt={`QR ${p.nombre_plan}`}
                    className="h-28 w-28 mx-auto object-contain rounded-lg border border-stone-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">{p.nombre_plan}</h3>
                  {p.descripcion_plan && (
                    <p className="mt-0.5 text-sm text-stone-500 line-clamp-2">{p.descripcion_plan}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-stone-600">
                  <span className="rounded-lg bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                    Bs. {p.precio_plan.toFixed(2)}
                  </span>
                  <span className="rounded-lg bg-stone-50 px-2 py-1">
                    {p.duracion_plan_dias ?? '—'} días
                  </span>
                  <span className="rounded-lg bg-stone-50 px-2 py-1 col-span-2">
                    {p.nro_publicaciones_plan ?? '—'} publicaciones
                  </span>
                </div>
                <div className="flex gap-2 mt-auto pt-2 border-t border-stone-100">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-montserrat text-stone-900">
                  {editId ? 'Editar plan' : 'Nuevo plan'}
                </h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-stone-400 hover:text-stone-600" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre del plan *</label>
                  <input
                    type="text"
                    value={form.nombre_plan ?? ''}
                    onChange={(e) => setForm({ ...form, nombre_plan: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                    placeholder="Ej: Estándar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Descripción</label>
                  <textarea
                    value={form.descripcion_plan ?? ''}
                    onChange={(e) => setForm({ ...form, descripcion_plan: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
                    placeholder="Describe los beneficios del plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Precio (Bs.) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.precio_plan}
                      onChange={(e) => setForm({ ...form, precio_plan: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Duración (días)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.duracion_plan_dias ?? ''}
                      onChange={(e) => setForm({ ...form, duracion_plan_dias: parseInt(e.target.value) || null })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">N° publicaciones permitidas</label>
                  <input
                    type="number"
                    min="1"
                    value={form.nro_publicaciones_plan ?? ''}
                    onChange={(e) => setForm({ ...form, nro_publicaciones_plan: parseInt(e.target.value) || null })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">URL del QR de pago</label>
                  <input
                    type="url"
                    value={form.imagen_gr_url ?? ''}
                    onChange={(e) => setForm({ ...form, imagen_gr_url: e.target.value || null })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                    placeholder="https://... o /qrs/mi-qr.png"
                  />
                  {form.imagen_gr_url && (
                    <img
                      src={form.imagen_gr_url}
                      alt="Vista previa QR"
                      className="mt-2 h-24 w-24 object-contain rounded-lg border border-stone-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.nombre_plan?.trim()}
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear plan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
              <h2 className="text-lg font-bold font-montserrat text-stone-900">¿Eliminar plan?</h2>
              <p className="text-sm text-stone-500">
                El plan se eliminará permanentemente. Los usuarios con suscripciones activas conservarán su plan hasta la fecha de vencimiento. No se puede eliminar si hay suscripciones activas vigentes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
