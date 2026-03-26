import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/axios'
import type { Note } from '../types'

export function useNotes() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes')
      setNotes(res.data)
    } catch (e) {
      console.error('fetchNotes error:', e)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/notes', { title: title.trim() })
      setNotes(prev => [res.data, ...prev])
      setTitle('')
      navigate(`/notes/${res.data.id}`)
    } finally {
      setCreating(false)
    }
  }

  const deleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (!confirm("Bu noteni o'chirishni tasdiqlaysizmi?")) return
    await api.delete(`/notes/${noteId}`)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  return { notes, loading, title, setTitle, creating, createNote, deleteNote }
}