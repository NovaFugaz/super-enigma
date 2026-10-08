import { useState } from 'react'
import StoreMap from '../../components/common/StoreMap.jsx'
import {
  LOCATIONS,
  STORE,
  googleDirectionsUrl,
  wazeUrl,
} from '../../services/locations.js'

export default function ContactPage() {
  const [selectedId, setSelectedId] = useState(STORE.id)
  const selected = LOCATIONS.find((l) => l.id === selectedId)

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Contacto</p>
      <h1 className="section-title">Visítanos en Viña del Mar</h1>
      <p className="mt-2 max-w-2xl text-sm text-costa-deep">
        Encuéntranos en nuestra tienda o retira tu pedido en el punto más
        cercano a ti.
      </p>

      <div className="contact-grid">
        {/* Lista + detalle */}
        <div className="space-y-4">
          <ul className="space-y-2" aria-label="Ubicaciones">
            {LOCATIONS.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(loc.id)}
                  aria-pressed={loc.id === selectedId}
                  className={`location-item ${loc.id === selectedId ? 'location-item-active' : ''}`}
                >
                  <span className={`location-dot location-dot-${loc.type}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{loc.name}</span>
                    <span className="block truncate text-xs opacity-80">{loc.address}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="location-detail">
            <span className="newsletter-badge !bg-costa-deep/10 !text-costa-deep">
              {selected.type === 'store' ? 'Tienda física' : 'Punto de retiro'}
            </span>
            <h2 className="mt-2 text-xl font-medium">{selected.name}</h2>
            <p className="mt-1 text-sm">{selected.address}</p>
            {selected.note && (
              <p className="mt-1 text-xs text-costa-sage">{selected.note}</p>
            )}
            <ul className="mt-3 space-y-1 text-xs text-costa-deep">
              {selected.hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={googleDirectionsUrl(selected.position)}
                target="_blank"
                rel="noopener noreferrer"
                className="auth-register !inline-block"
              >
                Cómo llegar
              </a>
              <a
                href={wazeUrl(selected.position)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Abrir en Waze
              </a>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="store-map-wrapper">
          <StoreMap
            locations={LOCATIONS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="location-detail">
          <h3 className="footer-title">Teléfono</h3>
          <p className="mt-1 text-sm">+56 12 345 6789</p>
        </div>
        <div className="location-detail">
          <h3 className="footer-title">Correo</h3>
          <p className="mt-1 text-sm">contacto@sonidovivo.cl</p>
        </div>
        <div className="location-detail">
          <h3 className="footer-title">Horario tienda</h3>
          <p className="mt-1 text-sm">Lun a Vie 10:30 – 19:30 hrs</p>
        </div>
      </div>
    </section>
  )
}