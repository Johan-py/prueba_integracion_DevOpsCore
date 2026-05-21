type SuccessModalProps = {
  open: boolean
  onClose: () => void
}

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
  if (!open) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ×
        </button>

        <div style={iconWrapperStyle}>
          <div style={iconStyle}>✓</div>
        </div>

        <h2 style={titleStyle}>¡Inmueble publicado con éxito!</h2>

        <p style={textStyle}>Tu inmueble se ha publicado correctamente.</p>

        <button onClick={onClose} style={acceptButtonStyle}>
          Aceptar
        </button>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(120, 80, 80, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '20px'
}

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '560px',
  background: '#ffffff',
  borderRadius: '18px',
  padding: '34px 32px 28px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
  position: 'relative',
  textAlign: 'center'
}

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '18px',
  border: 'none',
  background: 'transparent',
  fontSize: '34px',
  color: '#999',
  cursor: 'pointer',
  lineHeight: 1
}

const iconWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '18px'
}

const iconStyle: React.CSSProperties = {
  width: '86px',
  height: '86px',
  borderRadius: '50%',
  background: '#f57c00',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '44px',
  fontWeight: 700
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 14px',
  fontSize: '24px',
  fontWeight: 700,
  color: '#3b2d2a'
}

const textStyle: React.CSSProperties = {
  margin: '0 0 26px',
  fontSize: '18px',
  color: '#777'
}

const acceptButtonStyle: React.CSSProperties = {
  background: '#f57c00',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '14px 42px',
  fontSize: '18px',
  fontWeight: 700,
  cursor: 'pointer',
  minWidth: '170px'
}
