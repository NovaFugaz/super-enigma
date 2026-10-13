import AppRouter from './routes/AppRouter.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CatalogProvider } from './context/CatalogContext.jsx'

export default function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </CartProvider>
    </CatalogProvider>
  )
}