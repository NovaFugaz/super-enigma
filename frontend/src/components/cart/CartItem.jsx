import ImageSlot from '../common/ImageSlot.jsx'
import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'

export default function CartItem({ product, qty }) {
    const { setQuantity, removeItem } = useCart()

    return (
        <article className="cart-item">
            <ImageSlot src={product.image} alt={product.nombre} className="cart-item-thumb" />

            <div className="cart-item-info">
                <h3 className="cart-item-name">{product.nombre}</h3>
                <p className="cart-item-meta">
                    {product.marca} · {product.modelo}
                </p>
                <p className="cart-item-meta">{formatCLP(product.precio)} c/u</p>
            </div>

            <div className="cart-item-actions">
                <span className="cart-item-price">{formatCLP(product.precio * qty)}</span>

                <div className="qty-stepper" aria-label={`Cantidad de ${product.nombre}`}>
                    <button
                        type="button"
                        className="qty-btn"
                        aria-label="Disminuir cantidad"
                        disabled={qty <= 1}
                        onClick={() => setQuantity(product.codigo, qty - 1)}>−</button>
                    <span className="qty-value">{qty}</span>
                    <button
                        type="button"
                        className="qty-btn"
                        aria-label="Aumentar cantidad"
                        disabled={qty >= product.stock}
                        onClick={() => setQuantity(product.codigo, qty + 1)}>+</button>
                </div>

                <button type="button" className="cart-remove" onClick={() => removeItem(product.codigo)}>
                    Eliminar
                </button>
            </div>
        </article>
    )
}