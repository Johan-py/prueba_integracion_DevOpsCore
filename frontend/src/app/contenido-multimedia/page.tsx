"use client";

import { useState } from "react";
import FotosSection from "@/components/contenido-multimedia/FotosSection";
import VideosSection from "@/components/contenido-multimedia/VideosSection";
import PublicarSection from "@/components/contenido-multimedia/PublicarSection";
import SuccessModal from "@/components/contenido-multimedia/SuccessModal";
import PlanModal from "@/components/contenido-multimedia/PlanModal";

export default function ContenidoMultimediaPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const handlePublish = () => {
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
        <h1>Contenido Multimedia</h1>
        <p>Agrega hasta 5 fotos y 2 videos para mostrar mejor tu inmueble</p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={() => setShowSuccessModal(true)}>
            Ver modal éxito
          </button>

          <button onClick={() => setShowPlanModal(true)}>
            Ver modal planes
          </button>
        </div>

        <FotosSection />
        <VideosSection />
        <PublicarSection onPublish={handlePublish} />

        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        <PlanModal
          open={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onPayNow={() => alert("Pago")}
        />
      </div>
    </main>
  );
}