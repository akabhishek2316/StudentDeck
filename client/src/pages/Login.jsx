import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import './Auth.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      alert('Please enter your email')
      return
    }

    if (!password) {
      alert('Please enter your password')
      return
    }

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      })

      localStorage.setItem('token', data.token)

      localStorage.setItem(
        'currentUser',
        JSON.stringify(data.user)
      )

      alert(`Welcome, ${data.user.name}!`)

      navigate('/')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="auth-page">

      {/* =================================================
        HEADER
    ================================================= */}

      <header className="auth-header">

        <div className="auth-header-inner">

          <Link
            to="/"
            className="auth-brand"
          >

            <div className="auth-brand-icon">
              S
            </div>

            <div className="auth-brand-text">

              <span className="auth-brand-name">
                StudentDeck
              </span>

              <span className="auth-brand-tagline">
                Campus Community
              </span>

            </div>

          </Link>

          <span className="auth-header-campus">
            Your Campus. Your Community.
          </span>

        </div>

      </header>


      {/* =================================================
        MAIN
    ================================================= */}

      <main className="auth-main">

        <div className="auth-wrapper">

          <Link to="/" className="auth-home-button">
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="auth-container">


            <div className="auth-card-label">
              CAMPUS LOGIN
            </div>

            <h1>
              Welcome Back
            </h1>

            <p className="auth-subtitle">
              Sign in to connect with your campus community.
            </p>


            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your college email"
                />

              </div>


              <div className="form-group">

                <label>
                  Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a16.6 16.6 0 0 1-3.1 4.4" />
                        <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}

                  </button>

                </div>

              </div>


              <button
                className="auth-button"
                type="submit"
              >
                Login
              </button>

            </form>


            <p className="auth-footer">

              Don't have an account?{' '}

              <Link to="/register">
                Create one
              </Link>

            </p>

          </div>
        </div>

      </main>


      {/* =================================================
        FOOTER
    ================================================= */}

      <footer className="auth-footer">

        <div className="auth-footer-brand">
          StudentDeck • Campus Community Platform
        </div>

        <div className="auth-footer-note">
          Connect • Learn • Discover • Grow
        </div>

      </footer>

    </div>
  )
}

export default Login