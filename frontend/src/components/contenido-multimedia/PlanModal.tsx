type PlanModalProps = {
  open: boolean;
  onClose: () => void;
  onPayNow?: () => void;
};

type PlanCardProps = {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlighted?: boolean;
  badgeText?: string;
  icon?: string;
};

function PlanCard({
  title,
  price,
  subtitle,
  features,
  highlighted = false,
  badgeText,
  icon,
}: PlanCardProps) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff7f2",
        border: highlighted ? "2px solid #f57c00" : "1px solid #f0c7b0",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: highlighted ? "0 8px 20px rgba(245,124,0,0.15)" : "none",
      }}
    >
      {badgeText && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "#f57c00",
            color: "#fff",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 0",
          }}
        >
          {badgeText}
        </div>
      )}

      <div
        style={{
          padding: badgeText ? "28px 16px 16px" : "18px 16px 16px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: "18px",
            color: "#5a2f1f",
            fontWeight: 700,
          }}
        >
          {title}
        </h3>

        <div style={{ fontSize: "42px", marginBottom: "8px" }}>{icon}</div>

        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#5a2f1f",
            }}
          >
            {price}
          </span>
          <span
            style={{
              fontSize: "15px",
              color: "#5a2f1f",
              marginLeft: "2px",
            }}
          >
            {subtitle}
          </span>
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#a15b32",
            marginBottom: "10px",
          }}
        >
          {features[0]}
        </div>

        <div
          style={{
            borderTop: "1px solid #f1d2c2",
            margin: "10px 0 12px",
          }}
        />

        <div style={{ textAlign: "left", minHeight: "58px" }}>
          {features.slice(1).map((feature) => (
            <div
              key={feature}
              style={{
                fontSize: "14px",
                color: "#7a4a32",
                marginBottom: "8px",
              }}
            >
              ✓ {feature}
            </div>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "10px",
            background: highlighted ? "#f57c00" : "#fff",
            color: highlighted ? "#fff" : "#6c3e2a",
            border: highlighted ? "none" : "1px solid #dbc0b1",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Elegir Plan
        </button>
      </div>
    </div>
  );
}

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

        <div style={topBadgeStyle}>⚠ Publicaciones Gratuitas Agotadas</div>

        <h2 style={titleStyle}>¡Elige tu Plan y Sigue Publicando!</h2>

        <div style={plansGridStyle}>
          <PlanCard
            title="Plan Estrella"
            price="$9"
            subtitle="/mes"
            icon="☆"
            features={[
              "10 Publicaciones al mes",
              "10 Publicaciones",
              "Ilimitadas",
            ]}
          />

          <PlanCard
            title="Plan Profesional"
            price="$29"
            subtitle="/mes"
            icon="🚀"
            features={[
              "ilimitadas Publicaciones",
              "ilimitadas Publicaciones",
            ]}
            highlighted
            badgeText="Popular"
          />

          <PlanCard
            title="Plan Empresa"
            price="$59"
            subtitle="/mes"
            icon="👥"
            features={[
              "ilimitadas Publicaciones",
              "ilimitadas Publicaciones",
              "Team Sigma",
            ]}
          />
        </div>

        <div style={paymentBoxStyle}>
          <div>
            <div style={paymentTitleStyle}>Validación de Pago</div>

            <div style={paymentMethodsStyle}>
              <span style={paymentTagStyle}>VISA</span>
              <span style={paymentTagStyle}>Mastercard</span>
              <span style={paymentTagStyle}>PayPal</span>
              <span style={paymentTagStyle}>💳</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={redirectTextStyle}>Luego serás redireccionado</div>

            <button onClick={onPayNow} style={payButtonStyle}>
              Pagar Ahora
            </button>
          </div>
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
  maxWidth: "940px",
  background: "#fff5ef",
  borderRadius: "18px",
  padding: "22px 22px 18px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  position: "relative",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "14px",
  border: "none",
  background: "transparent",
  fontSize: "32px",
  color: "#8a6a5b",
  cursor: "pointer",
  lineHeight: 1,
};

const topBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#f8d3bf",
  color: "#a85a27",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "12px",
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "0 0 18px",
  fontSize: "22px",
  fontWeight: 800,
  color: "#4b2e21",
};

const plansGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
  marginBottom: "14px",
};

const paymentBoxStyle: React.CSSProperties = {
  background: "#fff1e8",
  border: "1px solid #f0d2c2",
  borderRadius: "12px",
  padding: "14px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
};

const paymentTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#5a2f1f",
  marginBottom: "10px",
};

const paymentMethodsStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const paymentTagStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#fff",
  border: "1px solid #e8d2c4",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#5a2f1f",
};

const redirectTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#8b6b5a",
  marginBottom: "10px",
};

const payButtonStyle: React.CSSProperties = {
  background: "#f57c00",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "12px 26px",
  fontSize: "18px",
  fontWeight: 700,
  cursor: "pointer",
};