import EmptyState from '../../components/common/EmptyState.jsx'

export default function HomePage() {
  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Catálogo destacado</p>
      <h2 className="section-title">Productos destacados</h2>

      <EmptyState
        title="Próximamente"
        description="Aquí aparecerán los instrumentos más solicitados en mesón."
      />
    </section>
  )
}