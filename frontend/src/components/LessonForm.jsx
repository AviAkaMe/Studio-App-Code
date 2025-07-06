// Small form used by admins to create new lessons
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LessonForm({ onSuccess }) {
  const [form,setForm] = useState({ title:'', description:'', start_time:'', duration:60, capacity:10 })
  const { authHeader } = useAuth()

  const submit = async e => {
    e.preventDefault()
    await axios.post(`${import.meta.env.VITE_API_URL}/api/lessons`, form, authHeader())
    onSuccess()
  }

  return (
    <form onSubmit={submit}>
      {/* Inputs for title, description, etc. */}
      <button type="submit">Save Lesson</button>
    </form>
  )
}