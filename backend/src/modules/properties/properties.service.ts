import { getPropertiesForMap } from './properties.repository.js'

export const getPropertiesMapService = async () => {
  const data = await getPropertiesForMap()
  return { data }
}
