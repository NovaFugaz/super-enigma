const ROLE_CONTENT = {
  seller: {
    title: 'Panel de vendedor',
    description: 'Tu sesión tiene acceso al espacio de gestión de vendedor.',
  },
  admin: {
    title: 'Panel de administrador',
    description: 'Tu sesión tiene acceso al espacio de administración.',
  },
}

export default function RoleHomePage({ role }) {
  const content = ROLE_CONTENT[role]

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Área interna</p>
      <h1 className="section-title">{content.title}</h1>
      <p className="mt-2 text-sm text-costa-deep">{content.description}</p>
      <div className="location-detail mt-6 max-w-2xl" role="status">
        Los módulos operativos de esta área aún están en construcción.
      </div>
    </section>
  )
}