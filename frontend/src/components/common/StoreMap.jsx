import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { googleDirectionsUrl } from '../../services/locations.js'

const pinIcon = (type, active) =>
  L.divIcon({
    className: 'map-pin-wrapper',
    html: `<span class="map-pin map-pin-${type} ${active ? 'map-pin-active' : ''}"></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })

function FlyToSelected({ position }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, 16, { duration: 0.8 })
  }, [map, position])
  return null
}

export default function StoreMap({ locations, selectedId, onSelect }) {
  const markerRefs = useRef({})
  const selected = locations.find((l) => l.id === selectedId) ?? locations[0]

  useEffect(() => {
    markerRefs.current[selected.id]?.openPopup()
  }, [selected])

  return (
    <MapContainer
      center={selected.position}
      zoom={15}
      scrollWheelZoom={false}
      className="store-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected position={selected.position} />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.position}
          icon={pinIcon(loc.type, loc.id === selected.id)}
          ref={(m) => {
            markerRefs.current[loc.id] = m
          }}
          eventHandlers={{ click: () => onSelect(loc.id) }}
        >
          <Popup>
            <strong className="block">{loc.name}</strong>
            <span className="block text-xs">{loc.address}</span>
            <a
              href={googleDirectionsUrl(loc.position)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold underline"
            >
              Cómo llegar
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}