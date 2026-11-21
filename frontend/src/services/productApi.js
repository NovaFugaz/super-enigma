import { apiRequest } from './api.js'
import { toCatalogProduct } from './catalogApi.js'

function toProductRequest(product) {
  return {
    code: String(product.codigo ?? '').trim().toUpperCase(),
    category: product.categoria,
    name: String(product.nombre ?? '').trim(),
    brand: String(product.marca ?? '').trim(),
    model: String(product.modelo ?? '').trim(),
    price: Number(product.precio),
    stock: Number(product.stock),
    description: String(product.descripcion ?? '').trim(),
    image: String(product.image ?? '').trim(),
    active: product.active !== false,
  }
}

export async function fetchStaffProducts() {
  const response = await apiRequest('/api/staff/products?includeInactive=true')
  if (!Array.isArray(response)) throw new Error('La API devolvió una lista de productos inválida.')
  return response.map(toCatalogProduct)
}

export async function updateProductStock(code, stock) {
  const response = await apiRequest(`/api/staff/products/${encodeURIComponent(code)}/stock`, {
    method: 'PATCH',
    body: { stock },
  })
  return toCatalogProduct(response)
}

export async function createStaffProduct(product) {
  const response = await apiRequest('/api/staff/products', {
    method: 'POST',
    body: toProductRequest(product),
  })
  return toCatalogProduct(response)
}

export async function updateStaffProduct(code, product) {
  const response = await apiRequest(`/api/staff/products/${encodeURIComponent(code)}`, {
    method: 'PUT',
    body: toProductRequest({ ...product, codigo: code }),
  })
  return toCatalogProduct(response)
}

export async function deactivateStaffProduct(code) {
  await apiRequest(`/api/staff/products/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  })
}
