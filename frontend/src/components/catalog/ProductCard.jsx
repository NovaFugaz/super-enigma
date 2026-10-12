import { Link } from 'react-router-dom'
import ImageSlot from '../common/ImageSlot.jsx'
import StockBadge from './StockBadge.jsx'
import { formatCLP } from '../../utils/format.js'

export default function ProductCard({ product }) {
  return (
    <Link to={`/producto/${product.codigo}`} className="product-card">
      <ImageSlot src={product.image} alt={product.nombre} className="product-card-media" />

      <div className="product-card-body">
        <p className="product-card-brand">{product.marca}</p>
        <h3 className="product-card-name">{product.nombre}</h3>
        <p className="product-card-model">{product.modelo}</p>

        <div className="product-card-footer">
          <span className="product-card-price">{formatCLP(product.precio)}</span>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  )
}