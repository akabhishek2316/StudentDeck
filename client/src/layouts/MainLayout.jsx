import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MainLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isMessagesPage =
    location.pathname === '/messages'

  return (
    <div
      className={
        isMessagesPage
          ? 'app-shell messages-layout'
          : 'app-shell'
      }
    >
      {!isMessagesPage && <Navbar />}

      <main className="app-main">
        <Outlet />
      </main>

      {!isMessagesPage && <Footer />}
    </div>
  )
}

export default MainLayout