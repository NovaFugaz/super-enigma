import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import HomePage from '../modules/catalog/HomePage.jsx'
import ContactPage from '../modules/contact/ContactPage.jsx'
import AboutPage from '../modules/about/AboutPage.jsx'
import CartPage from '../modules/cart/CartPage.jsx'
import LoginPage from '../modules/auth/LoginPage.jsx'

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
        <Route path="nosotros" element={<AboutPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* Aquí irán: catalogo, mis-pedidos, registro  */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}