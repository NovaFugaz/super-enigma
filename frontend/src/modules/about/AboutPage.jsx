import { Link } from 'react-router-dom'

const STATS = [
    { value: '11', label: 'años de trayectoria' },
    { value: 'Viña del Mar', label: 'nuestra casa' },
    { value: 'Todo Chile', label: 'Despacho protegido' },
]

const QUALITY = [
    {
        title: 'Productos de calidad',
        text: 'Elegimos cada instrumento y equipo pensando en durabilidad, respaldp y calidad',
    },
    {
        title: 'Atención cercana',
        text: 'Te asesoramos con honestidad, sea tu primer instrumento o tu equipo necesario'
    }
]

const GOALS = [
    'Queremos ser la tienda de referencia en instrumentos y equipos de sonido de la Región de Valparaíso.',
    'Acercar música de calidad a músicos en todo Chile',
    'Ofrecemos una experiencia de compra simple y segura.'
]

export default function AboutPage() {
    return (
        <>
            <section className="page-container featured-section">
                <p className="section-kicker">Nosotros</p>
                <h1 className="section-title">Los mejores sonidos de Valparaíso</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-costa-deep">
                    Sonido Vivo es una tienda de instrumentos y equipos de música ubicada
                    en el corazón de Viña del Mar. Nos dedicamos a la venta de instrumentos, accesorios
                    y equipos de audio.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {STATS.map((s) => (
                        <div key={s.label} className="location-detail text-center">
                            <p className="font-display text-3xl font-medium text-costa-deep">
                                {s.value}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-widest text-costa-sage">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="page-container pb-12 sm:pb-16">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="location-detail">
                        <p className="section-kicker">A qué nos dedicamos</p>
                        <h2 className="mt-1 text-xl font-medium">Instrumentos, audio y luthier</h2>
                        <p className="mt-3 text-sm leading-relaxed text-costa-deep">
                            Ofrecemos un catálogo de instrumentos y equipos musicales, y
                            atendemos tanto en nuestra tienda física como online, con
                            despacho a todo Chile y retiro en tienda.
                        </p>
                    </div>
                    <div className="location-detail">
                        <p className="section-kicker">Nuestra trayectoria</p>
                        <h2 className="mt-1 text-xl font-medium">11 años junto a los músicos</h2>
                        <p className="mt-3 text-sm leading-relaxed text-costa-deep">
                            Llevamos más de una década construyendo confianza con nuestra
                            comunidad. Ese camino nos enseñó que un buen instrumento y una
                            buena asesoría marcan la diferencia.
                        </p>
                    </div>
                </div>
            </section>

            <section className="page-container pb-12 sm:pb-16">
                <div className="newsletter-card">
                    <div>
                        <span className="newsletter-badge">Metas</span>
                        <h2 className="newsletter-title">Hacia dónde vamos</h2>
                        <p className="newsletter-text">
                            Seguimos afinando nuestro camino para crecer con la comunidad.
                        </p>
                        <Link to="/contacto" className="newsletter-link">
                            Conoce dónde encontrarnos →
                        </Link>
                    </div>
                    <ul className="space-y-3 text-sm text-costa-mist">
                        {GOALS.map((g) => (
                            <li key={g} className="flex gap-3">
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-costa-teal" />
                                <span>{g}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
