import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ImageSlot from '../common/ImageSlot.jsx'
import StockBadge from './StockBadge.jsx'
import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [status, setStatus] = useState(null) 
  const soldOut = product.stock === 0

  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(null), 1500)
    return () => clearTimeout(timer)
  }, [status])

  const handleAdd = () => setStatus(addItem(product, 1) > 0 ? 'added' : 'max')

  let label = 'Agregar al carrito'
  if (soldOut) label = 'Sin stock'
  else if (status === 'added') label = 'Agregado ✓'
  else if (status === 'max') label = 'Máximo en carrito'

  return (
    <article className="product-card">
      <Link to={`/producto/${product.codigo}`} className="flex flex-1 flex-col">
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

      <div className="px-4 pb-4">
        <button
          type="button"
          className="btn-primary btn-block disabled:cursor-not-allowed disabled:opacity-50"
          disabled={soldOut}
          onClick={handleAdd}
          aria-live="polite">
          {label}
        </button>
      </div>
    </article>
  )
}