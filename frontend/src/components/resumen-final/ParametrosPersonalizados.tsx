interface ParametroPersonalizado {
  id?: number | string;
  nombre?: string;
}

interface Props {
  parametros?: ParametroPersonalizado[];
}

export default function ParametrosPersonalizados({ parametros = [] }: Props) {
  const parametrosValidos = Array.isArray(parametros)
    ? parametros.filter(
        (parametro) =>
          parametro &&
          typeof parametro.nombre === "string" &&
          parametro.nombre.trim() !== ""
      )
    : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-4 text-xl font-semibold text-[#0f172a]">
        Parámetros personalizados
      </h3>

      {parametrosValidos.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {parametrosValidos.map((parametro, index) => (
            <span
              key={parametro.id ?? `${parametro.nombre}-${index}`}
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-[#0f172a]"
            >
              {parametro.nombre}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-4 text-sm text-gray-500">
          No hay parámetros personalizados registrados
        </div>
      )}
    </div>
  );
}
