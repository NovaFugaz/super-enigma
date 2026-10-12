import EmptyState from '../../components/common/EmptyState.jsx'
import CategoryCard from '../../components/catalog/CategoryCard.jsx'
import { CATEGORIES } from '../../data/catalog.js'

export default function HomePage() {
  return (
    <>
      <section className="page-container featured-section">
        <p className="section-kicker">Explora</p>
        <h2 className="section-title">Explorar por categoría</h2>

        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="page-container featured-section pt-0">
        <p className="section-kicker">Catálogo destacado</p>
        <h2 className="section-title">Productos destacados</h2>

        <EmptyState
          title="Próximamente"
          description="Aquí aparecerán los instrumentos destacados."
        />
      </section>
    </>
  )
}