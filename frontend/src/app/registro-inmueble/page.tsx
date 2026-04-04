'use client'
import { useState } from 'react'

export default function PaginaRegistroInmueble() {
  const [formulario, setFormulario] = useState({
    titulo: 'Tropico 6 Federaciones',
    operacion: 'ANTICRETO',
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

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (['precio', 'area', 'habitaciones', 'banos'].includes(name)) {
      if (value !== '' && Number(value) < 0) return
    }

    setFormulario({ ...formulario, [name]: value })
  }

  const guardarPropiedad = async () => {
    setEstado('ninguno')
    setMensajeError('')

    const incompleto =
      !formulario.titulo.trim() ||
      !formulario.tipoInmueble ||
      !formulario.precio ||
      !formulario.direccion.trim() ||
      !formulario.descripcion.trim()

    if (incompleto) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIOS')
      setEstado('error')
      return
    }

    const datosAEnviar = {
      titulo: formulario.titulo.trim(),
      tipoAccion: formulario.operacion,
      categoria: formulario.tipoInmueble,
      precio: Number(formulario.precio),
      superficieM2: formulario.area ? Number(formulario.area) : undefined,
      nroCuartos: formulario.habitaciones ? Number(formulario.habitaciones) : undefined,
      nroBanos: formulario.banos ? Number(formulario.banos) : 1,
      descripcion: formulario.descripcion.trim(),
      direccion: formulario.direccion.trim(),
      zona: formulario.zona.trim() || 'CENTRO',
      ciudad: formulario.ciudad
    }

    console.log('📤 Datos enviados al servidor:', datosAEnviar)

    try {
      const respuesta = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAEnviar)
      })

      const resultado = await respuesta.json()

      console.log('📥 Respuesta del servidor:', resultado)

      if (!respuesta.ok) {
        const erroresServidor =
          resultado.errores?.map((e: any) => `• ${e.mensaje}`).join('\n') ||
          resultado.mensaje ||
          'ERROR AL GUARDAR LA PROPIEDAD'

        console.error('❌ Error del servidor:', erroresServidor)

        setMensajeError(erroresServidor)
        setEstado('error')
        return
      }

      console.log('✅ Propiedad guardada correctamente')
      setEstado('exito')
      setMensajeError('')
    } catch (error) {
      console.error('🔥 Error de conexión:', error)
      setMensajeError('NO SE PUDO CONECTAR CON EL SERVIDOR')
      setEstado('error')
    }
  }

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
                  INFORMACIÓN PRINCIPAL
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                      Título del anuncio *
                    </label>
                    <input
                      name="titulo"
                      value={formulario.titulo}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white/70"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo de operación *
                      </label>
                      <select
                        name="operacion"
                        value={formulario.operacion}
                        onChange={manejarCambio}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="ANTICRETO">Anticreto</option>
                        <option value="VENTA">Venta</option>
                        <option value="ALQUILER">Alquiler</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo Inmueble *
                      </label>
                      <select
                        name="tipoInmueble"
                        value={formulario.tipoInmueble}
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
                      type="number"
                      value={formulario.precio}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200"
                    />
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
                      type="number"
                      value={formulario.area}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Habitaciones</label>
                    <input
                      name="habitaciones"
                      type="number"
                      value={formulario.habitaciones}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-[15px] font-bold mb-2">Baños</label>
                    <input
                      name="banos"
                      type="number"
                      value={formulario.banos}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Dirección *</label>
                    <input
                      name="direccion"
                      value={formulario.direccion}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[15px] font-bold mb-2">Zona</label>
                  <input
                    name="zona"
                    value={formulario.zona}
                    onChange={manejarCambio}
                    className="w-full p-3 rounded-xl border border-gray-200"
                  />
                </div>
              </section>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <label className="block text-[15px] font-bold text-gray-900 mb-2">
                  DESCRIPCIÓN DETALLADA *
                </label>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  className="w-full p-4 rounded-2xl border border-gray-300 h-72 bg-white"
                  placeholder="Casa de dos plantas, amplia y moderna ubicada en una zona tranquila..."
                />
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex justify-center md:justify-end gap-6">
                  <button
                    onClick={() => setEstado('ninguno')}
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

                {estado === 'error' && (
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