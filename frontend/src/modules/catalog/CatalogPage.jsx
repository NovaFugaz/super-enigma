import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState.jsx'
import ProductCard from '../../components/catalog/ProductCard.jsx'
import { CATEGORIES, PRODUCTS } from '../../data/catalog.js'
import { normalizeText } from '../../utils/format.js'

const SORT_OPTIONS = [
    { value: 'relevancia', label: 'Relevancia' },
    { value: 'precio-asc', label: 'Precio: menor a mayor' },
    { value: 'precio-desc', label: 'Precio: mayor a menor' },
    { value: 'nombre', label: 'Nombre A-Z' },
]

function sortProducts(list, order) {
    const sorted = [...list]
    if (order === 'precio-asc') sorted.sort((a, b) => a.precio - b.precio)
    if (order === 'precio-desc') sorted.sort((a, b) => b.precio - a.precio)
    if (order === 'nombre') sorted.sort((a, b) => a.nombre.localeCompare(b.nombre))
    return sorted
}

export default function CatalogPage() {
    const [params, setParams] = useSearchParams()
    const categoria = params.get('categoria') ?? ''
    const query = params.get('q') ?? ''

    const [marcas, setMarcas] = useState([])
    const [min, setMin] = useState('')
    const [max, setMax] = useState('')
    const [soloStock, setSoloStock] = useState(false)
    const [orden, setOrden] = useState('relevancia')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const setParam = (key, value) => {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value)
        else next.delete(key)
        setParams(next, { replace: true })
    }

    const changeCategory = (slug) => {
        setParam('categoria', slug)
        setMarcas([])
    }

    const toggleMarca = (marca) =>
        setMarcas((prev) => (prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]))

    const clearFilters = () => {
        setParams({}, { replace: true })
        setMarcas([])
        setMin('')
        setMax('')
        setSoloStock(false)
        setOrden('relevancia')
    }

    const availableBrands = useMemo(() => {
        const inCategory = PRODUCTS.filter((p) => !categoria || p.categoria === categoria)
        return [...new Set(inCategory.map((p) => p.marca))].sort((a, b) => a.localeCompare(b))
    }, [categoria])

    const products = useMemo(() => {
        const term = normalizeText(query.trim())
        const minValue = min === '' ? 0 : Number(min)
        const maxValue = max === '' ? Infinity : Number(max)

        const filtered = PRODUCTS.filter(
            (p) =>
                (!categoria || p.categoria === categoria) &&
                (marcas.length === 0 || marcas.includes(p.marca)) &&
                p.precio >= minValue &&
                p.precio <= maxValue &&
                (!soloStock || p.stock > 0) &&
                (!term || normalizeText(`${p.nombre} ${p.marca} ${p.modelo} ${p.descripcion}`).includes(term)),
        )

        return sortProducts(filtered, orden)
    }, [categoria, query, marcas, min, max, soloStock, orden])

    const hasFilters = categoria || query || marcas.length > 0 || min || max || soloStock

    return (
        <section className="page-container featured-section">
            <p className="section-kicker">Sonido Vivo</p>
            <h1 className="section-title">Catálogo</h1>

            <div className="catalog-layout">
                <aside className="catalog-filters-wrap">
                    <button
                        type="button"
                        className="btn-outline btn-block lg:hidden"
                        aria-expanded={filtersOpen}
                        onClick={() => setFiltersOpen((v) => !v)}>
                        {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                    </button>

                    <div className={`filters-panel ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
                        <div className="filter-group">
                            <label htmlFor="catalog-search" className="filter-title">
                                Buscar
                            </label>
                            <input
                                id="catalog-search"
                                type="search"
                                className="form-input"
                                placeholder="Nombre, marca o modelo"
                                value={query}
                                onChange={(e) => setParam('q', e.target.value)}/>
                        </div>

                        <fieldset className="filter-group">
                            <legend className="filter-title">Categoría</legend>
                            <label className="filter-option">
                                <input
                                    type="radio"
                                    name="categoria"
                                    checked={categoria === ''}
                                    onChange={() => changeCategory('')}/>Todas</label>
                            {CATEGORIES.map((c) => (
                                <label key={c.slug} className="filter-option">
                                    <input
                                        type="radio"
                                        name="categoria"
                                        checked={categoria === c.slug}
                                        onChange={() => changeCategory(c.slug)}/>
                                    {c.nombre}
                                </label>
                            ))}
                        </fieldset>

                        <fieldset className="filter-group">
                            <legend className="filter-title">Marca</legend>
                            <div className="filter-scroll">
                                {availableBrands.map((marca) => (
                                    <label key={marca} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={marcas.includes(marca)}
                                            onChange={() => toggleMarca(marca)}/>
                                        {marca}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="filter-group">
                            <legend className="filter-title">Precio (CLP)</legend>
                            <div className="filter-price">
                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    className="form-input"
                                    placeholder="Mín."
                                    aria-label="Precio mínimo"
                                    value={min}
                                    onChange={(e) => setMin(e.target.value)}/>

                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    className="form-input"
                                    placeholder="Máx."
                                    aria-label="Precio máximo"
                                    value={max}
                                    onChange={(e) => setMax(e.target.value)}/>
                            </div>
                        </fieldset>

                        <label className="filter-option">
                            <input
                                type="checkbox"
                                checked={soloStock}
                                onChange={(e) => setSoloStock(e.target.checked)}/>
                            Solo con stock
                        </label>

                        {hasFilters && (
                            <button type="button" className="btn-outline btn-block" onClick={clearFilters}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="catalog-toolbar">
                        <p className="text-sm text-costa-deep">
                            {products.length} {products.length === 1 ? 'producto' : 'productos'}
                        </p>

                        <label className="catalog-sort">
                            <span className="sr-only">Ordenar por</span>
                            <select
                                className="form-input"
                                value={orden}
                                onChange={(e) => setOrden(e.target.value)}>
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {products.length === 0 ? (
                        <EmptyState
                            title="Sin resultados"
                            description="Prueba con otros filtros o limpia la búsqueda."/>
                    ) : (
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard key={product.codigo} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}