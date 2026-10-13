import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import HomePage from '../modules/catalog/HomePage.jsx'
import ContactPage from '../modules/contact/ContactPage.jsx'
import AboutPage from '../modules/about/AboutPage.jsx'
import CartPage from '../modules/cart/CartPage.jsx'
import LoginPage from '../modules/auth/LoginPage.jsx'
import RegisterPage from '../modules/auth/RegisterPage.jsx'
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage.jsx'
import CatalogPage from '../modules/catalog/CatalogPage.jsx'
import ProductDetailPage from '../modules/catalog/ProductDetailPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AccessDeniedPage from '../modules/auth/AccessDeniedPage.jsx'
import RoleHomePage from '../modules/auth/RoleHomePage.jsx'
import OrdersPage from '../modules/cart/OrdersPage.jsx'
import OrderTrackingPage from '../modules/cart/OrderTrackingPage.jsx'

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
        <Route path="registro" element={<RegisterPage />} />
        <Route path="recuperar" element={<ForgotPasswordPage />} />
        <Route path="403" element={<AccessDeniedPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="producto/:codigo" element={<ProductDetailPage />} />
        <Route path="seguimiento" element={<OrderTrackingPage />} />
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="pedidos" element={<OrdersPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
          <Route path="vendedor" element={<RoleHomePage role="seller" />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="administracion" element={<RoleHomePage role="admin" />} />
        </Route>
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}