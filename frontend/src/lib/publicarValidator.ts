import { FormPublicar, ErrorValidacion } from "@/types/publicacion";

export function validarFormulario(form: FormPublicar): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  // ── Información Básica ──────────────────────────────
  if (!form.titulo || form.titulo.trim().length < 10) {
    errores.push({
      campo: "titulo",
      seccion: "Información Básica",
      mensaje: "El título debe tener al menos 10 caracteres",
    });
  }

  if (!form.tipoPropiedad) {
    errores.push({
      campo: "tipoPropiedad",
      seccion: "Información Básica",
      mensaje: "Debe seleccionar un tipo de propiedad",
    });
  }

  if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) <= 0) {
    errores.push({
      campo: "precio",
      seccion: "Información Básica",
      mensaje: "El precio es obligatorio y debe ser mayor a 0",
    });
  }

  // ── Características ─────────────────────────────────
  if (!form.superficie || Number(form.superficie) <= 0) {
    errores.push({
      campo: "superficie",
      seccion: "Características",
      mensaje: "La superficie debe ser un número mayor a 0",
    });
  }

  if (!form.habitaciones || Number(form.habitaciones) < 1) {
    errores.push({
      campo: "habitaciones",
      seccion: "Características",
      mensaje: "Debe indicar al menos 1 habitación",
    });
  }

  if (!form.banos || Number(form.banos) < 1) {
    errores.push({
      campo: "banos",
      seccion: "Características",
      mensaje: "Debe indicar al menos 1 baño",
    });
  }

  // ── Ubicación ───────────────────────────────────────
  if (!form.direccion || form.direccion.trim().length < 5) {
    errores.push({
      campo: "direccion",
      seccion: "Ubicación",
      mensaje: "La dirección debe tener al menos 5 caracteres",
    });
  }

  if (!form.ciudad || form.ciudad.trim() === "") {
    errores.push({
      campo: "ciudad",
      seccion: "Ubicación",
      mensaje: "Debe especificar la ciudad",
    });
  }

  if (!form.codigoPostal || form.codigoPostal.trim().length < 4) {
    errores.push({
      campo: "codigoPostal",
      seccion: "Ubicación",
      mensaje: "El código postal debe tener al menos 4 dígitos",
    });
  }

  // ── Detalles ────────────────────────────────────────
  if (!form.descripcion || form.descripcion.trim().length < 50) {
    errores.push({
      campo: "descripcion",
      seccion: "Detalles",
      mensaje: "La descripción debe tener al menos 50 caracteres",
    });
  }

  return errores;
}

// Agrupa los errores por sección para mostrarlos en el panel
export function agruparErroresPorSeccion(errores: ErrorValidacion[]) {
  return errores.reduce(
    (acc, error) => {
      if (!acc[error.seccion]) acc[error.seccion] = [];
      acc[error.seccion].push(error);
      return acc;
    },
    {} as Record<string, ErrorValidacion[]>
  );
}