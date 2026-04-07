type PublicarSectionProps = {
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  onPublish: () => void;
  publishError?: string;
  canPublish: boolean;
};

export default function PublicarSection({
  confirmed,
  onConfirmedChange,
  onPublish,
  publishError,
  canPublish,
}: PublicarSectionProps) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #f0dfd8",
        borderRadius: "18px",
        padding: "24px",
        marginBottom: "22px",
      }}
    >
      <h2 style={{ fontSize: "28px", marginBottom: "18px" }}>
        Publicar inmueble
      </h2>

      <div
        style={{
          border: "1px solid #efe3de",
          borderRadius: "16px",
          background: "#fffdfc",
          padding: "18px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            color: "#555",
            marginBottom: "18px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirmedChange(e.target.checked)}
          />
          Confirmo que la información ingresada es correcta
        </label>

        {!canPublish && (
          <p style={{ color: "#d32f2f", fontSize: "14px", marginBottom: "12px" }}>
            Debes agregar al menos una imagen o un video para habilitar la publicación.
          </p>
        )}

        {publishError && (
          <p style={{ color: "#d32f2f", fontSize: "14px", marginBottom: "12px" }}>
            {publishError}
          </p>
        )}

        <button
          onClick={onPublish}
          disabled={!canPublish}
          style={{
            background: !canPublish ? "#d9d9d9" : "#ff7f11",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "14px 22px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: !canPublish ? "not-allowed" : "pointer",
            opacity: !canPublish ? 0.7 : 1,
          }}
        >
          Publicar inmueble
        </button>
      </div>
    </section>
  );
}