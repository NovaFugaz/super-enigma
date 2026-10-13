import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'

export default function CartItem({ item }) {
  const { setQuantity, removeItem } = useCart()
  const { product, quantity, lineTotal } = item

  return (
    <article className="cart-item">
      <div className="cart-item-info">
        <p className="cart-item-name">{product.nombre}</p>
        <p className="cart-item-meta">{product.marca} · {product.modelo}</p>
        <p className="cart-item-price">{formatCLP(lineTotal)}</p>
      </div>
      <div className="cart-item-actions">
        <div className="qty-stepper" aria-label={`Cantidad de ${product.nombre}`}>
          <button
            type="button"
            className="qty-btn"
            aria-label={`Disminuir ${product.nombre}`}
            disabled={quantity <= 1}
            onClick={() => setQuantity(product.codigo, quantity - 1)}
          >−</button>
          <span className="qty-value">{quantity}</span>
          <button
            type="button"
            className="qty-btn"
            aria-label={`Aumentar ${product.nombre}`}
            disabled={quantity >= product.stock}
            onClick={() => setQuantity(product.codigo, quantity + 1)}
          >+</button>
        </div>
        <button type="button" className="cart-remove" onClick={() => removeItem(product.codigo)}>
          Eliminar
        </button>
      </div>
    </article>
  )
}