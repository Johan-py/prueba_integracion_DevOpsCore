'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, Camera, Loader2 } from 'lucide-react'
import SecurityModal from './SecurityModal'
import OtpModal from './OtpModal'

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
    { nombre: 'Bolivia', codigo: '+591', flag: '🇧🇴', digitos: 8 },
    { nombre: 'Argentina', codigo: '+54', flag: '🇦🇷', digitos: 10 },
    { nombre: 'Chile', codigo: '+56', flag: '🇨🇱', digitos: 9 },
    { nombre: 'Perú', codigo: '+51', flag: '🇵🇪', digitos: 9 }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Función para ocultar el correo (Ej: jo***@gmail.com)
const ofuscarEmail = (email: string) => {
  if (!email || !email.includes('@')) return email
  const [usuario, dominio] = email.split('@')
  if (usuario.length <= 2) return `**@${dominio}`
  return `${usuario.substring(0, 2)}***@${dominio}`
}

export default function ProfileCard() {
  const [campoEditando, setCampoEditando] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [perfilData, setPerfilData] = useState<PerfilData | null>(null)
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState('')
  const [genero, setGenero] = useState('')
  const [direccion, setDireccion] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [errorNombre, setErrorNombre] = useState("");

  const [originalNombre] = useState("");
  const [originalPais] = useState("");
  const [originalGenero] = useState("");
  const [originalDireccion] = useState("");

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isEmailEditable, setIsEmailEditable] = useState(false)
  const [originalEmail, setOriginalEmail] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [otpError, setOtpError] = useState('')
  const [emailToUpdate, setEmailToUpdate] = useState('')

  const [telefonos, setTelefonos] = useState<Telefono[]>([
    { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
  ])

  const soloLetras = (value: string) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  const getToken = () => localStorage.getItem('token')

  const syncNavbar = () => {
    window.dispatchEvent(new Event('storage'))
  }

  const cargarPerfil = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_URL}/api/perfil/usuario`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.ok && data.perfil) {
        const perfil = data.perfil
        const foto = perfil.avatar || perfil.fotoPerfil || null
        setPerfilData(perfil)
        setNombre(perfil.nombre || '')
        setPais(perfil.pais || '')
        setGenero(perfil.genero || '')
        setDireccion(perfil.direccion || '')
        setAvatar(foto)
        setOriginalEmail(perfil.correo || '')
        setTempEmail(perfil.correo || '')

        localStorage.setItem('nombre', perfil.nombre || '')
        localStorage.setItem('correo', perfil.correo || '')
        if (foto) localStorage.setItem('avatar', foto)
        syncNavbar()

        if (perfil.telefonos && Array.isArray(perfil.telefonos) && perfil.telefonos.length > 0) {
          setTelefonos(perfil.telefonos.map((tel: any, i: number) => ({
            id: Date.now() + i,
            numero: tel.numero,
            pais: PAISES.find(p => tel.codigoPais === p.codigo)?.nombre || 'Bolivia',
            codigo: tel.codigoPais
          })))
        } else {
          setTelefonos([{ id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarPerfil() }, [])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const hasEmailChanged = tempEmail !== originalEmail && isValidEmail(tempEmail)

  const guardarNombre = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/perfil/usuario/nombre`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nombre })
      })
      const data = await response.json()
      if (data.ok) {
        localStorage.setItem('nombre', nombre)
        syncNavbar()
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

  const guardarPais = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/perfil/usuario/pais`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
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

  const guardarGenero = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/perfil/usuario/genero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
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

  const guardarDireccion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/perfil/usuario/direccion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
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

      const response = await fetch(`${API_URL}/api/perfil/usuario/telefonos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.ok) {
        alert('Teléfonos actualizados exitosamente')
        setCampoEditando(null)
        cargarPerfil()
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar teléfonos')
    } finally {
      setIsLoading(false)
    }
  }

  const subirFoto = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const response = await fetch(`${API_URL}/api/perfil/usuario/foto-perfil`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })
      const data = await response.json()
      if (data.ok) {
        const nuevaFoto = data.fotoPerfil || data.avatar
        setAvatar(nuevaFoto)
        localStorage.setItem('avatar', nuevaFoto)
        syncNavbar()
        alert('Foto actualizada exitosamente')
        cargarPerfil()
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al subir foto')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasswordSubmit = async (passwordActual: string) => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) throw new Error('No hay sesión activa')

      const verifyRes = await fetch(`${API_URL}/api/perfil/verificar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ passwordActual })
      })

      const verifyData = await verifyRes.json()
      if (!verifyData.ok) throw new Error(verifyData.msg)

      setIsSecurityModalOpen(false)
      setIsEmailEditable(true)
      setTempEmail(originalEmail)
    } catch (error: any) {
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

      const solicitarData = await solicitarRes.json()
      if (!solicitarData.ok) throw new Error(solicitarData.msg)

      setEmailToUpdate(nuevoEmail)
      setIsOtpModalOpen(true)
      setOtpError('')
    } catch (error: any) {
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

      const data = await response.json()
      if (!data.ok) throw new Error(data.msg)

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

      const data = await response.json()
      if (!data.ok) throw new Error(data.msg)

      setOtpError('')
      alert('Se ha enviado un nuevo código a tu correo')
    } catch (error: any) {
      setOtpError(error.message || 'Error al reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

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
            telefonos.map((t) => {
                if (t.id === id) {
                    const configPais = PAISES.find(p => p.nombre === t.pais);
                    const maxDigitos = configPais?.digitos || 15;

                    const soloNumerosYCortados = valor.replace(/\D/g, '').slice(0, maxDigitos);

                    return { ...t, numero: soloNumerosYCortados };
                }
                return t;
            })
        )
    }

  const handleSaveAll = () => {
    if (isEmailEditable && hasEmailChanged) {
      solicitarCambioEmail(tempEmail)
    } else if (isEmailEditable && !hasEmailChanged) {
      setIsEmailEditable(false)
    }

    if (campoEditando && campoEditando.startsWith('telefono-')) {
      guardarTelefonos()
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

  const hayCambios =
  nombre !== originalNombre ||
  pais !== originalPais ||
  genero !== originalGenero ||
  direccion !== originalDireccion ||
  tempEmail !== originalEmail;

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

      <div className="relative mb-10"> 

        {/* AVATAR */}
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

        {/* BOTÓN + */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="
            absolute
            right-0 top-1/2 -translate-y-1/2   /* 📱 móvil → derecha */
            md:right-1/2 md:translate-x-1/2 md:top-full md:mt-6  /* 💻 pc → abajo con espacio */
            w-8 h-8 bg-white border border-gray-300 rounded-full
            flex items-center justify-center shadow-sm hover:bg-gray-100
            disabled:opacity-50
          "
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />  
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          hidden
          onChange={(e) => e.target.files?.[0] && subirFoto(e.target.files[0])}
        />

      </div>

      <p className="mt-4 font-semibold text-lg">{nombre}</p>
      {/* CORREO OCULTO EN LA BARRA LATERAL */}
      <p className="text-sm text-gray-500">{isEmailEditable ? originalEmail : ofuscarEmail(originalEmail)}</p>

    </div>

      {/* FORMULARIO */}
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900">Datos Personales</h2>

        <div className="flex flex-col gap-4">
          {/* NOMBRE */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
  
  <label className="w-full md:w-40 font-medium text-stone-700">
    Nombre Completo:
  </label>

  <div className="flex flex-col w-full">

    <div className="flex items-center gap-2">
      <input
        type="text"
        disabled={campoEditando !== 'nombre'}
        value={nombre}
        onChange={(e) => {
          setNombre(soloLetras(e.target.value));
          if (errorNombre) setErrorNombre(""); 
        }}
        className={`flex-1 px-3 py-2 rounded text-sm ${
          errorNombre
            ? "border border-red-500 bg-red-50"
            : campoEditando === 'nombre'
              ? 'bg-white border border-amber-500'
              : 'bg-gray-200 cursor-not-allowed'
        }`}
      />

      <button
        onClick={() => setCampoEditando(campoEditando === 'nombre' ? null : 'nombre')}
      >
        <Pencil size={16} />
      </button>
    </div>

    {errorNombre && (
      <span className="text-red-500 text-xs mt-1">
        {errorNombre}
      </span>
    )}
  </div>
</div>

          {/* EMAIL - ALINEADO Y OCULTO */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">E-mail:</label>
            
              <div className="flex w-full items-center gap-2">
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded text-sm text-stone-700 ${isEmailEditable ? 'bg-white border border-amber-500' : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  readOnly={!isEmailEditable}
                  /* CORREO OCULTO EN EL INPUT */
                  value={isEmailEditable ? tempEmail : ofuscarEmail(originalEmail)}
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
            
          </div>
          {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
            <div className="md:ml-44">
                <span className="text-red-500 text-xs mt-1">Formato de correo inválido</span>
            </div>
          )}
          {isEmailEditable && hasEmailChanged && (
            <div className="md:ml-44">
                <span className="text-green-500 text-xs mt-1">Listo para guardar cambios</span>
            </div>
          )}

          {/* TELÉFONOS */}
          {telefonos.map((tel, index) => {
            const keyCampo = `telefono-${tel.id}`
            return (
              <div
                key={tel.id}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
              >
                <label className="w-full md:w-40 font-medium text-stone-700">
                  {index === 0 ? 'Teléfono:' : `Teléfono ${index + 1}:`}
                </label>
                <div className="flex w-full items-center gap-2">
                  <select
                    disabled={campoEditando !== keyCampo}
                    value={`${tel.pais} ${tel.codigo}`}
                    onChange={(e) => {
                      const seleccion = PAISES.find((p) => `${p.nombre} ${p.codigo}` === e.target.value)
                      if (seleccion) {
                        setTelefonos(
                          telefonos.map((t) =>
                            t.id === tel.id ? { ...t, pais: seleccion.nombre, codigo: seleccion.codigo } : t
                          )
                        )
                      }
                    }}
                    className={`px-2 py-2 rounded text-sm ${
                      campoEditando === keyCampo
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
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      campoEditando === keyCampo
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
                    {index === 0 && (
                        <button
                            onClick={agregarTelefono}
                            disabled={telefonos.length >= 3}
                            className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-orange-600 transition-colors"
                        >
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
            {telefonos.length >= 3 && (
                <p className="text-[10px] text-orange-600 font-medium md:ml-44 mt-1">
                    * Has alcanzado el límite máximo de 3 números de contacto.
                </p>
            )}

          {/* PAÍS */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700">País:</label>
            <div className="flex w-full items-center gap-2">
              <select
                disabled={campoEditando !== 'pais'}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm ${campoEditando === 'pais'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }`}
              >
                <option value="">Seleccione un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
              </select>
              <button onClick={() => setCampoEditando(campoEditando === 'pais' ? null : 'pais')}>
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
                className={`flex-1 px-3 py-2 rounded text-sm ${campoEditando === 'genero'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }`}
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <button onClick={() => setCampoEditando(campoEditando === 'genero' ? null : 'genero')}>
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
                className={`flex-1 px-3 py-2 rounded text-sm ${campoEditando === 'direccion'
                    ? 'bg-white border border-amber-500'
                    : 'bg-gray-200 cursor-not-allowed'
                  }`}
              />
              <button onClick={() => setCampoEditando(campoEditando === 'direccion' ? null : 'direccion')}>
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
                   onClick={() => {
    if (!nombre.trim()) {
      setErrorNombre("El nombre es obligatorio");
      return;
    }

    setErrorNombre("");
    handleSaveAll();
  }}
  disabled={isLoading || !hayCambios}
  className={`px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition
    ${!hayCambios
      ? "bg-orange-300 cursor-not-allowed text-white"
      : "bg-orange-500 hover:bg-orange-600 text-white"}
  `}
>
  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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