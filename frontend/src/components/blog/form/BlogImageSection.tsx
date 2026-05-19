"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

interface BlogImageSectionProps {
  imagePreviewUrl: string;
  onImageChange: (file: File | null) => void;
  error?: string;
}

const compressToWebp = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        0.8
      );
    };
    img.onerror = () => resolve(file);
  });
};

export default function BlogImageSection({ 
  imagePreviewUrl, 
  onImageChange, 
  error 
}: BlogImageSectionProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  return (
    <div className="space-y-2">
      <label className={`relative flex min-h-[180px] sm:min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#E7E5E4] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#111] px-6 py-8 sm:px-10 sm:py-12 text-center transition hover:border-[#F59E0B] hover:bg-white dark:hover:bg-[#1a1a1a] group ${isCompressing ? "opacity-50 pointer-events-none" : ""}`}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0] ?? null;
            if (file) {
              setIsCompressing(true);
              const compressedFile = await compressToWebp(file);
              setIsCompressing(false);
              onImageChange(compressedFile);
            } else {
              onImageChange(null);
            }
          }}
        />

        {isCompressing ? (
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F59E0B] border-t-transparent mb-4"></div>
            <p className="text-sm font-semibold text-[#1C1917]">Comprimiendo imagen...</p>
          </div>
        ) : imagePreviewUrl ? (
          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
              <Camera className="h-10 w-10 text-white" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-[#222] shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <Camera className="h-6 w-6 text-[#A8A29E] dark:text-[#999]" />
            </div>
            <p className="text-base font-semibold text-[#1C1917] dark:text-white">
              Arrastra y suelta la imagen destacada
            </p>
            <p className="mt-1 text-xs font-medium text-[#78716C] dark:text-[#999]">
              Recomendado: 1920×820px (Se comprimirá automáticamente a WebP)
            </p>
          </>
        )}
      </label>
      {error && (
        <p className="px-2 text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
