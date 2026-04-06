"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FotosSection from "@/components/contenido-multimedia/FotosSection";
import VideosSection from "@/components/contenido-multimedia/VideosSection";
import PublicarSection from "@/components/contenido-multimedia/PublicarSection";
import SuccessModal from "@/components/contenido-multimedia/SuccessModal";
import PlanModal from "@/components/contenido-multimedia/PlanModal";

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
};

type VideoItem = {
  id: string;
  type: "file" | "youtube";
  name: string;
  previewUrl?: string;
  embedUrl?: string;
  file?: File;
  sourceUrl?: string;
};

export default function ContenidoMultimediaPage() {
  const searchParams = useSearchParams();
  const publicacionId = Number(searchParams.get("publicacionId"));

  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [imageError, setImageError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [publishError, setPublishError] = useState("");

  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideos, setIsUploadingVideos] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const hasMultimedia = images.length > 0 || videos.length > 0;

  const handleOpenImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleOpenVideoPicker = () => {
    videoInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setImageError("");

    if (images.length + files.length > 5) {
      setImageError("Límite alcanzado. Solo puedes subir máximo 5 imágenes.");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];
    const maxSize = 5 * 1024 * 1024;

    setIsUploadingImages(true);

    const validImages: ImageItem[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageError("Formato no permitido. Solo PNG o JPG");
        continue;
      }

      if (file.size > maxSize) {
        setImageError("Una de las imágenes supera los 5 MB.");
        continue;
      }

      validImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      });
    }

    setImages((prev) => [...prev, ...validImages].slice(0, 5));
    setIsUploadingImages(false);
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleVideoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setVideoError("");

    if (videos.length + files.length > 2) {
      setVideoError("Límite alcanzado. Solo puedes subir máximo 2 videos.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/x-matroska",
      "video/avi",
      "video/x-msvideo",
    ];

    const maxSize = 20 * 1024 * 1024;

    setIsUploadingVideos(true);

    const validVideos: VideoItem[] = [];

    for (const file of files) {
      const extension = file.name.toLowerCase().split(".").pop();
      const extensionAllowed = ["mp4", "mkv", "avi"].includes(extension || "");

      if (!allowedTypes.includes(file.type) && !extensionAllowed) {
        setVideoError("Formato no permitido. Solo MP4, MKV o AVI");
        continue;
      }

      if (file.size > maxSize) {
        setVideoError("Uno de los videos supera los 20 MB.");
        continue;
      }

      validVideos.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        type: "file",
        name: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setVideos((prev) => [...prev, ...validVideos].slice(0, 2));
    setIsUploadingVideos(false);
    event.target.value = "";
  };

  const getYoutubeData = (url: string) => {
    const trimmed = url.trim();

    const shortMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/
    );

    if (shortMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${shortMatch[1]}`,
        sourceUrl: trimmed,
      };
    }

    const normalMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
    );

    if (normalMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${normalMatch[1]}`,
        sourceUrl: trimmed,
      };
    }

    const embedMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    );

    if (embedMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}`,
        sourceUrl: trimmed,
      };
    }

    return null;
  };

  const handleAddVideoLink = () => {
    setVideoError("");

    if (!videoUrl.trim()) {
      setVideoError("Debes ingresar un enlace de video.");
      return;
    }

    if (videos.length >= 2) {
      setVideoError("Límite alcanzado. Solo puedes agregar máximo 2 videos.");
      return;
    }

    const parsed = getYoutubeData(videoUrl);

    if (!parsed) {
      setVideoError("Enlace de video no válido");
      return;
    }

    const newVideo: VideoItem = {
      id: `youtube-${Date.now()}-${Math.random()}`,
      type: "youtube",
      name: "Video de YouTube",
      embedUrl: parsed.embedUrl,
      sourceUrl: parsed.sourceUrl,
    };

    setVideos((prev) => [...prev, newVideo].slice(0, 2));
    setVideoUrl("");
  };

  const handleRemoveVideo = (id: string) => {
    setVideos((prev) => {
      const target = prev.find((video) => video.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((video) => video.id !== id);
    });
  };

  const handlePublish = async () => {
    setPublishError("");

    if (!publicacionId || Number.isNaN(publicacionId)) {
      setPublishError("No se recibió el ID de la publicación.");
      return;
    }

    if (!hasMultimedia) {
      setPublishError(
        "Debes agregar al menos una imagen o un video antes de publicar el inmueble."
      );
      return;
    }

    if (!confirmed) {
      setPublishError("Debes confirmar que la información es correcta.");
      return;
    }

    setShowSuccessModal(true);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fdf7f5",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "8px" }}>
          Contenido Multimedia
        </h1>

        <p style={{ fontSize: "20px", color: "#666", marginBottom: "24px" }}>
          Agrega hasta 5 fotos y 2 videos para mostrar mejor tu inmueble
        </p>

        <p style={{ fontSize: "14px", color: "#888", marginBottom: "18px" }}>
          Publicación actual: #{publicacionId || "sin id"}
        </p>

        <input
          ref={imageInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          multiple
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept=".mp4,.mkv,.avi,video/mp4,video/x-matroska,video/avi,video/x-msvideo"
          multiple
          style={{ display: "none" }}
          onChange={handleVideoFileChange}
        />

        <FotosSection
          images={images}
          onOpenPicker={handleOpenImagePicker}
          onRemoveImage={handleRemoveImage}
          error={imageError}
          isUploading={isUploadingImages}
        />

        <VideosSection
          videos={videos}
          videoUrl={videoUrl}
          onVideoUrlChange={setVideoUrl}
          onAddVideoLink={handleAddVideoLink}
          onOpenVideoPicker={handleOpenVideoPicker}
          onRemoveVideo={handleRemoveVideo}
          error={videoError}
          isUploading={isUploadingVideos}
        />

        <PublicarSection
          confirmed={confirmed}
          onConfirmedChange={setConfirmed}
          onPublish={handlePublish}
          publishError={publishError}
          canPublish={hasMultimedia}
        />

        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        <PlanModal
          open={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onPayNow={() => alert("Aquí luego conectas el flujo de pago")}
        />
      </div>
    </main>
  );
}