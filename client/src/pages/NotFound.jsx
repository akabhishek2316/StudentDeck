import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">

        <div className="not-found-code">
          404
        </div>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you are looking for
          doesn't exist or may have been moved.
        </p>

        <Link
          to="/"
          className="not-found-home-button"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  )
}

export default NotFound