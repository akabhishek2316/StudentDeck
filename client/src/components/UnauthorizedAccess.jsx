import { useNavigate } from 'react-router-dom'
import './UnauthorizedAccess.css'


function UnauthorizedAccess({
  title = 'Login Required',
  message = 'Please login to access this page.',
  buttonText = 'Go to Login',
}) {
  const navigate = useNavigate()


  const handleBack = () => {
    navigate(-1)
  }


  const handleLogin = () => {
    navigate('/login')
  }


  return (
    <div className="unauthorized-page">

      <div className="unauthorized-card">


        <div className="unauthorized-icon">
          🔒
        </div>


        <span className="unauthorized-label">
          AUTHENTICATION REQUIRED
        </span>


        <h1>
          {title}
        </h1>


        <p>
          {message}
        </p>


        <div className="unauthorized-actions">

          <button
            type="button"
            className="unauthorized-button"
            onClick={handleLogin}
          >
            {buttonText}
          </button>


          <button
            type="button"
            className="unauthorized-back-button"
            onClick={handleBack}
          >
            ← Go Back
          </button>

        </div>


      </div>

    </div>
  )
}


export default UnauthorizedAccess