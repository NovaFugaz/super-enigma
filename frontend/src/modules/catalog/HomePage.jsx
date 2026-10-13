import CategoryCard from '../../components/catalog/CategoryCard.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'

export default function HomePage() {
  const { categories } = useCatalog()

  return (
    <>
      <section className="page-container featured-section">
        <p className="section-kicker">Explora</p>
        <h2 className="section-title">Explorar por categoría</h2>

        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="page-container featured-section pt-0">
        <p className="section-kicker">Catálogo destacado</p>
        <h2 className="section-title">Productos destacados</h2>

        <div className="product-grid mt-8">
          {featured.map((product) => (
            <ProductCard key={product.codigo} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}