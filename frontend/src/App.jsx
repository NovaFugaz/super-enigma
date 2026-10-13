import AppRouter from './routes/AppRouter.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </CartProvider>
  )
}