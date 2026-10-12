import { Link } from 'react-router-dom'
import ImageSlot from '../common/ImageSlot.jsx'

export default function CategoryCard({ category }) {
  return (
    <Link to={`/catalogo?categoria=${category.slug}`} className="category-card">
      <ImageSlot src={category.image} alt={category.nombre} className="category-card-media" />
      <div className="category-card-body">
        <h3 className="category-card-name">{category.nombre}</h3>
        <p className="category-card-text">{category.descripcion}</p>
      </div>
    </Link>
  )
}