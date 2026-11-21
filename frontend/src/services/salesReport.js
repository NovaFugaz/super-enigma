import { apiRequest } from './api.js'

function salesReportPath(days, csv = false) {
  const endpoint = csv ? '/api/reports/sales.csv' : '/api/reports/sales'
  if (days === undefined) return endpoint
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('El período del reporte debe estar entre 1 y 365 días.')
  }
  return `${endpoint}?days=${days}`
}

export async function fetchSalesReport(days) {
  const report = await apiRequest(salesReportPath(days))
  if (
    !report ||
    !Number.isInteger(report.orderCount) ||
    typeof report.totalSales !== 'number' ||
    typeof report.unitsSold !== 'number' ||
    !Array.isArray(report.salesByDate) ||
    !report.salesByDate.every((entry) =>
      entry && typeof entry.date === 'string' &&
      typeof entry.orders === 'number' && typeof entry.total === 'number',
    ) ||
    !Array.isArray(report.topProducts) ||
    !report.topProducts.every((product) =>
      product && typeof product.code === 'string' &&
      typeof product.name === 'string' &&
      typeof product.units === 'number' &&
      typeof product.revenue === 'number',
    )
  ) {
    throw new Error('La API devolvió un reporte de ventas inválido.')
  }
  return report
}

export async function downloadSalesReport(days) {
  const csv = await apiRequest(salesReportPath(days, true))
  if (typeof csv !== 'string') throw new Error('La API devolvió un archivo CSV inválido.')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'sonido-vivo-reporte-ventas.csv'
  link.hidden = true
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
