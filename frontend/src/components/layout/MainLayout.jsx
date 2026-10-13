import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import OrderNotification from '../common/OrderNotification.jsx'

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <OrderNotification />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}