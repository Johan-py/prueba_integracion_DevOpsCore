type VideoItem = {
  id: string
  type: 'file' | 'youtube'
  name: string
  previewUrl?: string
  embedUrl?: string
  file?: File
}

type VideosSectionProps = {
  videos: VideoItem[]
  videoUrl: string
  onVideoUrlChange: (value: string) => void
  onAddVideoLink: () => void
  onOpenVideoPicker: () => void
  onRemoveVideo: (id: string) => void
  error?: string
  isUploading?: boolean
}

export default function VideosSection({
  videos,
  videoUrl,
  onVideoUrlChange,
  onAddVideoLink,
  onOpenVideoPicker,
  onRemoveVideo,
  error,
  isUploading = false
}: VideosSectionProps) {
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
      <h2 style={{ fontSize: '28px', marginBottom: '18px' }}>Agregar videos del inmueble</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr',
          gap: '18px'
        }}
      >
        <div
          style={{
            border: '1px solid #efe3de',
            borderRadius: '16px',
            background: '#fffdfc',
            padding: '18px'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '18px'
            }}
          >
            <select style={inputStyle} defaultValue="https://">
              <option>http://</option>
              <option>https://</option>
            </select>

            <input
              type="text"
              placeholder="Ingresar enlace de video válido..."
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />

            <button style={buttonStyle} onClick={onAddVideoLink}>
              Agregar Enlace de Video
            </button>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {videos.map((video, index) => (
              <div key={video.id}>
                <div style={videoBoxWrapperStyle}>
                  {video.type === 'file' && video.previewUrl ? (
                    <video src={video.previewUrl} controls style={videoPreviewStyle} />
                  ) : video.type === 'youtube' && video.embedUrl ? (
                    <iframe
                      src={video.embedUrl}
                      title={video.name}
                      style={iframeStyle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div style={videoBoxStyle}>🎥</div>
                  )}

                  <button onClick={() => onRemoveVideo(video.id)} style={removeButtonStyle}>
                    ×
                  </button>
                </div>
                <span>Video {index + 1}</span>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 2 - videos.length) }).map((_, index) => (
              <div key={index}>
                <div style={videoBoxStyle}>🎥</div>
                <span>Video {videos.length + index + 1}</span>
              </div>
            ))}
          </div>

          {isUploading && (
            <p style={{ color: '#f57c00', fontSize: '14px', marginTop: '12px' }}>
              Cargando videos...
            </p>
          )}

          {error && (
            <p style={{ color: '#d32f2f', fontSize: '14px', marginTop: '12px' }}>{error}</p>
          )}
        </div>

        <div
          style={{
            border: '1px solid #efe3de',
            borderRadius: '16px',
            background: '#fffdfc',
            padding: '18px'
          }}
        >
          <p style={{ fontSize: '18px', color: '#555', marginBottom: '18px' }}>
            Arrastra aquí tus videos hasta de 20 MB cada uno o haz clic en el botón para subirlos.
          </p>

          <button style={buttonStyle} onClick={onOpenVideoPicker}>
            Subir Videos
          </button>

          <p style={{ color: '#6f6f6f', fontSize: '16px', marginTop: '16px' }}>
            Puedes agregar 2 videos en enlace de YouTube o en formato MP4, MKV o AVI.
          </p>
        </div>
      </div>
    </section>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #eadfd8',
  borderRadius: '10px',
  padding: '12px',
  fontSize: '16px'
}

const buttonStyle: React.CSSProperties = {
  background: '#ff7f11',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 18px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer'
}

const videoBoxStyle: React.CSSProperties = {
  width: '220px',
  height: '120px',
  border: '1px solid #eadfd8',
  borderRadius: '12px',
  background: '#faf6f4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#c9bbb4',
  fontSize: '30px',
  marginBottom: '10px'
}

const videoBoxWrapperStyle: React.CSSProperties = {
  width: '220px',
  height: '120px',
  border: '1px solid #eadfd8',
  borderRadius: '12px',
  background: '#faf6f4',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '10px'
}

const videoPreviewStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none'
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
  lineHeight: 1,
  zIndex: 2
}
