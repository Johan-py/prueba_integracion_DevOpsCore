import type { ResumenFinalData } from "./ResumenPanel";

interface Props {
  data: ResumenFinalData;
}

function valorTexto(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === "") {
    return "No registrado";
  }
  return String(valor);
}

function formatearPrecio(precio: number | null) {
  if (precio === null || precio === undefined) return "No registrado";
  return `${precio.toLocaleString("es-BO")} USD`;
}

function formatearArea(area: number | null) {
  if (area === null || area === undefined) return "No registrado";
  return `${area} m²`;
}

export default function InfoPropiedad({ data }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-5 text-2xl font-semibold text-[#0f172a]">
        Datos Generales
      </h3>

      <div className="space-y-4 text-base text-gray-700 md:text-lg">
        <p>
          <span className="font-semibold text-[#0f172a]">Título del anuncio:</span>{" "}
          {valorTexto(data.publicacion.titulo)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Tipo de operación:</span>{" "}
          {valorTexto(data.datosGenerales.tipoOperacion)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Tipo inmueble:</span>{" "}
          {valorTexto(data.datosGenerales.tipoInmueble)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Precio:</span>{" "}
          {formatearPrecio(data.datosGenerales.precio)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Área total:</span>{" "}
          {formatearArea(data.datosGenerales.areaM2)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Habitaciones:</span>{" "}
          {valorTexto(data.caracteristicas.habitaciones)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Baños:</span>{" "}
          {valorTexto(data.caracteristicas.banos)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Dirección:</span>{" "}
          {valorTexto(data.datosGenerales.direccion)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Ciudad:</span>{" "}
          {valorTexto(data.datosGenerales.ciudad)}
        </p>

        <p>
          <span className="font-semibold text-[#0f172a]">Zona:</span>{" "}
          {valorTexto(data.datosGenerales.zona)}
        </p>

        <div>
          <p className="mb-2 font-semibold text-[#0f172a]">
            Descripción detallada:
          </p>
          <p className="leading-7 text-gray-700">
            {valorTexto(data.publicacion.descripcion)}
          </p>
        </div>
      </div>
    </div>
  );
}
