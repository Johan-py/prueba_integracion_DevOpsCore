export default function VideosSection() {
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
        Agregar videos del inmueble
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr",
          gap: "18px",
        }}
      >
        <div
          style={{
            border: "1px solid #efe3de",
            borderRadius: "16px",
            background: "#fffdfc",
            padding: "18px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
            <select style={inputStyle}>
              <option>http://</option>
              <option>https://</option>
            </select>

            <input
              type="text"
              placeholder="Ingresar enlace de video válido..."
              style={{ ...inputStyle, flex: 1 }}
            />

            <button style={buttonStyle}>Agregar Enlace de Video</button>
          </div>

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={videoBoxStyle}>🎥</div>
              <span>Video 1</span>
            </div>

            <div>
              <div style={videoBoxStyle}>🎥</div>
              <span>Video 2</span>
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #efe3de",
            borderRadius: "16px",
            background: "#fffdfc",
            padding: "18px",
          }}
        >
          <p style={{ fontSize: "18px", color: "#555", marginBottom: "18px" }}>
            Arrastra aquí tus videos hasta de 20MB cada uno o haz clic en el botón para subirlos.
          </p>

          <button style={buttonStyle}>Subir Videos</button>

          <p style={{ color: "#6f6f6f", fontSize: "16px", marginTop: "16px" }}>
            Puedes agregar 2 videos en enlace de YouTube o en formato MP4, MKV o AVI.
          </p>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  border: "1px solid #eadfd8",
  borderRadius: "10px",
  padding: "12px",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#ff7f11",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "16px",
  fontWeight: 600 as const,
  cursor: "pointer",
};

const videoBoxStyle = {
  width: "220px",
  height: "100px",
  border: "1px solid #eadfd8",
  borderRadius: "12px",
  background: "#faf6f4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#c9bbb4",
  fontSize: "30px",
  marginBottom: "10px",
};