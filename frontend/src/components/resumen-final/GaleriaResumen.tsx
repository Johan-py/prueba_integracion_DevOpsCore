import type { ResumenFinalData } from "./ResumenPanel";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

function resolverUrlMultimedia(url: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}
interface Props {
  multimedia: ResumenFinalData["multimedia"];
}

function getYoutubeId(url: string) {
  const trimmed = url.trim();

  const shortMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/
  );
  if (shortMatch) return shortMatch[1];

  const normalMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
  );
  if (normalMatch) return normalMatch[1];

  const embedMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  );
  if (embedMatch) return embedMatch[1];

  return null;
}

function getYoutubeEmbedUrl(url: string) {
  const id = getYoutubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export default function GaleriaResumen({ multimedia }: Props) {
  const imagenes = multimedia.imagenes ?? [];
  const videos = multimedia.videos ?? [];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-5 text-2xl font-semibold text-[#0f172a]">Multimedia</h3>

      <div className="mb-6">
        <p className="mb-3 text-lg font-semibold text-[#0f172a]">
          Fotos registradas
        </p>

        {imagenes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {imagenes.map((imagen, index) => (
              <div key={`${imagen.id}-${index}`} className="space-y-2">
                <div className="relative h-32 overflow-hidden rounded-2xl border border-gray-200 bg-white md:h-36">
                  <img
                    src={imagen.url}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-[#0f172a]">
                  Foto {index + 1}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No hay fotos registradas
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <p className="mb-3 text-lg font-semibold text-[#0f172a]">
          Videos registrados
        </p>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.map((video, index) => {
              const embedUrl = getYoutubeEmbedUrl(video.url);

              return (
                <div
                  key={`${video.id}-${index}`}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="h-[170px] w-full bg-black">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={`Video ${index + 1}`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-white">
                        🎥
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-[#0f172a]">
                      Video {index + 1}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {video.url}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No hay videos registrados
          </div>
        )}
      </div>
    </div>
  );
}
