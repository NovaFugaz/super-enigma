export default function StockBadge({ stock }) {
  if (stock === 0) return <span className="stock-badge stock-out">Agotado</span>
  if (stock <= 3) return <span className="stock-badge stock-low">Quedan {stock}</span>
  return <span className="stock-badge stock-ok">En stock</span>
}