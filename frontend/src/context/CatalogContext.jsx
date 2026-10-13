import { useEffect, useState } from 'react'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'
import { loadCatalogWorkbook } from '../services/catalogWorkbook.js'
import { CatalogContext } from './catalog-context.js'

const STOCK_KEY = 'sonido-vivo-stock'

function readStockOverrides() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STOCK_KEY) ?? '{}')
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  } catch {
    return {}
  }
}

function applyStockOverrides(products, overrides) {
  return products.map((product) => ({
    ...product,
    stock: Number.isInteger(overrides[product.codigo])
      ? overrides[product.codigo]
      : product.stock,
  }))
}

export function CatalogProvider({ children }) {
  const [stockOverrides, setStockOverrides] = useState(readStockOverrides)
  const [products, setProducts] = useState(() => applyStockOverrides(PRODUCTS, readStockOverrides()))
  const [source, setSource] = useState('fallback')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    loadCatalogWorkbook()
      .then((loadedProducts) => {
        if (!mounted) return
        const currentOverrides = readStockOverrides()
        setProducts(applyStockOverrides(loadedProducts, currentOverrides))
        setStockOverrides(currentOverrides)
        setSource('xlsx')
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const applyNewStock = (overrides) => {
    setStockOverrides(overrides)
    setProducts((currentProducts) => applyStockOverrides(currentProducts, overrides))
  }

  const updateStock = (productCode, quantity) => {
    if (!products.some((product) => product.codigo === productCode)) {
      return { error: 'No se encontró el producto.' }
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { error: 'El stock debe ser un entero mayor o igual a cero.' }
    }

    const nextOverrides = { ...stockOverrides, [productCode]: quantity }
    try {
      window.localStorage.setItem(STOCK_KEY, JSON.stringify(nextOverrides))
    } catch {
      return { error: 'No se pudo guardar el stock en este navegador.' }
    }

    applyNewStock(nextOverrides)
    return { stock: quantity }
  }

  return (
    <CatalogContext.Provider value={{ categories: CATEGORIES, products, source, loading, error, stockOverrides, applyNewStock, updateStock }}>
      {children}
    </CatalogContext.Provider>
  )
}