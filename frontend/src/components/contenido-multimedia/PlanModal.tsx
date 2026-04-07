type PlanModalProps = {
  open: boolean;
  onClose: () => void;
  onPayNow?: () => void;
};

export default function PlanModal({
  open,
  onClose,
  onPayNow,
}: PlanModalProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ×
        </button>

        <h2 style={titleStyle}>Límite de publicaciones alcanzado</h2>

        <p style={textStyle}>
          Has alcanzado el límite de publicaciones gratuitas. Elige un plan para
          seguir publicando.
        </p>

        <div style={actionsStyle}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cerrar
          </button>

          <button onClick={onPayNow} style={primaryButtonStyle}>
            Ver Planes
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(120, 80, 80, 0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "34px 32px 28px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  position: "relative",
  textAlign: "center",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "16px",
  right: "18px",
  border: "none",
  background: "transparent",
  fontSize: "34px",
  color: "#999",
  cursor: "pointer",
  lineHeight: 1,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "24px",
  fontWeight: 700,
  color: "#3b2d2a",
};

const textStyle: React.CSSProperties = {
  margin: "0 0 26px",
  fontSize: "18px",
  color: "#777",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#f57c00",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "14px 26px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#e9e9e9",
  color: "#333",
  border: "none",
  borderRadius: "10px",
  padding: "14px 26px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};