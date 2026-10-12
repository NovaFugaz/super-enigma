export default function ImageSlot({ src, alt, className = '' }) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`image-slot ${className}`} />
  }

  return (
    <div className={`image-slot image-slot-empty ${className}`} role="img" aria-label={alt}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </svg>
    </div>
  )
}