import { CATEGORIES } from '../data/catalog.js'

const REQUIRED_COLUMNS = ['codigo', 'categoria', 'nombre', 'marca', 'modelo', 'stock', 'precio', 'descripcion']
const CATEGORY_SLUGS = new Set(CATEGORIES.map((category) => category.slug))

function normalizeHeader(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function parseCatalogRows(rows) {
  if (!Array.isArray(rows) || rows.length < 2) {
    throw new Error('El archivo no contiene filas de productos.')
  }

  const headers = rows[0].map(normalizeHeader)
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
  if (missingColumns.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missingColumns.join(', ')}.`)
  }

  const columnIndex = Object.fromEntries(headers.map((header, index) => [header, index]))
  const products = rows.slice(1)
    .filter((row) => row.some((value) => value !== null && value !== undefined && value !== ''))
    .map((row, index) => {
      const value = (column) => row[columnIndex[column]]
      const product = {
        codigo: String(value('codigo') ?? '').trim(),
        categoria: String(value('categoria') ?? '').trim(),
        nombre: String(value('nombre') ?? '').trim(),
        marca: String(value('marca') ?? '').trim(),
        modelo: String(value('modelo') ?? '').trim(),
        stock: Number(value('stock')),
        precio: Number(value('precio')),
        descripcion: String(value('descripcion') ?? '').trim(),
        image: String(value('image') ?? '').trim(),
      }

      if (!product.codigo || !product.nombre || !CATEGORY_SLUGS.has(product.categoria)) {
        throw new Error(`Fila ${index + 2}: código, nombre o categoría inválidos.`)
      }
      if (!Number.isInteger(product.stock) || product.stock < 0 || !Number.isFinite(product.precio) || product.precio < 0) {
        throw new Error(`Fila ${index + 2}: stock o precio inválidos.`)
      }
      return product
    })

  const codes = products.map((product) => product.codigo)
  if (products.length === 0 || new Set(codes).size !== codes.length) {
    throw new Error('El catálogo debe tener productos y códigos únicos.')
  }

  return products
}

export async function loadCatalogWorkbook() {
  const response = await fetch(`${import.meta.env.BASE_URL}catalogo.xlsx`)
  if (!response.ok) throw new Error(`No se pudo cargar catalogo.xlsx (${response.status}).`)

  const { default: readXlsxFile } = await import('read-excel-file/browser')
  const workbook = await readXlsxFile(await response.blob())
  const firstSheet = Array.isArray(workbook) ? workbook[0] : workbook
  const rows = Array.isArray(firstSheet) ? firstSheet : firstSheet?.data
  return parseCatalogRows(rows)
}