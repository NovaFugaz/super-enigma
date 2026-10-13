function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export function buildSalesReportCsv(orders) {
  const rows = [
    ['Fecha', 'Pedido', 'Cliente', 'Correo', 'Estado', 'Seguimiento', 'Productos', 'Total'],
    ...orders.map((order) => [
      new Date(order.createdAt).toLocaleDateString('es-CL'),
      order.id,
      order.customerName,
      order.customerEmail,
      order.status,
      order.trackingNumber,
      order.items.reduce((count, item) => count + item.quantity, 0),
      order.total,
    ]),
  ]

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`
}

export function downloadSalesReport(orders) {
  const csv = buildSalesReportCsv(orders)
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