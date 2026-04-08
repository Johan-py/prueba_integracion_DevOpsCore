//LISTA LATERAL
'use client'

export default function PropertyList({ properties, onSelect, selectedProperty }) {
  return (
    <div>
      {properties.map((p) => {
        const isSelected = selectedProperty?.id === p.id

        return (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
              background: isSelected ? '#e6f0ff' : 'white',
              marginBottom: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            <img
              src={p.imagen || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEk8q6ATycRk5xVF4DNLfV3luMMMtrXilLEg&s'}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />

            <div style={{ padding: '10px' }}>
            <h4>{'INMUEBLE '}{p.id}</h4>
            <h4>{p.titulo}</h4>
            <p> {p.tipo}</p>
            <p> {p.categoria}</p>
            <p>💲{p.precio}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}