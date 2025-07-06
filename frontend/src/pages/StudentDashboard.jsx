// Dashboard page shown to student users
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WeeklySchedule from '../components/WeeklySchedule'

export default function StudentDashboard(){
  const { logout } = useAuth()
  const nav = useNavigate()

  return <div className="dashboard">
    <button onClick={() => { logout(); nav('/login'); }}>Log Out</button>
    <h1>Available Lessons</h1>
    <WeeklySchedule isAdmin={false} />
  </div>
}