import { useCallback, useEffect, useState } from 'react'
import { CATEGORIES } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'
import {
  createStaffProduct,
  deactivateStaffProduct,
  fetchStaffProducts,
  updateProductStock as updateProductStockRequest,
  updateStaffProduct,
} from '../services/productApi.js'
import { CatalogContext } from './catalog-context.js'

export function CatalogProvider({ children }) {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true
    fetchProducts()
      .then((loadedProducts) => {
        if (!mounted) return
        setAllProducts(loadedProducts)
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
  }, [reloadKey])

  const loadStaffProducts = useCallback(async () => {
    const loadedProducts = await fetchStaffProducts()
    setAllProducts(loadedProducts)
    return loadedProducts
  }, [])

  const updateStock = async (productCode, quantity) => {
    if (!allProducts.some((product) => product.codigo === productCode)) {
      return { error: 'No se encontró el producto.' }
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { error: 'El stock debe ser un entero mayor o igual a cero.' }
    }

    try {
      const updatedProduct = await updateProductStockRequest(productCode, quantity)
      setAllProducts((currentProducts) => currentProducts.map((product) =>
        product.codigo === productCode ? updatedProduct : product,
      ))
      return { stock: updatedProduct.stock }
    } catch (error) {
      return { error: error.message }
    }
  }

  const createProduct = async (product) => {
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
    try {
      const savedProduct = await createStaffProduct(createdProduct)
      setAllProducts((currentProducts) => [...currentProducts, savedProduct])
      return { product: savedProduct }
    } catch (error) {
      return { error: error.message }
    }
  }

  const updateProduct = async (productCode, changes) => {
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
    try {
      const savedProduct = await updateStaffProduct(productCode, normalizedProduct)
      setAllProducts((currentProducts) => currentProducts.map((product) =>
        product.codigo === productCode ? savedProduct : product,
      ))
      return { product: savedProduct }
    } catch (error) {
      return { error: error.message }
    }
  }

  const deactivateProduct = async (productCode) => {
    const product = allProducts.find((entry) => entry.codigo === productCode)
    if (!product) return { error: 'No se encontró el producto.' }
    try {
      await deactivateStaffProduct(productCode)
      const deactivatedProduct = { ...product, active: false }
      setAllProducts((currentProducts) => currentProducts.map((entry) =>
        entry.codigo === productCode ? deactivatedProduct : entry,
      ))
      return { product: deactivatedProduct }
    } catch (error) {
      return { error: error.message }
    }
  }

  const reload = () => {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }
  const products = allProducts.filter((product) => product.active !== false)

  return (
    <CatalogContext.Provider value={{
      categories: CATEGORIES,
      products,
      adminProducts: allProducts,
      loading,
      error,
      reload,
      loadStaffProducts,
      updateStock,
      createProduct,
      updateProduct,
      deactivateProduct,
    }}>
      {children}
    </CatalogContext.Provider>
  )
}