import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const { isAuthenticated, isAdmin } = useAuth()
  const hasBottomNav = isAuthenticated && !isAdmin

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className={`flex-1 ${hasBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
