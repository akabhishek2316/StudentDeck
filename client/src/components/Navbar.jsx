import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  )

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('currentUser')

    setCurrentUser(null)
    setShowMenu(false)
    setShowProfileMenu(false)

    navigate('/')
  }

  const closeMenu = () => {
    setShowMenu(false)
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link'

  return (
    <nav className="navbar">

      {/* ================= LEFT SIDE ================= */}
      <div className="navbar-left">

        {/* HAMBURGER */}
        <button
          className="hamburger-button"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Open navigation menu"
          aria-expanded={showMenu}
        >
          {showMenu ? '✕' : '☰'}
        </button>

        {/* LOGO */}
        <NavLink
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          StudentDeck
        </NavLink>

      </div>


      {/* ================= MAIN NAV ================= */}
      <div className="navbar-links">

        <NavLink
          to="/messages"
          className={linkClass}
        >
          Messages
        </NavLink>

        <NavLink
          to="/saved"
          className={linkClass}
        >
          Saved
        </NavLink>


        {/* ================= PROFILE ================= */}
        {currentUser ? (

          <div className="profile-menu">

            <button
              className="profile-trigger"
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
            >

              <span className="profile-avatar">
                {currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : 'U'}
              </span>

              <span className="profile-name">
                Profile
              </span>

              <span className="profile-arrow">
                {showProfileMenu ? '▲' : '▼'}
              </span>

            </button>


            {showProfileMenu && (

              <div className="profile-dropdown">

                <NavLink
                  to="/profile"
                  className="dropdown-item"
                  onClick={() =>
                    setShowProfileMenu(false)
                  }
                >
                  My Profile
                </NavLink>

                <button
                  className="dropdown-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        ) : (

          <NavLink
            to="/login"
            className="login-button"
          >
            Login
          </NavLink>

        )}

      </div>


      {/* ================= HAMBURGER MENU ================= */}
      {showMenu && (

        <div className="service-menu">

          <div className="service-menu-header">
            <span>Campus Services</span>
            <span className="service-menu-subtitle">
              Explore StudentDeck
            </span>
          </div>


          <NavLink
            to="/"
            end
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🏠</span>
            <span>
              <strong>Home</strong>
              <small>Dashboard & updates</small>
            </span>
          </NavLink>


          <NavLink
            to="/marketplace"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🛒</span>
            <span>
              <strong>Marketplace</strong>
              <small>Buy & sell campus items</small>
            </span>
          </NavLink>


          <NavLink
            to="/lost-found"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🔎</span>
            <span>
              <strong>Lost & Found</strong>
              <small>Find lost campus items</small>
            </span>
          </NavLink>


          <NavLink
            to="/academic"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">📚</span>
            <span>
              <strong>Academic Resources</strong>
              <small>Notes & study material</small>
            </span>
          </NavLink>


          <NavLink
            to="/events"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">📅</span>
            <span>
              <strong>Events</strong>
              <small>Campus events & activities</small>
            </span>
          </NavLink>


          <NavLink
            to="/messages"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">💬</span>
            <span>
              <strong>Messages</strong>
              <small>Chat with students</small>
            </span>
          </NavLink>


          <NavLink
            to="/saved"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🔖</span>
            <span>
              <strong>Saved</strong>
              <small>Your saved posts</small>
            </span>
          </NavLink>


          {currentUser ? (

            <>
              <NavLink
                to="/profile"
                className="service-menu-item"
                onClick={closeMenu}
              >
                <span className="service-icon">👤</span>
                <span>
                  <strong>My Profile</strong>
                  <small>View your profile</small>
                </span>
              </NavLink>

              <button
                className="service-logout"
                onClick={handleLogout}
              >
                <span className="service-icon">↪</span>

                <span>
                  <strong>Logout</strong>
                  <small>Sign out of StudentDeck</small>
                </span>
              </button>
            </>

          ) : (

            <NavLink
              to="/login"
              className="service-menu-item service-login"
              onClick={closeMenu}
            >
              <span className="service-icon">🔐</span>

              <span>
                <strong>Login</strong>
                <small>Login to your account</small>
              </span>
            </NavLink>

          )}

        </div>

      )}

    </nav>
  )
}

export default Navbar