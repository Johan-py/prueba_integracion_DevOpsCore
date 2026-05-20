import type { TutorialPublicacionContent } from "./tutorial-publicacion.types.js";

const getOptionalEnv = (key: string): string | null => {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : null;
};

export const TUTORIAL_PUBLICACION_CONTENT: TutorialPublicacionContent = {
  titulo: "Antes de publicar tu propiedad",
  mensaje:
    "Antes de iniciar la publicación, asegúrate de tener preparados los datos principales del inmueble y el material necesario para completar el registro sin interrupciones.",
  requisitos: [
    "Tipo de inmueble que deseas publicar.",
    "Ubicación o dirección referencial de la propiedad.",
    "Precio de venta, alquiler o anticrético.",
    "Superficie y características principales del inmueble.",
    "Ambientes, servicios y datos relevantes para los interesados.",
    "Fotografías o recursos multimedia claros de la propiedad.",
    "Información de contacto actualizada.",
  ],
  videoUrl: getOptionalEnv("TUTORIAL_PUBLICACION_VIDEO_URL") ?? "",
  thumbnailUrl: getOptionalEnv("TUTORIAL_PUBLICACION_THUMBNAIL_URL"),
  subtitlesUrl: getOptionalEnv("TUTORIAL_PUBLICACION_SUBTITLES_URL"),
  checkboxLabel: "Sí entiendo qué necesito para publicar una propiedad",
};
