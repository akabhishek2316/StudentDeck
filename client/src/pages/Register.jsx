import { useState } from 'react'
import { registerUser } from '../api'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
const [department, setDepartment] = useState('')
const [year, setYear] = useState('')

  const handleSubmit = async (event) => {
  event.preventDefault()

  if (!name.trim()) {
    alert('Please enter your name')
    return
  }

  if (!email.trim()) {
    alert('Please enter your email')
    return
  }

  if (!password) {
    alert('Please enter a password')
    return
  }

  if (password.length < 6) {
    alert('Password must contain at least 6 characters')
    return
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match')
    return
  }

  try {
    await registerUser({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
  department: department.trim(),
  year: Number(year),
})

    alert('Registration successful!')

    navigate('/login')
  } catch (error) {
    alert(error.message)
  }
}

  return (
    <div className="auth-page">

      <div className="auth-container">

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join your campus community
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-input-wrapper">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(event) =>
      setPassword(event.target.value)
    }
    placeholder="Enter password"
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <div className="password-input-wrapper">
  <input
    type={showConfirmPassword ? 'text' : 'password'}
    value={confirmPassword}
    onChange={(event) =>
      setConfirmPassword(event.target.value)
    }
    placeholder="Confirm password"
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    aria-label={
      showConfirmPassword
        ? 'Hide password'
        : 'Show password'
    }
  >
    {showConfirmPassword ? (
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
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
          </div>

          <div className="form-group">
  <label>Department</label>

  <input
    type="text"
    value={department}
    onChange={(event) =>
      setDepartment(event.target.value)
    }
    placeholder="Enter your department"
  />
</div>

<div className="form-group">
  <label>Year</label>

  <div className="year-input-wrapper">
    <input
      type="text"
      value={year}
      onChange={(event) => {
        const value = event.target.value

        if (/^[1-5]?$/.test(value)) {
          setYear(value)
        }
      }}
      placeholder="Enter your year"
      inputMode="numeric"
    />

    <div className="year-arrows">
      <button
        type="button"
        onClick={() => {
          const currentYear = Number(year) || 1

          if (currentYear > 1) {
            setYear(String(currentYear - 1))
          }
        }}
      >
        ▲
      </button>

      <button
        type="button"
        onClick={() => {
          const currentYear = Number(year) || 1

          if (currentYear < 5) {
            setYear(String(currentYear + 1))
          }
        }}
      >
        ▼
      </button>
    </div>
  </div>
</div>

          <button
            className="auth-button"
            type="submit"
          >
            Register
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{' '}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Register