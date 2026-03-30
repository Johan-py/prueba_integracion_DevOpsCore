export default function ProfileCard() {
  return (
    <div className="bg-gray-100 p-8 rounded-xl flex gap-10 items-center">
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col items-center justify-center w-1/3">
        <div className="w-28 h-28 rounded-full bg-gray-300"></div>
        <p className="mt-4 font-semibold text-lg">Perfil1</p>
        <p className="text-sm text-gray-500">perfil1@gmail.com</p>
      </div>

      {/* LADO DERECHO */}
      <div className="w-2/3">
        <h2 className="text-xl font-bold mb-6">Datos Personales</h2>

        <div className="flex flex-col gap-4">
          {[
            'Nombre Completo',
            'E-mail',
            'Teléfono',
            'Teléfono 2',
            'País',
            'Género',
            'Dirección'
          ].map((label, index) => (
            <div key={index} className="flex items-center gap-4">
              <label className="w-40 font-medium">{label}:</label>

              <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />

              <div className="w-10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
