import AppRouter from './routes/AppRouter.jsx'
import { CartProvider } from './context/CartContext.jsx'

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  )
}