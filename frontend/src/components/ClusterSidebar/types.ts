import { Inmueble } from '@/types/inmueble'

export interface ClusterSidebarProps {
  clusterProperties: Inmueble[]
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}
