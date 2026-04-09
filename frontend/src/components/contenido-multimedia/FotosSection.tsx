type ImageItem = {
  id: string
  file: File
  previewUrl: string
  name: string
}

type FotosSectionProps = {
  images: ImageItem[]
  onOpenPicker: () => void
  onRemoveImage: (id: string) => void
  error?: string
  isUploading?: boolean
}

export default function FotosSection({
  images,
  onOpenPicker,
  onRemoveImage,
  error,
  isUploading = false
}: FotosSectionProps) {
  const emptySlots = Math.max(0, 5 - images.length)

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #f0dfd8',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '22px'
      }}
    >
      <h2 style={{ fontSize: '28px', marginBottom: '18px' }}>Agregar fotos del inmueble</h2>

      <div
        style={{
          border: '1px solid #efe3de',
          borderRadius: '16px',
          background: '#fffdfc',
          padding: '18px'
        }}
      >
        <p style={{ fontSize: '18px', color: '#555', marginBottom: '18px' }}>
          Arrastra aquí las fotos hasta de 5 MB cada una o haz clic en el botón para subirlas.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <button
            onClick={onOpenPicker}
            style={{
              background: '#ff7f11',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 22px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Subir Fotos
          </button>

          {images.map((image) => (
            <div key={image.id} style={slotContainerStyle}>
              <img src={image.previewUrl} alt={image.name} style={previewImageStyle} />
              <button onClick={() => onRemoveImage(image.id)} style={removeButtonStyle}>
                ×
              </button>
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
            <div key={index} style={emptySlotStyle}>
              +
            </div>
          ))}
        </div>

        {isUploading && (
          <p style={{ color: '#f57c00', fontSize: '14px', marginTop: '12px' }}>
            Cargando imágenes...
          </p>
        )}

        {error && <p style={{ color: '#d32f2f', fontSize: '14px', marginTop: '12px' }}>{error}</p>}

        <p style={{ color: '#6f6f6f', fontSize: '16px', marginTop: '16px' }}>
          Puedes subir hasta 5 fotos en formato PNG o JPG.
        </p>
      </div>
    </section>
  )
}

const slotContainerStyle: React.CSSProperties = {
  width: '120px',
  height: '75px',
  border: '1px solid #eadfd8',
  borderRadius: '10px',
  background: '#faf6f4',
  position: 'relative',
  overflow: 'hidden'
}

const previewImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}

const removeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(0,0,0,0.65)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: 1
}

const emptySlotStyle: React.CSSProperties = {
  width: '120px',
  height: '75px',
  border: '1px solid #eadfd8',
  borderRadius: '10px',
  background: '#faf6f4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#c9bbb4',
  fontSize: '26px'
}
