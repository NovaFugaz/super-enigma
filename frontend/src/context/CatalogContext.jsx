import { useEffect, useState } from 'react'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'
import { loadCatalogWorkbook } from '../services/catalogWorkbook.js'
import { CatalogContext } from './catalog-context.js'

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS)
  const [source, setSource] = useState('fallback')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    loadCatalogWorkbook()
      .then((loadedProducts) => {
        if (!mounted) return
        setProducts(loadedProducts)
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

  return (
    <CatalogContext.Provider value={{ categories: CATEGORIES, products, source, loading, error }}>
      {children}
    </CatalogContext.Provider>
  )
}