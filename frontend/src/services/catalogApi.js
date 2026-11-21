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

export function toCatalogCategory(category) {
  if (
    !category ||
    typeof category.slug !== 'string' ||
    category.slug.length === 0 ||
    typeof category.name !== 'string' ||
    (category.description != null && typeof category.description !== 'string') ||
    (category.image != null && typeof category.image !== 'string')
  ) {
    throw new Error('La API devolvió una categoría con datos inválidos.')
  }

  return {
    slug: category.slug,
    nombre: category.name,
    descripcion: category.description ?? '',
    image: category.image ?? '',
  }
}

export async function fetchProducts() {
  const response = await apiRequest('/api/products')
  if (!Array.isArray(response)) {
    throw new Error('La API devolvió un catálogo inválido.')
  }
  return response.map(toCatalogProduct)
}

export async function fetchCategories() {
  const response = await apiRequest('/api/categories')
  if (!Array.isArray(response)) {
    throw new Error('La API devolvió una lista de categorías inválida.')
  }
  return response.map(toCatalogCategory)
}
