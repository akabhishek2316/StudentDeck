import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MainLayout() {
  const location = useLocation()

  // Always start a newly-navigated page at the top instead of
  // keeping the previous page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout