import { useRef } from 'react'
import { Socket } from 'socket.io-client'
import { api } from '../../../lib/axios'
import type { SaveStatus } from '../types'

export function useAutoSave(
  id: string | undefined,
  socketRef: React.RefObject<Socket | null>,
  setSaveStatus: (s: SaveStatus) => void,
) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = (content: string) => {
    setSaveStatus('unsaved')
    socketRef.current?.emit('typing', id)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      socketRef.current?.emit('update-content', { noteId: id, content })
      try {
        await api.patch(`/notes/${id}`, { content })
        setSaveStatus('saved')
      } catch {
        setSaveStatus('unsaved')
      }
    }, 800)
  }

  return { scheduleAutoSave }
}