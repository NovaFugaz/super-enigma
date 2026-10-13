import { Link } from 'react-router-dom'

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <>
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
                  Av. Valparaíso 581, Loc 17, Viña del Mar, Valparaíso
                </p>
              </div>
            </div>

            <div>
              <h3 className="footer-title">Horarios de Atención</h3>
              <div className="footer-text">
                <p><span className="footer-strong">Lunes a Viernes:</span> 10:30 – 19:30 hrs</p>
                <p><span className="footer-strong">Sábados y Domingos:</span> Cerrado</p>
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
                  Despacho protegido a todo Chile.
                </p>
                <div className="flex gap-2">
                  <span className="footer-chip">Starken</span>
                  <span className="footer-chip">Chilexpress</span>
                </div>
                <p>Av. Valparaíso 581, Loc 17</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} Sonido Vivo. Viña del Mar, Chile.
            </p>

          </div>
        </div>
      </footer>
    </>
  )
}