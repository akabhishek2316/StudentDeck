import { useNavigate } from 'react-router-dom'
import './AccessRequired.css'

function AccessRequired({
  section = 'Campus Resources',
  message = 'Please sign in to continue.'
}) {
  const navigate = useNavigate()

  return (
    <div className="access-required-page">

      <div className="access-required-background-glow access-glow-one"></div>
      <div className="access-required-background-glow access-glow-two"></div>

      <main className="access-required-card">

        <div className="access-required-icon">
          <span>🔐</span>
        </div>

        <div className="access-required-badge">
          <span></span>
          STUDENTDECK
        </div>

        <h1>
          Sign in to continue
        </h1>

        <p className="access-required-message">
          {message}
        </p>

        <p className="access-required-description">
          Sign in to your StudentDeck account to access
          <strong> {section}</strong> and connect with
          your campus community.
        </p>

        <div className="access-required-actions">

          <button
            type="button"
            className="access-required-primary"
            onClick={() => navigate('/login')}
          >
            <span>Sign In</span>
            <span className="access-required-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="access-required-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>

        </div>

        <div className="access-required-footer">
          <span>✦</span>
          Private access for StudentDeck members
        </div>

      </main>

    </div>
  )
}

export default AccessRequired