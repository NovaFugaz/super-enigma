import { Link } from 'react-router-dom'

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <>
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

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-title">Sonido Vivo</h3>
              <div className="footer-text">
                <p>
                  11 años de trayectoria en el corazón de Viña del Mar.
                </p>
                <p className="footer-strong">
                  calle 123, Local 12 • Viña del Mar, Región de Valparaíso
                </p>
              </div>
            </div>

            <div>
              <h3 className="footer-title">Horarios de Atención</h3>
              <div className="footer-text">
                <p><span className="footer-strong">Lunes a Viernes:</span> 10:30 – 19:30 hrs</p>
                <p><span className="footer-strong">Sábados de Taller:</span> 11:00 – 15:00 hrs</p>
                <p><span className="footer-strong">Domingos:</span> Cerrado</p>
              </div>
            </div>

            <div>
              <h3 className="footer-title">Contacto &amp; Soporte</h3>
              <div className="footer-text">
                <p>+56 12 345 6789</p>
                <p>contacto@sonidovivo.cl</p>
              </div>
            </div>

            <div>
              <h3 className="footer-title">Envíos</h3>
              <div className="footer-text">
                <p>
                  Despacho protegido a todo Chile con embalaje hermético de humedad
                  controlada vía:
                </p>
                <div className="flex gap-2">
                  <span className="footer-chip">Starken</span>
                  <span className="footer-chip">Chilexpress</span>
                </div>
                <p>Punto Oficial de Retiro en Tienda Calle 123</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} Sonido Vivo. Viña del Mar, Chile.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/terminos" className="footer-link">Términos de Servicio</Link>
              <Link to="/despacho" className="footer-link">Políticas de Despacho</Link>
              <Link to="/privacidad" className="footer-link">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}