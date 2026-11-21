import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadSalesReport, fetchSalesReport } from '../services/salesReport.js'

describe('sales report API', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loads dashboard metrics for a selected period', async () => {
    const report = {
      days: 30,
      orderCount: 2,
      totalSales: 250000,
      unitsSold: 3,
      salesByDate: [{ date: '2026-11-20', orders: 2, total: 250000 }],
      topProducts: [{ code: 'GA001', name: 'Guitarra demo', units: 3, revenue: 250000 }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(report), { status: 200 })))

    await expect(fetchSalesReport(30)).resolves.toEqual(report)
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/reports/sales?days=30', expect.any(Object))
  })

  it('downloads the backend CSV for the selected period', async () => {
    const csv = '\uFEFF"Fecha";"Pedido";"Total"'
    const createObjectURL = vi.fn(() => 'blob:sales-report')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(csv, { status: 200 })))
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.spyOn(window, 'setTimeout').mockImplementation((callback) => {
      callback()
      return 0
    })

    await downloadSalesReport(7)

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/reports/sales.csv?days=7', expect.any(Object))
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'text/csv;charset=utf-8' }))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:sales-report')
  })

  it('rejects a period outside the backend-supported range', async () => {
    await expect(fetchSalesReport(0)).rejects.toThrow(/entre 1 y 365 días/)
  })
})
