import { describe, expect, it } from 'vitest'
import { parseCatalogRows } from '../services/catalogWorkbook.js'

const headers = ['codigo', 'categoria', 'nombre', 'marca', 'modelo', 'stock', 'precio', 'descripcion', 'image']

describe('catalog workbook parser', () => {
  it('converts workbook rows into catalog products', () => {
    const products = parseCatalogRows([
      headers,
      ['GA901', 'guitarras-acusticas', 'Guitarra demo', 'Yamaha', 'F310', 4, 129990, 'Descripción demo', null],
    ])

    expect(products).toEqual([{
      codigo: 'GA901',
      categoria: 'guitarras-acusticas',
      nombre: 'Guitarra demo',
      marca: 'Yamaha',
      modelo: 'F310',
      stock: 4,
      precio: 129990,
      descripcion: 'Descripción demo',
      image: '',
    }])
  })

  it('rejects workbooks without required columns', () => {
    expect(() => parseCatalogRows([['codigo', 'nombre'], ['GA901', 'Guitarra demo']]))
      .toThrow(/Faltan columnas requeridas/)
  })

  it('rejects invalid stock and prices', () => {
    expect(() => parseCatalogRows([
      headers,
      ['GA901', 'guitarras-acusticas', 'Guitarra demo', 'Yamaha', 'F310', -1, 129990, 'Descripción demo', ''],
    ])).toThrow(/stock o precio inválidos/)
  })

  it('rejects duplicate product codes', () => {
    const row = ['GA901', 'guitarras-acusticas', 'Guitarra demo', 'Yamaha', 'F310', 4, 129990, 'Descripción demo', '']
    expect(() => parseCatalogRows([headers, row, row])).toThrow(/códigos únicos/)
  })
})