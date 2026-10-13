import { describe, expect, it } from 'vitest'
import { buildSalesReportCsv } from '../services/salesReport.js'

describe('sales report CSV', () => {
  it('exports order, customer, status, tracking, units and total columns', () => {
    const csv = buildSalesReportCsv([{
      id: 'SV-1001',
      createdAt: '2026-10-13T12:00:00.000Z',
      customerName: 'Amy Demo',
      customerEmail: 'amy@example.cl',
      status: 'en_proceso',
      trackingNumber: 'TRK-1001',
      items: [{ quantity: 2 }],
      total: 150000,
    }])

    expect(csv.charCodeAt(0)).toBe(0xFEFF)
    expect(csv).toContain('"Fecha";"Pedido";"Cliente";"Correo";"Estado";"Seguimiento";"Productos";"Total"')
    expect(csv).toContain('"SV-1001";"Amy Demo";"amy@example.cl";"en_proceso";"TRK-1001";"2";"150000"')
  })

  it('escapes quotes and exports an empty report header', () => {
    const csv = buildSalesReportCsv([{
      id: 'SV-1002',
      createdAt: '2026-10-13T12:00:00.000Z',
      customerName: 'Amy "Demo"',
      items: [],
      total: 0,
    }])

    expect(csv).toContain('"Amy ""Demo"""')
    expect(buildSalesReportCsv([]).split('\r\n')).toHaveLength(1)
  })
})