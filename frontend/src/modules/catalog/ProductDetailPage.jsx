import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState.jsx'
import ImageSlot from '../../components/common/ImageSlot.jsx'
import ProductCard from '../../components/catalog/ProductCard.jsx'
import StockBadge from '../../components/catalog/StockBadge.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'
import { formatCLP } from '../../utils/format.js'
import { useCart } from '../../hooks/useCart.js'

function ProductDetail({ product, products, categories }) {
    const [qty, setQty] = useState(1)
    const [addedQuantity, setAddedQuantity] = useState(0)
    const { addItem } = useCart()
    const category = categories.find((item) => item.slug === product.categoria)
    const soldOut = product.stock === 0

    const related = products.filter(
        (p) => p.categoria === product.categoria && p.codigo !== product.codigo,
    ).slice(0, 4)

    const handleAddToCart = () => {
        addItem(product, qty)
        setAddedQuantity(qty)
    }

    return (
        <section className="page-container featured-section">
            <nav className="breadcrumb" aria-label="Ruta de navegación">
                <Link to="/">Inicio</Link>
                <span aria-hidden="true">/</span>
                <Link to="/catalogo">Catálogo</Link>
                <span aria-hidden="true">/</span>
                <Link to={`/catalogo?categoria=${product.categoria}`}>{category?.nombre}</Link>
            </nav>

            <div className="detail-grid">
                <ImageSlot src={product.image} alt={product.nombre} className="detail-media" />

                <div>
                    <p className="product-card-brand">{product.marca}</p>
                    <h1 className="detail-title">{product.nombre}</h1>
                    <p className="detail-model">Modelo {product.modelo}</p>

                    <p className="detail-price">{formatCLP(product.precio)}</p>
                    <div className="mt-2">
                        <StockBadge stock={product.stock} />
                    </div>

                    <p className="detail-description">{product.descripcion}</p>

                    <div className="detail-actions">
                        <div className="qty-stepper" aria-label="Cantidad">
                            <button
                                type="button"
                                className="qty-btn"
                                aria-label="Disminuir cantidad"
                                disabled={soldOut || qty <= 1}
                                onClick={() => setQty((q) => q - 1)}>−</button>
                            <span className="qty-value">{soldOut ? 0 : qty}</span>
                            <button
                                type="button"
                                className="qty-btn"
                                aria-label="Aumentar cantidad"
                                disabled={soldOut || qty >= product.stock}
                                onClick={() => setQty((q) => q + 1)}>+</button>
                        </div>

                        <button
                            type="button"
                            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={soldOut}
                            onClick={handleAddToCart}>
                            {soldOut ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                    </div>
                    {addedQuantity > 0 && (
                        <p className="mt-3 text-sm text-costa-deep" role="status" aria-live="polite">
                            {addedQuantity} {addedQuantity === 1 ? 'unidad agregada' : 'unidades agregadas'}.{' '}
                            <Link to="/carrito" className="font-semibold underline">Ver carrito</Link>
                        </p>
                    )}

                    {notice && (
                        <p className="form-hint mt-2" role="status">{notice}</p>
                    )}

                    <dl className="spec-list">
                        <div className="spec-row">
                            <dt>Código</dt>
                            <dd>{product.codigo}</dd>
                        </div>
                        <div className="spec-row">
                            <dt>Categoría</dt>
                            <dd>{category?.nombre}</dd>
                        </div>
                        <div className="spec-row">
                            <dt>Marca</dt>
                            <dd>{product.marca}</dd>
                        </div>
                        <div className="spec-row">
                            <dt>Modelo</dt>
                            <dd>{product.modelo}</dd>
                        </div>
                        <div className="spec-row">
                            <dt>Unidades disponibles</dt>
                            <dd>{product.stock}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {related.length > 0 && (
                <div className="mt-14">
                    <h2 className="section-title">Productos relacionados</h2>
                    <div className="product-grid mt-6">
                        {related.map((p) => (
                            <ProductCard key={p.codigo} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default function ProductDetailPage() {
    const { codigo } = useParams()
    const { products, categories } = useCatalog()
    const product = products.find((item) => item.codigo === codigo)

    if (!product) {
        return (
            <div className="page-container py-16">
                <EmptyState title="Producto no encontrado" description="Es posible que ya no esté disponible." />
                <div className="mt-6 text-center">
                    <Link to="/catalogo" className="btn-primary">
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        )
    }

    return <ProductDetail key={product.codigo} product={product} products={products} categories={categories} />
}