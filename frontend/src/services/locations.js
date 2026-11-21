import { apiRequest } from './api.js'

export function toLocation(location) {
  if (
    !location ||
    typeof location.id !== 'string' ||
    !['store', 'pickup'].includes(location.type) ||
    typeof location.name !== 'string' ||
    typeof location.address !== 'string' ||
    !Array.isArray(location.position) ||
    location.position.length !== 2 ||
    !location.position.every((coordinate) => Number.isFinite(coordinate)) ||
    !Array.isArray(location.hours) ||
    !location.hours.every((hour) => typeof hour === 'string') ||
    (location.note != null && typeof location.note !== 'string')
  ) {
    throw new Error('La API devolvió una ubicación con datos inválidos.')
  }

  return {
    id: location.id,
    type: location.type,
    name: location.name,
    address: location.address,
    position: location.position,
    hours: location.hours,
    note: location.note ?? '',
  }
}

export async function fetchLocations() {
  const response = await apiRequest('/api/locations')
  if (!Array.isArray(response)) {
    throw new Error('La API devolvió una lista de ubicaciones inválida.')
  }
  return response.map(toLocation)
}

export const googleDirectionsUrl = ([lat, lng]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`

export const wazeUrl = ([lat, lng]) =>
  `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`