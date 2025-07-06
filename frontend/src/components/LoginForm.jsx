// Simple login form component
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  // Local form state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const { login } = useAuth()   // from AuthContext
  const navigate  = useNavigate()  // for redirecting after login

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // login() now returns the user object ({ id, role })
      const user = await login(email, password)
      // redirect to the correct dashboard
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      // Display any backend error (e.g. invalid credentials)
      setError(err.response?.data?.msg || 'Login failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label htmlFor="email-input">
        Email
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>

      <label htmlFor="password-input">
        Password
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit">Log In</button>
      <button type="button" onClick={() => navigate('/signup')}>Sign Up</button>
    </form>
  )
}