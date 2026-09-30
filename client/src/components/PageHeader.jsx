import { Link, useNavigate } from 'react-router-dom'
import './PageHeader.css'

function PageHeader({
  eyebrow,
  title,
  description,

  backTo,
  backText = 'Back',
  onBack,

  actionTo,
  actionText,
  actionIcon = '+',
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    if (backTo) {
      navigate(backTo)
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <section className="page-header">
      <div className="page-header-inner">

        {/* Back Button */}
        <button
          type="button"
          className="page-header-back"
          onClick={handleBack}
          aria-label={backText}
        >
          <span className="page-header-back-icon">
            ←
          </span>

          <span className="page-header-back-text">
            {backText}
          </span>
        </button>


        {/* Main Content */}
        <div className="page-header-content">

          {eyebrow && (
            <div className="page-header-eyebrow">
              <span className="page-header-eyebrow-dot"></span>
              {eyebrow}
            </div>
          )}

          <h1 className="page-header-title">
            {title}
          </h1>

          {description && (
            <p className="page-header-description">
              {description}
            </p>
          )}

          {/* Mobile Action */}
          {actionTo && actionText && (
            <Link
              to={actionTo}
              className="page-header-action page-header-action-mobile"
            >
              <span className="page-header-action-icon">
                {actionIcon}
              </span>

              {actionText}
            </Link>
          )}

        </div>


        {/* Desktop Action */}
        {actionTo && actionText && (
          <Link
            to={actionTo}
            className="page-header-action page-header-action-desktop"
          >
            <span className="page-header-action-icon">
              {actionIcon}
            </span>

            {actionText}
          </Link>
        )}

      </div>
    </section>
  )
}

export default PageHeader