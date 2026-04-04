'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, Camera, Loader2 } from 'lucide-react'
import SecurityModal from './SecurityModal'
import OtpModal from './OtpModal'
import Image from 'next/image'

interface Telefono {
  id: number
  numero: string
  pais: string
  codigo: string
}

interface PerfilData {
  id: number
  nombre: string
  correo: string
  avatar: string | null
  pais: string | null
  genero: string | null
  direccion: string | null
  telefonos: any[] | null
}

const PAISES = [
  { nombre: 'Bolivia', codigo: '+591', flag: '🇧🇴' },
  { nombre: 'Argentina', codigo: '+54', flag: '🇦🇷' },
  { nombre: 'Chile', codigo: '+56', flag: '🇨🇱' },
  { nombre: 'Perú', codigo: '+51', flag: '🇵🇪' }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ProfileCard() {
  const [campoEditando, setCampoEditando] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Datos del perfil
  const [perfilData, setPerfilData] = useState<PerfilData | null>(null)
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState('')
  const [genero, setGenero] = useState('')
  const [direccion, setDireccion] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)

  // ========== FUNCIONALIDAD DE EMAIL CON OTP ==========
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isEmailEditable, setIsEmailEditable] = useState(false)
  const [originalEmail, setOriginalEmail] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [otpError, setOtpError] = useState('')
  const [emailToUpdate, setEmailToUpdate] = useState('')

  // Teléfonos
  const [telefonos, setTelefonos] = useState<Telefono[]>([
    { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
  ])

  const soloLetras = (value: string) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  }

  // Obtener token
  const getToken = () => localStorage.getItem('token')

  // ========== CARGAR DATOS DEL PERFIL ==========
  const cargarPerfil = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        console.error('No hay token')
        return
      }

      const response = await fetch(`${API_URL}/api/perfil/usuario`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('Respuesta cargar perfil:', data)

      if (data.ok && data.perfil) {
        const perfil = data.perfil
        setPerfilData(perfil)
        setNombre(perfil.nombre || '')
        setPais(perfil.pais || '')
        setGenero(perfil.genero || '')
        setDireccion(perfil.direccion || '')
        setAvatar(perfil.avatar || perfil.fotoPerfil || null)
        setOriginalEmail(perfil.correo || '')
        setTempEmail(perfil.correo || '')

        // Cargar teléfonos si existen
        if (perfil.telefonos && Array.isArray(perfil.telefonos) && perfil.telefonos.length > 0) {
          const telefonosCargados = perfil.telefonos.map((tel: any, index: number) => {
            const paisEncontrado = PAISES.find(p => tel.codigoPais === p.codigo) || PAISES[0]
            return {
              id: Date.now() + index,
              numero: tel.numero,
              pais: paisEncontrado.nombre,
              codigo: paisEncontrado.codigo
            }
          })
          setTelefonos(telefonosCargados)
        } else {
          setTelefonos([{ id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }])
        }

        // Guardar en localStorage
        localStorage.setItem('nombre', perfil.nombre || '')
        localStorage.setItem('correo', perfil.correo || '')
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarPerfil()
  }, [])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const hasEmailChanged = tempEmail !== originalEmail && isValidEmail(tempEmail)

  // ========== FUNCIONES DE EDICIÓN ==========

  // Editar nombre
  const guardarNombre = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/perfil/usuario/nombre`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      })

      const data = await response.json()
      if (data.ok) {
        localStorage.setItem('nombre', nombre)
        alert('Nombre actualizado exitosamente')
        setCampoEditando(null)
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar nombre')
    } finally {
      setIsLoading(false)
    }
  }

  // Editar país
  const guardarPais = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/perfil/usuario/pais`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pais })
      })

      const data = await response.json()
      if (data.ok) {
        alert('País actualizado exitosamente')
        setCampoEditando(null)
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar país')
    } finally {
      setIsLoading(false)
    }
  }

  // Editar género
  const guardarGenero = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/perfil/usuario/genero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ genero })
      })

      const data = await response.json()
      if (data.ok) {
        alert('Género actualizado exitosamente')
        setCampoEditando(null)
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar género')
    } finally {
      setIsLoading(false)
    }
  }

  // Editar dirección
  const guardarDireccion = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/perfil/usuario/direccion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ direccion })
      })

      const data = await response.json()
      if (data.ok) {
        alert('Dirección actualizada exitosamente')
        setCampoEditando(null)
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar dirección')
    } finally {
      setIsLoading(false)
    }
  }

  // ========== FUNCIONALIDAD DE FOTO ==========
  const handleFotoClick = () => {
    fileInputRef.current?.click()
  }

  const subirFoto = async (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB')
      return
    }

    setIsUploading(true)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('foto', file)

      const response = await fetch(`${API_URL}/api/perfil/usuario/foto-perfil`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      console.log('Respuesta upload foto:', data)

      if (data.ok) {
        setAvatar(data.fotoPerfil || data.avatar || null)
        alert('Foto de perfil actualizada exitosamente')
        // Recargar perfil para actualizar datos
        cargarPerfil()
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      console.error('Error al subir foto:', error)
      alert(error.message || 'Error al subir la foto')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      subirFoto(file)
    }
    // Limpiar el input para poder subir el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ========== FUNCIONALIDAD DE EMAIL CON OTP ==========
  const handlePasswordSubmit = async (passwordActual: string) => {
    setIsLoading(true)
    try {
      const token = getToken()

      if (!token) {
        throw new Error('No hay sesión activa. Inicia sesión nuevamente.')
      }

      const verifyRes = await fetch(`${API_URL}/api/perfil/verificar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ passwordActual })
      })

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({ msg: 'Error al verificar contraseña' }))
        throw new Error(errorData.msg || 'Error al verificar contraseña')
      }

      const verifyData = await verifyRes.json()

      if (!verifyData.ok) {
        throw new Error(verifyData.msg)
      }

      setIsSecurityModalOpen(false)
      setIsEmailEditable(true)
      setTempEmail(originalEmail)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Contraseña incorrecta')
    } finally {
      setIsLoading(false)
    }
  }

  const solicitarCambioEmail = async (nuevoEmail: string) => {
    setIsLoading(true)
    try {
      const token = getToken()

      const solicitarRes = await fetch(`${API_URL}/api/perfil/solicitar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailNuevo: nuevoEmail })
      })

      if (!solicitarRes.ok) {
        const errorData = await solicitarRes.json().catch(() => ({ msg: 'Error al solicitar cambio' }))
        throw new Error(errorData.msg || 'Error al solicitar cambio de email')
      }

      const solicitarData = await solicitarRes.json()

      if (!solicitarData.ok) {
        throw new Error(solicitarData.msg)
      }

      setEmailToUpdate(nuevoEmail)
      setIsOtpModalOpen(true)
      setOtpError('')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al solicitar cambio de email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (otp: string) => {
    setIsLoading(true)
    try {
      const token = getToken()

      const response = await fetch(`${API_URL}/api/perfil/confirmar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Error al confirmar código' }))
        throw new Error(errorData.msg || 'Error al confirmar código')
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.msg)
      }

      localStorage.setItem('correo', emailToUpdate)
      setOriginalEmail(emailToUpdate)
      setTempEmail(emailToUpdate)
      setIsEmailEditable(false)
      setIsOtpModalOpen(false)
      setEmailToUpdate('')
      setOtpError('')
      alert('Correo actualizado exitosamente')
      cargarPerfil()
    } catch (error: any) {
      console.error('Error:', error)
      setOtpError(error.message || 'Error al verificar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const emailNuevo = emailToUpdate || tempEmail

      const response = await fetch(`${API_URL}/api/perfil/solicitar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailNuevo })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Error al reenviar código' }))
        throw new Error(errorData.msg || 'Error al reenviar código')
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.msg)
      }

      setOtpError('')
      alert('Se ha enviado un nuevo código a tu correo')
    } catch (error: any) {
      console.error('Error:', error)
      setOtpError(error.message || 'Error al reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

  // ========== TELÉFONOS ==========
  const agregarTelefono = () => {
    if (telefonos.length < 3) {
      setTelefonos([...telefonos, { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }])
    }
  }

  const eliminarTelefono = (id: number) => {
    if (telefonos.length > 1) {
      setTelefonos(telefonos.filter((t) => t.id !== id))
    }
  }

  const actualizarTelefono = (id: number, valor: string) => {
    setTelefonos(
      telefonos.map((t) => (t.id === id ? { ...t, numero: valor.replace(/\D/g, '') } : t))
    )
  }

  const guardarTelefonos = async () => {
    setIsLoading(true)
    try {
      const token = getToken()

      const body = {
        telefonos: telefonos
          .filter((t) => t.numero.trim() !== '')
          .map((t, index) => ({
            codigoPais: t.codigo,
            numero: t.numero,
            principal: index === 0
          }))
      }

      const res = await fetch(`${API_URL}/api/perfil/usuario/telefonos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.msg || 'Error al actualizar teléfonos')
      }

      alert('¡Teléfonos actualizados exitosamente!')
      setCampoEditando(null)
      cargarPerfil()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar guardado general
  const handleSaveAll = () => {
    if (isEmailEditable && hasEmailChanged) {
      solicitarCambioEmail(tempEmail)
    } else if (isEmailEditable && !hasEmailChanged) {
      setIsEmailEditable(false)
    }

    if (campoEditando && campoEditando.startsWith('telefono-')) {
      guardarTelefonos()
      setCampoEditando(null)
      return
    }

    if (campoEditando === 'nombre') {
      guardarNombre()
    } else if (campoEditando === 'pais') {
      guardarPais()
    } else if (campoEditando === 'genero') {
      guardarGenero()
    } else if (campoEditando === 'direccion') {
      guardarDireccion()
    } else if (campoEditando) {
      setCampoEditando(null)
    }
  }

  const handleCancelAll = () => {
    setCampoEditando(null)
    if (perfilData) {
      setNombre(perfilData.nombre || '')
      setPais(perfilData.pais || '')
      setGenero(perfilData.genero || '')
      setDireccion(perfilData.direccion || '')
    }
    setTempEmail(originalEmail)
    setIsEmailEditable(false)
  }

  const handleEditEmailClick = () => {
    setIsSecurityModalOpen(true)
  }

  if (isLoading && !perfilData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="bg-[#fdf6e6] border border-[#e5dfd7] shadow-sm p-8 rounded-xl flex flex-col md:flex-row gap-10 items-center">
      {/* PERFIL */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm overflow-hidden">
            {avatar ? (
              <img
                src={avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-xs uppercase">Imagen</span>
            )}
          </div>
          <button
            onClick={handleFotoClick}
            disabled={isUploading}
            className="absolute right-0 top-1/2 -translate-y-1/2 md:right-1/2 md:translate-x-1/2 md:top-full md:mt-4 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="mt-4 font-semibold text-lg">{nombre}</p>
        <p className="text-sm text-gray-500">{originalEmail}</p>
      </div>

      {/* FORMULARIO */}
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900">Datos Personales</h2>

        <div className="flex flex-col gap-4">
          {/* NOMBRE */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">Nombre Completo:</label>
            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                disabled={campoEditando !== 'nombre'}
                value={nombre}
                onChange={(e) => setNombre(soloLetras(e.target.value))}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === 'nombre'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }
                `}
              />
              <button
                onClick={() => setCampoEditando(campoEditando === 'nombre' ? null : 'nombre')}
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 pt-2">E-mail:</label>
            <div className="flex-1 flex flex-col">
              <div className="flex w-full items-center gap-2">
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded text-sm text-stone-700 
                    ${isEmailEditable ? 'bg-white border border-amber-500' : 'bg-gray-200'}
                  `}
                  readOnly={!isEmailEditable}
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                <button
                  onClick={handleEditEmailClick}
                  className="text-black hover:text-amber-600"
                  disabled={isEmailEditable}
                >
                  <Pencil size={16} />
                </button>
              </div>
              {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
                <span className="text-red-500 text-xs mt-1">Formato de correo inválido</span>
              )}
              {isEmailEditable && hasEmailChanged && (
                <span className="text-green-500 text-xs mt-1">Listo para guardar cambios</span>
              )}
            </div>
          </div>

          {/* TELÉFONOS */}
          {telefonos.map((tel, index) => {
            const keyCampo = `telefono-${tel.id}`
            return (
              <div key={tel.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-40 font-medium text-stone-700">
                  {index === 0 ? 'Teléfono:' : `Teléfono ${index + 1}:`}
                </label>
                <div className="flex w-full items-center gap-2">
                  <select
                    disabled={campoEditando !== keyCampo}
                    value={`${tel.pais} ${tel.codigo}`}
                    onChange={(e) => {
                      const seleccion = PAISES.find(
                        (p) => `${p.nombre} ${p.codigo}` === e.target.value
                      )
                      if (seleccion) {
                        setTelefonos(
                          telefonos.map((t) =>
                            t.id === tel.id
                              ? { ...t, pais: seleccion.nombre, codigo: seleccion.codigo }
                              : t
                          )
                        )
                      }
                    }}
                    className={`px-2 py-2 rounded text-sm ${campoEditando === keyCampo
                        ? 'bg-white border border-amber-500'
                        : 'bg-gray-200 cursor-not-allowed'
                      }`}
                  >
                    {PAISES.map((p) => (
                      <option key={p.nombre} value={`${p.nombre} ${p.codigo}`}>
                        {p.flag} {p.codigo}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ej. 70000000"
                    value={tel.numero}
                    disabled={campoEditando !== keyCampo}
                    onChange={(e) => actualizarTelefono(tel.id, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm ${campoEditando === keyCampo
                        ? 'bg-white border border-amber-500'
                        : 'bg-gray-200 cursor-not-allowed'
                      }`}
                  />
                  <button
                    onClick={() => setCampoEditando(campoEditando === keyCampo ? null : keyCampo)}
                    className="text-black"
                  >
                    <Pencil size={16} />
                  </button>
                  {index === 0 && telefonos.length < 3 && (
                    <button onClick={agregarTelefono}>
                      <Plus size={18} />
                    </button>
                  )}
                  {index > 0 && (
                    <button onClick={() => eliminarTelefono(tel.id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* PAÍS */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">País:</label>
            <div className="flex w-full items-center gap-2">
              <select
                disabled={campoEditando !== 'pais'}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === 'pais'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }
                `}
              >
                <option value="">Seleccione un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
              </select>
              <button
                onClick={() => setCampoEditando(campoEditando === 'pais' ? null : 'pais')}
                className="text-black"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* GÉNERO */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">Género:</label>
            <div className="flex w-full items-center gap-2">
              <select
                disabled={campoEditando !== 'genero'}
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === 'genero'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }
                `}
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <button
                onClick={() => setCampoEditando(campoEditando === 'genero' ? null : 'genero')}
                className="text-black"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">Dirección:</label>
            <div className="flex w-full items-center gap-2">
              <input
                disabled={campoEditando !== 'direccion'}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm
                  ${campoEditando === 'direccion'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }
                `}
              />
              <button
                onClick={() => setCampoEditando(campoEditando === 'direccion' ? null : 'direccion')}
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCancelAll}
              className="text-stone-600 hover:text-black text-sm"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false)
          setIsLoading(false)
        }}
        onSubmit={handlePasswordSubmit}
        isLoading={isLoading}
      />
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => {
          setIsOtpModalOpen(false)
          setOtpError('')
          setEmailToUpdate('')
          setIsLoading(false)
          setIsEmailEditable(false)
          setTempEmail(originalEmail)
        }}
        onSubmit={handleOtpSubmit}
        onResendCode={handleResendCode}
        externalError={otpError}
        isLoading={isLoading}
      />
    </div>
  )
}