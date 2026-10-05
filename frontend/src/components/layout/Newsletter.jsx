// TODO
// Newsletter component

import { Link } from 'react-router-dom'

export default function Newsletter() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }
 
  return (
      <section className="page-container mt-16">
        <div className="newsletter-card">
          <div>
            <span className="newsletter-badge">Enterate de ofertas y novedades</span>
            <h2 className="newsletter-title">Únete al Club Acústico de Sonido Vivo</h2>
            <p className="newsletter-text">
              Recibe avisos exclusivos de reposición de stock, novedades y ofertas.
            </p>
          </div>
          <div>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="Tu correo electrónico..."
                aria-label="Correo electrónico"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </section>
    )}