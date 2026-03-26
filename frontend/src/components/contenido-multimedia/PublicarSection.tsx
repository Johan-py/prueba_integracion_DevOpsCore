export default function PublicarSection() {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #f0dfd8",
        borderRadius: "18px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "18px" }}>
          <input type="checkbox" />
          <span>Confirmo que la información es correcta y deseo publicar</span>
        </label>

        <button
          style={{
            background: "#ff7f11",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "14px 22px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Publicar Inmueble
        </button>
      </div>

      <p style={{ marginTop: "12px", fontSize: "16px", color: "#666" }}>
        Nota: Puedes publicar hasta 2 inmuebles de forma gratuita.
      </p>
    </section>
  );
}