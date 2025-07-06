// Display a list of a student's bookings
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function BookingList() {
  const [list,setList] = useState([])
  const { authHeader } = useAuth()

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings`, authHeader())
      .then(res => setList(res.data))
      .catch(err => {
        console.error("Bookings fetch error:", err.response?.status, err.response?.data)
      })
  }, [])
  

  return (
    <ul>
      {list.map(b => <li key={b.id}>{b.lesson.title} — {b.status}</li>)}
    </ul>
  )
}