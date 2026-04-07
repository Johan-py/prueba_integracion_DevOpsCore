import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_YOUTUBE_HOSTS,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_PUBLICATION,
  MAX_VIDEOS_PER_PUBLICATION,
  MULTIMEDIA_TYPES,
} from "./multimedia.constants.ts";
import {
  countMultimediaByPublicationIdAndTypeRepository,
  createManyMultimediaRepository,
  createMultimediaRepository,
  findPublicationByIdRepository,
  getMultimediaByPublicationIdRepository,
} from "./multimedia.repository.ts";
import type {
  GetPublicationMultimediaInput,
  RegisterImagesInput,
  RegisterVideoLinkInput,
} from "./multimedia.types.ts";

const validatePositiveInteger = (value: number, fieldName: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} no válido`);
  }
};

const normalizeHttpUrl = (rawUrl: string, fieldName: string): string => {
  const trimmedUrl = rawUrl.trim();

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    throw new Error(`${fieldName} no válida`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`${fieldName} no válida`);
  }

  return parsedUrl.toString();
};

const extractYoutubeVideoId = (videoUrl: string): string | null => {
  try {
    const parsedUrl = new URL(videoUrl.trim());
    const host = parsedUrl.hostname.toLowerCase();

    if (!ALLOWED_YOUTUBE_HOSTS.includes(host)) {
      return null;
    }

    if (host === "youtu.be") {
      const shortId = parsedUrl.pathname.replace("/", "").trim();
      return /^[a-zA-Z0-9_-]{11}$/.test(shortId) ? shortId : null;
    }

    if (host === "youtube.com" || host === "www.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }

      const shortsMatch = parsedUrl.pathname.match(
        /^\/shorts\/([a-zA-Z0-9_-]{11})$/,
      );
      if (shortsMatch) {
        return shortsMatch[1];
      }
    }

    return null;
  } catch {
    return null;
  }
};

const normalizeYoutubeUrl = (videoUrl: string): string => {
  const videoId = extractYoutubeVideoId(videoUrl);

  if (!videoId) {
    throw new Error("Enlace de video no válido");
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
};

const validatePublicationOwnership = async (
  publicacionId: number,
  usuarioId: number,
) => {
  validatePositiveInteger(publicacionId, "ID de publicación");
  validatePositiveInteger(usuarioId, "Usuario");

  const publication = await findPublicationByIdRepository(publicacionId);

  if (!publication) {
    throw new Error("La publicación no existe");
  }

  if (publication.usuarioId !== usuarioId) {
    throw new Error("La publicación no pertenece al usuario autenticado");
  }

  return publication;
};

const validateImagesInput = (images: RegisterImagesInput["images"]) => {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("Debe enviar al menos una imagen");
  }

  if (images.length > MAX_IMAGES_PER_PUBLICATION) {
    throw new Error("Límite de imágenes alcanzado");
  }

  return images.map((image, index) => {
    const imageIndex = index + 1;

    if (!image || typeof image !== "object") {
      throw new Error(`La imagen ${imageIndex} no es válida`);
    }

    if (typeof image.url !== "string" || !image.url.trim()) {
      throw new Error(`La URL de la imagen ${imageIndex} es obligatoria`);
    }

    if (typeof image.extension !== "string" || !image.extension.trim()) {
      throw new Error(`La extensión de la imagen ${imageIndex} es obligatoria`);
    }

    const normalizedExtension = image.extension.trim().toLowerCase();

    if (!ALLOWED_IMAGE_EXTENSIONS.includes(normalizedExtension)) {
      throw new Error("Formato no permitido. Solo PNG, JPG o JPEG");
    }

    if (
      typeof image.pesoMb !== "number" ||
      Number.isNaN(image.pesoMb) ||
      image.pesoMb <= 0
    ) {
      throw new Error(`El tamaño de la imagen ${imageIndex} no es válido`);
    }

    if (image.pesoMb > MAX_IMAGE_SIZE_MB) {
      throw new Error("La imagen supera el tamaño máximo permitido de 5 MB");
    }

    const normalizedUrl = normalizeHttpUrl(
      image.url,
      `La URL de la imagen ${imageIndex}`,
    );

    return {
      url: normalizedUrl,
      extension: normalizedExtension,
      pesoMb: image.pesoMb,
    };
  });
};

export const getPublicationMultimediaService = async ({
  publicacionId,
  usuarioId,
}: GetPublicationMultimediaInput) => {
  const publication = await validatePublicationOwnership(
    publicacionId,
    usuarioId,
  );
  const multimedia =
    await getMultimediaByPublicationIdRepository(publicacionId);

  return {
    publication,
    multimedia,
  };
};

export const registerVideoLinkService = async ({
  publicacionId,
  usuarioId,
  videoUrl,
}: RegisterVideoLinkInput) => {
  const publication = await validatePublicationOwnership(
    publicacionId,
    usuarioId,
  );

  if (typeof videoUrl !== "string" || !videoUrl.trim()) {
    throw new Error("El enlace de video es obligatorio");
  }

  const normalizedVideoUrl = normalizeYoutubeUrl(videoUrl);

  const totalVideos = await countMultimediaByPublicationIdAndTypeRepository(
    publicacionId,
    MULTIMEDIA_TYPES.VIDEO,
  );

  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error("Límite de videos alcanzado");
  }

  const newVideo = await createMultimediaRepository({
    publicacionId,
    tipo: MULTIMEDIA_TYPES.VIDEO,
    url: normalizedVideoUrl,
    pesoMb: null,
  });

  return {
    publication,
    multimedia: newVideo,
  };
};

export const registerImagesService = async ({
  publicacionId,
  usuarioId,
  images,
}: RegisterImagesInput) => {
  const publication = await validatePublicationOwnership(
    publicacionId,
    usuarioId,
  );

  const normalizedImages = validateImagesInput(images);

  const totalImages = await countMultimediaByPublicationIdAndTypeRepository(
    publicacionId,
    MULTIMEDIA_TYPES.IMAGE,
  );

  if (totalImages + normalizedImages.length > MAX_IMAGES_PER_PUBLICATION) {
    throw new Error("Límite de imágenes alcanzado");
  }

  const createdImages = await createManyMultimediaRepository(
    normalizedImages.map((image) => ({
      publicacionId,
      tipo: MULTIMEDIA_TYPES.IMAGE,
      url: image.url,
      pesoMb: image.pesoMb,
    })),
  );

  return {
    publication,
    multimedia: createdImages,
  };
};
