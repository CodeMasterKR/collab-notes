import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { Editor } from '@tiptap/react'
import type { OnlineUser } from '../types'

interface Options {
  id: string | undefined
  token: string | null
  user: any
  editor: Editor | null
  isRemote: React.MutableRefObject<boolean>
  setOnlineUsers: (users: OnlineUser[]) => void
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>
}

export function useSocket({
  id, token, user, editor, isRemote, setOnlineUsers, setTypingUsers,
}: Options) {
  const navigate = useNavigate()
  const socketRef = useRef<Socket | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => { editorRef.current = editor }, [editor])

  useEffect(() => {
    if (!id) return

    const storedToken = token || localStorage.getItem('token')
    if (!storedToken) {
      navigate('/login')
      return
    }

    const newSocket = io('http://localhost:3001/notes', {
      auth: { token: storedToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      newSocket.emit('join-note', id)
      setSocket(newSocket)
    })

    newSocket.on('reconnect', () => {
      console.log('🔄 Socket reconnected')
      newSocket.emit('join-note', id)
      setSocket(newSocket)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setSocket(null)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message)
    })

    newSocket.on('online-users', (users: OnlineUser[]) => {
      console.log('👥 Online users:', users)
      setOnlineUsers(users)
    })

    newSocket.on('content-updated', ({ content }: { content: string }) => {
      const e = editorRef.current
      if (!e) return
      isRemote.current = true
      const { from, to } = e.state.selection
      e.commands.setContent(content, { emitUpdate: false } as any)
      e.commands.setTextSelection({ from, to })
      isRemote.current = false
    })

    newSocket.on('user-typing', ({ userId, name }: { userId: string; name: string }) => {
      if (userId === user?.id) return
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name])
      if (typingTimers.current[userId]) clearTimeout(typingTimers.current[userId])
      typingTimers.current[userId] = setTimeout(() => {
        setTypingUsers(prev => prev.filter(n => n !== name))
      }, 2500)
    })

    newSocket.on('error', (msg: string) => {
      console.error('Socket error:', msg)
      if (msg === "Ruxsat yo'q") navigate('/notes')
    })

    return () => {
      newSocket.emit('leave-note', id)
      newSocket.disconnect()
      setSocket(null)
      socketRef.current = null
    }
  }, [id, token])

  return { socketRef, socket }
}