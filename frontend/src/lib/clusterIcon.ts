import L from 'leaflet'
import type { MarkerCluster } from 'react-leaflet-cluster'

export type ClusterTier = 'high' | 'medium' | 'low'

export const CLUSTER_CONFIG = {
  maxClusterRadius: 80,
  disableClusteringAtZoom: 17,
  animationDuration: 400
} as const

const COLORS: Record<ClusterTier, string> = {
  high: '#16a34a',
  medium: '#ea580c',
  low: '#2563eb'
}

const SIZES: Record<ClusterTier, number> = {
  high: 52,
  medium: 42,
  low: 34
}

const FONT_SIZES: Record<ClusterTier, number> = {
  high: 15,
  medium: 13,
  low: 12
}

function getTier(count: number): ClusterTier {
  if (count >= 10) return 'high'
  if (count >= 2) return 'medium'
  return 'low'
}

export function createClusterIcon(cluster: MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount()
  const tier = getTier(count)
  const color = COLORS[tier]
  const size = SIZES[tier]
  const fontSize = FONT_SIZES[tier]
  const half = size / 2

  return L.divIcon({
    html: `
      <div
        class="cluster-bubble cluster-bubble--${tier}"
        style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          font-size: ${fontSize}px;
        "
        aria-label="${count} propiedades en esta zona"
      >
        ${count}
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half]
  })
}
