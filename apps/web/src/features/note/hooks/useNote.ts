import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Editor } from '@tiptap/react'
import { api } from '../../../lib/axios'
import type { Note } from '../types'

export function useNote(id: string | undefined, editor: Editor | null) {
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!id || !editor) return
    api.get(`/notes/${id}`)
      .then(res => {
        setNote(res.data)
        setTitle(res.data.title)
        if (res.data.content) {
          editor.commands.setContent(res.data.content)
        }
      })
      .catch(() => navigate('/notes'))
  }, [id, editor])

  const updateTitle = async () => {
    if (!note || title === note.title) return
    try {
      await api.patch(`/notes/${id}`, { title })
      setNote(prev => prev ? { ...prev, title } : prev)
    } catch {}
  }

  return { note, setNote, title, setTitle, updateTitle }
}