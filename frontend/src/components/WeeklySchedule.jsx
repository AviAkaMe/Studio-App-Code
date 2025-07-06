// Weekly calendar component used in both dashboards
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function WeeklySchedule({ isAdmin }) {
  const { authHeader, user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [bookings, setBookings] = useState([])

  // Load all lessons from the API
  const fetchLessons = () =>
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/lessons`, authHeader())
      .then(res => setLessons(res.data))
  
  // Load bookings for the current student
  const fetchBookings = () =>
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings`, authHeader())
      .then(res => setBookings(res.data))

  // Initial data load
  useEffect(() => {
    fetchLessons()
    if (!isAdmin) fetchBookings()
  }, [])

  // Display range for the calendar
  const startHour = 6
  const endHour = 22
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  // Reload the schedule data
  const reload = () => {
    fetchLessons()
    if (!isAdmin) fetchBookings()
  }

  // Admin helper for quickly creating a lesson in a given slot
  const addLesson = (day, hour) => {
    const title = prompt('Class title?')
    if (!title) return
    const date = new Date()
    const diff = (7 + day - date.getDay()) % 7
    date.setDate(date.getDate() + diff)
    date.setHours(hour, 0, 0, 0)
    axios.post(
      `${import.meta.env.VITE_API_URL}/api/lessons`,
      {
        title,
        description: '',
        start_time: date.toISOString(),
        duration: 60,
        capacity: 10,
        trainer_id: user.id
      },
      authHeader()
    ).then(reload)
  }

  // Student booking actions
  const bookLesson = id => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        { lesson_id: id },
        authHeader()
      )
      .then(reload)
  }

  const cancelLesson = bookingId => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`,
        {},
        authHeader()
      )
      .then(reload)
  }

  const deleteLesson = id => {
    axios
      .delete(
        `${import.meta.env.VITE_API_URL}/api/lessons/${id}`,
        authHeader()
      )
      .then(reload)
  }

  // Helper maps for quick lookup when rendering
  const lessonsBySlot = {}
  lessons.forEach(l => {
    const d = new Date(l.start_time)
    const key = `${d.getDay()}-${d.getHours()}`
    if (!lessonsBySlot[key]) lessonsBySlot[key] = []
    lessonsBySlot[key].push(l)
  })

  const bookingsByLesson = {}
  bookings.forEach(b => {
    if (b.status !== 'cancelled') bookingsByLesson[b.lesson.id] = b
  })

  const hours = Array.from({length: endHour - startHour + 1}, (_,i) => startHour + i)

  return (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Time</th>
          {dayNames.map((d,i) => <th key={i}>{d}</th>)}
        </tr>
      </thead>
      <tbody>
        {hours.map(h => (
          <tr key={h}>
            <td>{h}:00</td>
            {dayNames.map((_,di) => {
              const key = `${di}-${h}`
              const cellLessons = lessonsBySlot[key] || []
              return (
                <td key={key}>
                  {cellLessons.map(ls => {
                    const booking = bookingsByLesson[ls.id]
                    const booked = !!booking
                    return (
                      <div key={ls.id} className="lesson" style={{ color: booked ? 'green' : 'red' }}>
                        {ls.title}
                        {isAdmin && (
                          <button onClick={() => deleteLesson(ls.id)}>-</button>
                        )}
                        {!isAdmin && (
                          booked ? (
                            <button onClick={() => cancelLesson(booking.id)}>Pull Out</button>
                          ) : (
                            <button onClick={() => bookLesson(ls.id)}>Book</button>
                          )
                        )}
                      </div>
                    )
                  })}
                  {isAdmin && <button onClick={() => addLesson(di, h)}>+</button>}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}