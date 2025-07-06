// Dashboard page shown to admin users
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import WeeklySchedule from '../components/WeeklySchedule'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const nav = useNavigate()
  return <div className="dashboard">
    <button onClick={() => { logout(); nav('/login'); }}>Log Out</button>
    <h1>Admin Dashboard</h1>
    <WeeklySchedule isAdmin={true} />
  </div>
}