// Simple authentication context used throughout the React app
import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // Perform login request and store returned JWT
    const { data } = await axios.post('/api/auth/login', { email, password })

    localStorage.setItem('token', data.access_token)
     // Decode the JWT payload to extract the user info
    const payload = JSON.parse(atob(data.access_token.split('.')[1]))
    // payload.sub is now the user ID string, and payload.role is the user’s role
    const loggedInUser = {
      id:   payload.sub,    // e.g. "5"
      role: payload.role    // e.g. "admin"
    }
     setUser(loggedInUser)
     console.log("🔐 raw JWT payload:", payload)
     return loggedInUser
  }

  // Create account then immediately log in
  const signup = async (name, email, password, isTrainer = false) => { 
    await axios.post('/api/auth/register', { name, email, password, role: isTrainer ? 'admin' : 'student' })
    return login(email, password)
  }

  // Helper to include the stored JWT on API calls
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const logout = () => {
    // Remove token and reset user state
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, authHeader }}>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)