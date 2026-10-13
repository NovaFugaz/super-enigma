import { useEffect, useState } from 'react'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'
import { loadCatalogWorkbook } from '../services/catalogWorkbook.js'
import { CatalogContext } from './catalog-context.js'

const STOCK_KEY = 'sonido-vivo-stock'
const PRODUCT_OVERRIDES_KEY = 'sonido-vivo-product-overrides'

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

function readProductOverrides() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PRODUCT_OVERRIDES_KEY) ?? '{}')
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  } catch {
    return {}
  }
}

function mergeProductOverrides(baseProducts, overrides) {
  const baseCodes = new Set(baseProducts.map((product) => product.codigo))
  const mergedProducts = baseProducts.map((product) => ({
    ...product,
    ...(overrides[product.codigo] ?? {}),
  }))
  const newProducts = Object.values(overrides).filter((product) => product?.codigo && !baseCodes.has(product.codigo))
  return [...mergedProducts, ...newProducts]
}

export function CatalogProvider({ children }) {
  const [stockOverrides, setStockOverrides] = useState(readStockOverrides)
  const [productOverrides, setProductOverrides] = useState(readProductOverrides)
  const [baseProducts, setBaseProducts] = useState(PRODUCTS)
  const [allProducts, setAllProducts] = useState(() => {
    const merged = mergeProductOverrides(PRODUCTS, readProductOverrides())
    return applyStockOverrides(merged, readStockOverrides())
  })
  const [source, setSource] = useState('fallback')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    loadCatalogWorkbook()
      .then((loadedProducts) => {
        if (!mounted) return
        const currentOverrides = readStockOverrides()
        const currentProductOverrides = readProductOverrides()
        const mergedProducts = mergeProductOverrides(loadedProducts, currentProductOverrides)
        setBaseProducts(loadedProducts)
        setStockOverrides(currentOverrides)
        setProductOverrides(currentProductOverrides)
        setAllProducts(applyStockOverrides(mergedProducts, currentOverrides))
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
    setAllProducts((currentProducts) => applyStockOverrides(currentProducts, overrides))
  }

  const updateStock = (productCode, quantity) => {
    if (!allProducts.some((product) => product.codigo === productCode)) {
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

  const persistProductOverrides = (nextOverrides) => {
    try {
      window.localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(nextOverrides))
    } catch {
      return { error: 'No se pudieron guardar los productos en este navegador.' }
    }

    setProductOverrides(nextOverrides)
    const mergedProducts = mergeProductOverrides(baseProducts, nextOverrides)
    setAllProducts(applyStockOverrides(mergedProducts, stockOverrides))
    return { success: true }
  }

  const createProduct = (product) => {
    const codigo = String(product.codigo ?? '').trim().toUpperCase()
    if (!codigo || allProducts.some((entry) => entry.codigo === codigo)) {
      return { error: 'Ingresa un código único para el producto.' }
    }
    if (!CATEGORIES.some((category) => category.slug === product.categoria)) {
      return { error: 'Selecciona una categoría válida.' }
    }
    const name = String(product.nombre ?? '').trim()
    const price = Number(product.precio)
    const stock = Number(product.stock)
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return { error: 'Revisa nombre, precio y stock del producto.' }
    }

    const createdProduct = {
      codigo,
      categoria: product.categoria,
      nombre: name,
      marca: String(product.marca ?? '').trim(),
      modelo: String(product.modelo ?? '').trim(),
      precio: price,
      stock,
      descripcion: String(product.descripcion ?? '').trim(),
      image: String(product.image ?? '').trim(),
      active: true,
    }
    const result = persistProductOverrides({ ...productOverrides, [codigo]: createdProduct })
    return result.error ? result : { product: createdProduct }
  }

  const updateProduct = (productCode, changes) => {
    const currentProduct = allProducts.find((product) => product.codigo === productCode)
    if (!currentProduct) return { error: 'No se encontró el producto.' }
    const updatedProduct = { ...currentProduct, ...changes, codigo: productCode }
    if (!CATEGORIES.some((category) => category.slug === updatedProduct.categoria)) {
      return { error: 'Selecciona una categoría válida.' }
    }
    if (!String(updatedProduct.nombre ?? '').trim() || !Number.isFinite(Number(updatedProduct.precio)) || Number(updatedProduct.precio) < 0 || !Number.isInteger(Number(updatedProduct.stock)) || Number(updatedProduct.stock) < 0) {
      return { error: 'Revisa nombre, precio y stock del producto.' }
    }

    const normalizedProduct = {
      ...updatedProduct,
      nombre: String(updatedProduct.nombre).trim(),
      precio: Number(updatedProduct.precio),
      stock: Number(updatedProduct.stock),
    }
    const result = persistProductOverrides({ ...productOverrides, [productCode]: normalizedProduct })
    return result.error ? result : { product: normalizedProduct }
  }

  const deactivateProduct = (productCode) => updateProduct(productCode, { active: false })
  const products = allProducts.filter((product) => product.active !== false)

  return (
    <CatalogContext.Provider value={{ categories: CATEGORIES, products, adminProducts: allProducts, source, loading, error, stockOverrides, applyNewStock, updateStock, createProduct, updateProduct, deactivateProduct }}>
      {children}
    </CatalogContext.Provider>
  )
}