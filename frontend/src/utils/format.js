const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const formatCLP = (value) => clp.format(value)

export const normalizeText = (text) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()