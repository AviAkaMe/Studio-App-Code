// Form used to create a new user account
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SignupForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isTrainer: false
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const user = await signup(
        form.name,
        form.email,
        form.password,
        form.isTrainer
      )
      setMessage('Account created successfully!')
      // after a brief delay, navigate based on the user’s role
      setTimeout(() => nav(`/${user.role}`), 1000)
    } catch (err) {
      console.error("Signup error:", err)
      console.error("Response data:", err.response?.data)
      setError(
        err.response?.data?.msg ||
        err.message ||
        "Sign up failed. Please try again."
      )
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={form.isTrainer}
          onChange={(e) =>
            setForm({ ...form, isTrainer: e.target.checked })
          }
        />
        Register as admin
      </label>

      <button type="submit">Sign Up</button>
      <button type="button" onClick={() => nav('/login')}>
        Back to Login
      </button>
    </form>
    </div>
  )
}