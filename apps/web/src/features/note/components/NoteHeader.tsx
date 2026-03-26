import { useNavigate } from 'react-router-dom'
import type { SaveStatus as SaveStatusType, OnlineUser } from '../types'
import { SaveStatus } from './SaveStatus'
import { TypingIndicator } from './TypingIndicator'
import { InviteBar } from './InviteBar'

interface Props {
  noteId: string
  title: string
  saveStatus: SaveStatusType
  onlineUsers: OnlineUser[]
  typingUsers: string[]
  onTitleChange: (val: string) => void
  onTitleBlur: () => void
  onCommentsToggle: () => void
  onOnlineUsersToggle: () => void
}

export function NoteHeader({
  noteId, title, saveStatus, typingUsers,
  onTitleChange, onTitleBlur
}: Props) {
  const navigate = useNavigate()

  return (
    <header
      className="h-[52px] bg-white border-b border-gray-100 sticky top-0 z-30
        flex items-center px-4 gap-3"
      style={{ boxShadow: '0 1px 0 0 #F0F0F0' }}
    >
      <button
        onClick={() => navigate('/notes')}
        className="group flex items-center gap-1.5 shrink-0 px-2 py-1.5
          rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
        </svg>
        <span className="text-[12px] font-medium text-gray-400 group-hover:text-gray-600
          transition-colors hidden sm:inline">
          Notlar
        </span>
      </button>

      <div className="w-px h-4 bg-gray-200 shrink-0"/>

      <div className="flex-1 min-w-0">
        <input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          placeholder="Sarlavhasiz hujjat"
          className="w-full text-[14px] font-semibold text-gray-800 bg-transparent
            outline-none placeholder:text-gray-300
            hover:bg-gray-50 focus:bg-blue-50/50
            px-2 py-1 rounded-lg transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <TypingIndicator users={typingUsers}/>
        <SaveStatus status={saveStatus}/>
        <div className="w-px h-4 bg-gray-200"/>
        <InviteBar noteId={noteId}/>
      </div>
    </header>
  )
}