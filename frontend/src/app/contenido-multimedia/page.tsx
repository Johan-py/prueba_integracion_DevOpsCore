import FotosSection from "@/components/contenido-multimedia/FotosSection";
import VideosSection from "@/components/contenido-multimedia/VideosSection";
import PublicarSection from "@/components/contenido-multimedia/PublicarSection";

export default function ContenidoMultimediaPage() {
  return (
    <main style={{ padding: "24px", background: "#fdf7f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "8px" }}>
          Contenido Multimedia
        </h1>

        <p style={{ fontSize: "20px", color: "#555", marginBottom: "24px" }}>
          Agrega hasta 5 fotos y 2 videos para mostrar mejor tu inmueble
        </p>

        <FotosSection />
        <VideosSection />
        <PublicarSection />
      </div>
    </main>
  );
}