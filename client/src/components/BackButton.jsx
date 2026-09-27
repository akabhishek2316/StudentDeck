import { useNavigate } from 'react-router-dom'
import './BackButton.css'

/**
 * Consistent "back" navigation used at the top of every detail page.
 * Uses browser history when possible so it feels natural (e.g. returns
 * to whatever filtered/scrolled state the list was in), and falls back
 * to a fixed destination (`fallback`) if there's no history to go back to
 * (e.g. the page was opened directly via a shared link).
 */
function BackButton({ label = 'Back', fallback = '/' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      className="back-button"
      onClick={handleClick}
    >
      <span className="back-button-arrow">←</span>
      {label}
    </button>
  )
}

export default BackButton
