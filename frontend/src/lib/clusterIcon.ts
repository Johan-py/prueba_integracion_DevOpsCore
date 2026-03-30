import L from 'leaflet'

interface LeafletCluster {
  getChildCount(): number
}

export type ClusterTier = 'high' | 'medium' | 'low'

export const CLUSTER_CONFIG = {
  maxClusterRadius: 80,
  disableClusteringAtZoom: 17,
  animationDuration: 400
} as const

const FILL: Record<ClusterTier, string> = {
  high: 'rgba(34, 197, 94, 0.7)',
  medium: 'rgba(249, 115, 22, 0.7)',
  low: 'rgba(59, 130, 246, 0.7)'
}

const HALO: Record<ClusterTier, string> = {
  high: 'rgba(34,  197, 94,  0.30)',
  medium: 'rgba(249, 115, 22,  0.30)',
  low: 'rgba(59,  130, 246, 0.30)'
}

const SIZES: Record<ClusterTier, number> = {
  high: 46,
  medium: 38,
  low: 32
}

const FONT_SIZES: Record<ClusterTier, number> = {
  high: 15,
  medium: 13,
  low: 12
}

function getTier(count: number): ClusterTier {
  if (count >= 20) return 'high'
  if (count >= 5) return 'medium'
  return 'low'
}

export function createClusterIcon(cluster: LeafletCluster): L.DivIcon {
  const count = cluster.getChildCount()
  const tier = getTier(count)
  const size = SIZES[tier]
  const fontSize = FONT_SIZES[tier]
  const outer = size + 10
  const half = outer / 2

  return L.divIcon({
    html: `
      <div style="
        width: ${outer}px;
        height: ${outer}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Aro exterior (halo) -->
        <div style="
          position: absolute;
          width: ${outer}px;
          height: ${outer}px;
          border-radius: 50%;
          background-color: ${HALO[tier]};
        "></div>
        <!-- Círculo interior sólido -->
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: ${FILL[tier]};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: ${fontSize}px;
          font-weight: 700;
          font-family: Inter, sans-serif;
          letter-spacing: -0.3px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        " aria-label="${count} propiedades en esta zona">
          ${count}
        </div>
      </div>
    `,
    className: '',
    iconSize: [outer, outer],
    iconAnchor: [half, half]
  })
}
