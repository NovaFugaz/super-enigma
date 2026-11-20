import { apiRequest } from './api.js'

export function toCatalogProduct(product) {
  if (
    !product ||
    typeof product.code !== 'string' ||
    typeof product.category !== 'string' ||
    typeof product.name !== 'string' ||
    !Number.isInteger(product.price) ||
    !Number.isInteger(product.stock)
  ) {
    throw new Error('La API devolvió un producto con datos inválidos.')
  }

  return {
    codigo: product.code,
    categoria: product.category,
    nombre: product.name,
    marca: product.brand ?? '',
    modelo: product.model ?? '',
    precio: product.price,
    stock: product.stock,
    descripcion: product.description ?? '',
    image: product.image ?? '',
    active: product.active,
  }
}

export async function fetchProducts() {
  const response = await apiRequest('/api/products')
  if (!Array.isArray(response)) {
    throw new Error('La API devolvió un catálogo inválido.')
  }
  return response.map(toCatalogProduct)
}
