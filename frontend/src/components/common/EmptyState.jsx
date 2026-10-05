export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-text">{description}</p>}
    </div>
  )
}