import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import HomePage from '../modules/catalog/HomePage.jsx'
import ContactPage from '../modules/contact/ContactPage.jsx'

function ComingSoon() {
  return (
    <div className="page-container py-16">
      <EmptyState
        title="Próximamente"
        description="Esta sección aún está en construcción."
      />
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="contacto" element={<ContactPage />} />
          {/* Aquí irán: catalogo, pedidos, nosotros, login, registro, carrito */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}