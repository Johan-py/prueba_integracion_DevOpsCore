'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CampoError =
  | 'titulo'
  | 'descripcion'
  | 'direccion'
  | 'zona'
  | 'habitaciones'
  | 'banos'
  | 'precio'
  | 'area'
  | 'operacion'
  | null

export default function MiRegistroPage() {
  const router = useRouter()

  const [datos, setDatos] = useState({
    titulo: '',
    operacion: '',
    tipoInmueble: '',
    precio: '',
    area: '',
    habitaciones: '',
    banos: '',
    direccion: '',
    zona: '',
    ciudad: 'Cochabamba',
    descripcion: ''
  })

  const [estado, setEstado] = useState<'ninguno' | 'exito' | 'error'>('ninguno')
  const [mensajeError, setMensajeError] = useState('')
  const [campoError, setCampoError] = useState<CampoError>(null)

  const limpiarError = () => {
    setMensajeError('')
    setCampoError(null)
    setEstado('ninguno')
  }

  const limpiarSoloNumeros = (valor: string) => valor.replace(/\D/g, '')

  const formatearNumero = (valor: string) => {
    const soloNumeros = limpiarSoloNumeros(valor)
    if (!soloNumeros) return ''
    return Number(soloNumeros).toLocaleString('es-BO')
  }

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === 'precio') {
      const soloNumeros = limpiarSoloNumeros(value)

      if (soloNumeros === '') {
        setDatos({ ...datos, precio: '' })
        if (campoError === 'precio') limpiarError()
        return
      }

      const numeroLimitado = Math.min(Number(soloNumeros), 999999999)
      const precioFormateado = formatearNumero(String(numeroLimitado))

      setDatos({ ...datos, precio: precioFormateado })

      if (numeroLimitado < 1) {
        setMensajeError('PRECIO DEBE SER MÍNIMO 1')
        setCampoError('precio')
        setEstado('error')
        return
      }

      if (numeroLimitado >= 999999999) {
        setMensajeError('Has llegado al máximo de 999.999.999')
        setCampoError('precio')
        setEstado('error')
        return
      }

      if (campoError === 'precio') limpiarError()
      return
    }

    if (name === 'area') {
      const soloNumeros = limpiarSoloNumeros(value)

      if (soloNumeros === '') {
        setDatos({ ...datos, area: '' })
        if (campoError === 'area') limpiarError()
        return
      }

      const numeroLimitado = Math.min(Number(soloNumeros), 10000000)
      const areaFormateada = formatearNumero(String(numeroLimitado))

      setDatos({ ...datos, area: areaFormateada })

      if (numeroLimitado >= 10000000) {
        setMensajeError('Has llegado al máximo de 10.000.000')
        setCampoError('area')
        setEstado('error')
        return
      }

      if (campoError === 'area') limpiarError()
      return
    }

    if (name === 'habitaciones') {
      if (value !== '' && Number(value) < 0) return

      if (value === '') {
        setDatos({ ...datos, habitaciones: '' })
        if (campoError === 'habitaciones') limpiarError()
        return
      }

      const numeroHabitaciones = Number(value)

      if (numeroHabitaciones < 1) {
        setDatos({ ...datos, habitaciones: value })
        setMensajeError('HABITACIONES DEBE SER MÍNIMO 1')
        setCampoError('habitaciones')
        setEstado('error')
        return
      }

      if (numeroHabitaciones >= 50) {
        setDatos({ ...datos, habitaciones: '50' })
        setMensajeError('Has llegado al máximo de 50 habitaciones')
        setCampoError('habitaciones')
        setEstado('error')
        return
      }

      setDatos({ ...datos, habitaciones: value })

      if (campoError === 'habitaciones') limpiarError()
      return
    }

    if (name === 'banos') {
      if (value !== '' && Number(value) < 0) return

      if (value === '') {
        setDatos({ ...datos, banos: '' })
        if (campoError === 'banos') limpiarError()
        return
      }

      const numeroBanos = Number(value)

      if (numeroBanos < 1) {
        setDatos({ ...datos, banos: value })
        setMensajeError('BAÑOS DEBE SER MÍNIMO 1')
        setCampoError('banos')
        setEstado('error')
        return
      }

      if (numeroBanos >= 50) {
        setDatos({ ...datos, banos: '50' })
        setMensajeError('Has llegado al máximo de 50 baños')
        setCampoError('banos')
        setEstado('error')
        return
      }

      setDatos({ ...datos, banos: value })

      if (campoError === 'banos') limpiarError()
      return
    }

    const nuevosDatos = { ...datos, [name]: value }
    setDatos(nuevosDatos)

    if (name === 'operacion') {
      if (!value) {
        setMensajeError('DEBE SELECCIONAR EL TIPO DE OPERACIÓN')
        setCampoError('operacion')
        setEstado('error')
      } else {
        if (campoError === 'operacion') limpiarError()
      }
    }

    if (name === 'titulo') {
      const tituloLimpio = value.trim()

      if (!tituloLimpio) {
        setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
        setCampoError('titulo')
        setEstado('error')
      } else if (tituloLimpio.length < 20) {
        setMensajeError('TÍTULO MUY CORTO, DEBE TENER MÍNIMO 20 CARACTERES')
        setCampoError('titulo')
        setEstado('error')
      } else if (tituloLimpio.length >= 80) {
        setMensajeError('Has llegado al máximo de 80 caracteres')
        setCampoError('titulo')
        setEstado('error')
      } else {
        if (campoError === 'titulo') limpiarError()
      }
    }

    if (name === 'descripcion') {
      const descripcionLimpia = value.trim()

      if (!descripcionLimpia) {
        setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
        setCampoError('descripcion')
        setEstado('error')
      } else if (descripcionLimpia.length < 50) {
        setMensajeError('DESCRIPCIÓN MUY CORTA, DEBE TENER MÍNIMO 50 CARACTERES')
        setCampoError('descripcion')
        setEstado('error')
      } else if (descripcionLimpia.length >= 300) {
        setMensajeError('Has llegado al máximo de 300 caracteres')
        setCampoError('descripcion')
        setEstado('error')
      } else {
        if (campoError === 'descripcion') limpiarError()
      }
    }

    if (name === 'direccion') {
      const direccionLimpia = value.trim()

      if (!direccionLimpia) {
        setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
        setCampoError('direccion')
        setEstado('error')
      } else if (direccionLimpia.length < 8) {
        setMensajeError('DIRECCIÓN MUY CORTA, MÍNIMO 8 CARACTERES')
        setCampoError('direccion')
        setEstado('error')
      } else if (direccionLimpia.length >= 80) {
        setMensajeError('Has llegado al máximo de 80 caracteres')
        setCampoError('direccion')
        setEstado('error')
      } else {
        if (campoError === 'direccion') limpiarError()
      }
    }

    if (name === 'zona') {
      const zonaLimpia = value.trim()

      if (!zonaLimpia) {
        setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
        setCampoError('zona')
        setEstado('error')
      } else if (zonaLimpia.length < 8) {
        setMensajeError('ZONA MUY CORTA, MÍNIMO 8 CARACTERES')
        setCampoError('zona')
        setEstado('error')
      } else if (zonaLimpia.length >= 80) {
        setMensajeError('Has llegado al máximo de 80 caracteres')
        setCampoError('zona')
        setEstado('error')
      } else {
        if (campoError === 'zona') limpiarError()
      }
    }
  }

  const guardarPropiedad = async () => {
    setEstado('ninguno')
    setMensajeError('')
    setCampoError(null)

    const tituloLimpio = datos.titulo.trim()
    const descripcionLimpia = datos.descripcion.trim()
    const direccionLimpia = datos.direccion.trim()
    const zonaLimpia = datos.zona.trim()

    const precioNumero = datos.precio !== '' ? Number(limpiarSoloNumeros(datos.precio)) : null
    const areaNumero = datos.area !== '' ? Number(limpiarSoloNumeros(datos.area)) : null
    const habitacionesNumero = datos.habitaciones !== '' ? Number(datos.habitaciones) : null
    const banosNumero = datos.banos !== '' ? Number(datos.banos) : null

    if (!datos.operacion) {
      setMensajeError('DEBE SELECCIONAR EL TIPO DE OPERACIÓN')
      setCampoError('operacion')
      setEstado('error')
      return
    }

    if (!tituloLimpio) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError('titulo')
      setEstado('error')
      return
    }

    if (tituloLimpio.length < 20) {
      setMensajeError('TÍTULO MUY CORTO, DEBE TENER MÍNIMO 20 CARACTERES')
      setCampoError('titulo')
      setEstado('error')
      return
    }

    if (tituloLimpio.length >= 80) {
      setMensajeError('Has llegado al máximo de 80 caracteres')
      setCampoError('titulo')
      setEstado('error')
      return
    }

    if (precioNumero === null) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError('precio')
      setEstado('error')
      return
    }

    if (precioNumero < 1) {
      setMensajeError('PRECIO DEBE SER MÍNIMO 1')
      setCampoError('precio')
      setEstado('error')
      return
    }

    if (precioNumero >= 999999999) {
      setMensajeError('Has llegado al máximo de 999.999.999')
      setCampoError('precio')
      setEstado('error')
      return
    }

    if (areaNumero !== null && areaNumero >= 10000000) {
      setMensajeError('Has llegado al máximo de 10.000.000')
      setCampoError('area')
      setEstado('error')
      return
    }

    if (!descripcionLimpia) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError('descripcion')
      setEstado('error')
      return
    }

    if (descripcionLimpia.length < 50) {
      setMensajeError('DESCRIPCIÓN MUY CORTA, DEBE TENER MÍNIMO 50 CARACTERES')
      setCampoError('descripcion')
      setEstado('error')
      return
    }

    if (descripcionLimpia.length >= 300) {
      setMensajeError('Has llegado al máximo de 300 caracteres')
      setCampoError('descripcion')
      setEstado('error')
      return
    }

    if (!direccionLimpia) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError('direccion')
      setEstado('error')
      return
    }

    if (direccionLimpia.length < 8) {
      setMensajeError('DIRECCIÓN MUY CORTA, MÍNIMO 8 CARACTERES')
      setCampoError('direccion')
      setEstado('error')
      return
    }

    if (direccionLimpia.length >= 80) {
      setMensajeError('Has llegado al máximo de 80 caracteres')
      setCampoError('direccion')
      setEstado('error')
      return
    }

    if (!zonaLimpia) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError('zona')
      setEstado('error')
      return
    }

    if (zonaLimpia.length < 8) {
      setMensajeError('ZONA MUY CORTA, MÍNIMO 8 CARACTERES')
      setCampoError('zona')
      setEstado('error')
      return
    }

    if (zonaLimpia.length >= 80) {
      setMensajeError('Has llegado al máximo de 80 caracteres')
      setCampoError('zona')
      setEstado('error')
      return
    }

    if (habitacionesNumero !== null) {
      if (habitacionesNumero < 1) {
        setMensajeError('HABITACIONES DEBE SER MÍNIMO 1')
        setCampoError('habitaciones')
        setEstado('error')
        return
      }

      if (habitacionesNumero >= 50) {
        setMensajeError('Has llegado al máximo de 50 habitaciones')
        setCampoError('habitaciones')
        setEstado('error')
        return
      }
    }

    if (banosNumero !== null) {
      if (banosNumero < 1) {
        setMensajeError('BAÑOS DEBE SER MÍNIMO 1')
        setCampoError('banos')
        setEstado('error')
        return
      }

      if (banosNumero >= 50) {
        setMensajeError('Has llegado al máximo de 50 baños')
        setCampoError('banos')
        setEstado('error')
        return
      }
    }

    const incompleto =
      !datos.tipoInmueble ||
      !datos.operacion ||
      precioNumero === null ||
      !descripcionLimpia ||
      !direccionLimpia ||
      !zonaLimpia

    if (incompleto) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setCampoError(null)
      setEstado('error')
      return
    }

    const payload = {
      titulo: tituloLimpio,
      tipoAccion: datos.operacion,
      categoria: datos.tipoInmueble,
      precio: precioNumero,
      superficieM2: areaNumero !== null ? areaNumero : undefined,
      nroCuartos: habitacionesNumero !== null ? habitacionesNumero : undefined,
      nroBanos: banosNumero !== null ? banosNumero : 1,
      descripcion: descripcionLimpia,
      direccion: direccionLimpia,
      zona: zonaLimpia,
      ciudad: datos.ciudad
    }

    console.log('📤 Payload enviado al backend:', payload)

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      console.log('📥 Respuesta backend:', result)

      if (!response.ok) {
        const erroresBackend =
          result.errores?.map((e: any) => `• ${e.mensaje}`).join('\n') ||
          result.mensaje ||
          'ERROR AL GUARDAR LA PROPIEDAD'

        console.error('❌ Error backend:', erroresBackend)
        setMensajeError(erroresBackend)
        setCampoError(null)
        setEstado('error')
        return
      }

      console.log('✅ Propiedad guardada correctamente')
      setEstado('exito')
      setMensajeError('')
      setCampoError(null)
      router.push('/contenido-multimedia')
    } catch (error) {
      console.error('🔥 Error fetch:', error)
      setMensajeError('NO SE PUDO CONECTAR CON EL BACKEND')
      setCampoError(null)
      setEstado('error')
    }
  }

  const errorTitulo = campoError === 'titulo'
  const errorDescripcion = campoError === 'descripcion'
  const errorDireccion = campoError === 'direccion'
  const errorZona = campoError === 'zona'
  const errorHabitaciones = campoError === 'habitaciones'
  const errorBanos = campoError === 'banos'
  const errorPrecio = campoError === 'precio'
  const errorArea = campoError === 'area'
  const errorOperacion = campoError === 'operacion'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-6xl mx-auto p-8 md:p-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-950">Registro Inmueble</h1>

        <div className="bg-[#FAF4ED] rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
              <span className="text-orange-500 text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Inmueble</h2>
          </div>

          <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
            Completa el siguiente formulario con la información detallada del inmueble para su venta
            o alquiler.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <div className="space-y-10">
              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  INFORMACION PRINCIPAL
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                      Título del anuncio *
                    </label>
                    <input
                      name="titulo"
                      value={datos.titulo}
                      onChange={manejarCambio}
                      maxLength={80}
                      className={`w-full p-3 rounded-xl border bg-white/70 ${
                        errorTitulo ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorTitulo && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {datos.titulo.length}/80 caracteres
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo de operación *
                      </label>
                      <select
                        name="operacion"
                        value={datos.operacion}
                        onChange={manejarCambio}
                        className={`w-full p-3 rounded-xl border bg-white ${
                          errorOperacion ? 'border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="ANTICRETO">Anticreto</option>
                        <option value="VENTA">Venta</option>
                        <option value="ALQUILER">Alquiler</option>
                      </select>
                      {errorOperacion && (
                        <p className="text-red-500 text-sm mt-2">{mensajeError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo Inmueble *
                      </label>
                      <select
                        name="tipoInmueble"
                        value={datos.tipoInmueble}
                        onChange={manejarCambio}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="CASA">Casa</option>
                        <option value="DEPARTAMENTO">Departamento</option>
                        <option value="TERRENO">Terreno</option>
                        <option value="OFICINA">Oficina</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                      Precio USD$ *
                    </label>
                    <input
                      name="precio"
                      type="text"
                      inputMode="numeric"
                      value={datos.precio}
                      onChange={manejarCambio}
                      placeholder="Ej: 350.000"
                      className={`w-full p-3 rounded-xl border ${
                        errorPrecio ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorPrecio && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                    <p className="text-xs text-gray-500 mt-1">Máximo: 999.999.999</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  DETALLES DE LA PROPIEDAD
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] font-bold mb-2">Área total (m²)</label>
                    <input
                      name="area"
                      type="text"
                      inputMode="numeric"
                      value={datos.area}
                      onChange={manejarCambio}
                      placeholder="Ej: 1.250"
                      className={`w-full p-3 rounded-xl border ${
                        errorArea ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorArea && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                    <p className="text-xs text-gray-500 mt-1">Máximo: 10.000.000</p>
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Habitaciones</label>
                    <input
                      name="habitaciones"
                      type="number"
                      min={1}
                      max={50}
                      value={datos.habitaciones}
                      onChange={manejarCambio}
                      className={`w-full p-3 rounded-xl border ${
                        errorHabitaciones ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorHabitaciones && (
                      <p className="text-red-500 text-sm mt-2">{mensajeError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Máximo 50 habitaciones</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-[15px] font-bold mb-2">Baños</label>
                    <input
                      name="banos"
                      type="number"
                      min={1}
                      max={50}
                      value={datos.banos}
                      onChange={manejarCambio}
                      className={`w-full p-3 rounded-xl border ${
                        errorBanos ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorBanos && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                    <p className="text-xs text-gray-500 mt-1">Máximo 50 baños</p>
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Dirección *</label>
                    <input
                      name="direccion"
                      value={datos.direccion}
                      onChange={manejarCambio}
                      maxLength={80}
                      className={`w-full p-3 rounded-xl border ${
                        errorDireccion ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorDireccion && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {datos.direccion.length}/80 caracteres
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[15px] font-bold mb-2">Zona</label>
                  <input
                    name="zona"
                    value={datos.zona}
                    onChange={manejarCambio}
                    maxLength={80}
                    className={`w-full p-3 rounded-xl border ${
                      errorZona ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errorZona && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                  <p className="text-xs text-gray-500 mt-1">{datos.zona.length}/80 caracteres</p>
                </div>
              </section>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <label className="block text-[15px] font-bold text-gray-900 mb-2">
                  DESCRIPCION DETALLADA *
                </label>
                <textarea
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={manejarCambio}
                  maxLength={300}
                  className={`w-full p-4 rounded-2xl border h-72 bg-white ${
                    errorDescripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Casa de dos plantas, amplia y moderna ubicada en una zona tranquila..."
                />
                {errorDescripcion && <p className="text-red-500 text-sm mt-2">{mensajeError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {datos.descripcion.length}/300 caracteres
                </p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex justify-center md:justify-end gap-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-12 py-3 rounded-full border border-gray-400 bg-[#D9D9D9]"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={guardarPropiedad}
                    className="px-12 py-3 rounded-full border-2 border-orange-400 bg-[#D9D9D9]"
                  >
                    Continuar
                  </button>
                </div>

                {estado === 'error' && mensajeError && !campoError && (
                  <div className="bg-white border-2 border-red-400 rounded-2xl p-4 shadow-md max-w-md ml-auto whitespace-pre-line">
                    {mensajeError}
                  </div>
                )}

                {estado === 'exito' && (
                  <div className="bg-white border-2 border-green-400 rounded-2xl p-4 shadow-md max-w-md ml-auto">
                    Publicación registrada correctamente ✅
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
