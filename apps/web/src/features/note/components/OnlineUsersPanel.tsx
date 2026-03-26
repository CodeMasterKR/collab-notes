import { api } from '../../../lib/axios'
import type { OnlineUser, Role } from '../types'
import { useState, useRef, useEffect } from 'react'

interface Props {
  users: OnlineUser[]
  currentUserId: string
  myRole: Role
  noteId: string
  onRoleChange: (userId: string, newRole: Role) => void
}

function Avatar({ name, avatar, size = 36 }: {
  name: string
  avatar?: string | null
  size?: number
}) {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`${color} rounded-full flex items-center justify-center
        text-white font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function RoleBadge({ role }: { role?: Role }) {
  if (!role) return null
  const styles: Record<Role, string> = {
    OWNER:  'bg-purple-100 text-purple-600',
    EDITOR: 'bg-blue-100 text-blue-600',
    VIEWER: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<Role, string> = {
    OWNER:  'Owner',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${styles[role]}`}>
      {labels[role]}
    </span>
  )
}

function RoleDropdown({
  userId,
  currentRole,
  onSelect,
}: {
  userId: string
  currentRole?: Role
  onSelect: (userId: string, role: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-6 h-6 flex items-center justify-center rounded-md
          text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title="Rolni o'zgartirish"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && dropdownPos && (
        <div
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-36"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase
            tracking-wider px-3 py-1.5">Rol tanlash</p>

          <button
            onClick={() => { onSelect(userId, 'EDITOR'); setOpen(false) }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
              font-medium transition-colors hover:bg-blue-50
              ${currentRole === 'EDITOR' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0
              ${currentRole === 'EDITOR' ? 'bg-blue-500' : 'bg-transparent border border-gray-300'}`} />
            Editor
            {currentRole === 'EDITOR' && (
              <svg className="w-3 h-3 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <button
            onClick={() => { onSelect(userId, 'VIEWER'); setOpen(false) }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
              font-medium transition-colors hover:bg-gray-50
              ${currentRole === 'VIEWER' ? 'text-gray-700' : 'text-gray-600'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0
              ${currentRole === 'VIEWER' ? 'bg-gray-500' : 'bg-transparent border border-gray-300'}`} />
            Viewer
            {currentRole === 'VIEWER' && (
              <svg className="w-3 h-3 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export function OnlineUsersPanel({ users, currentUserId, myRole, noteId, onRoleChange }: Props) {
  const me = users.find(u => u.userId === currentUserId)
  const others = users.filter(u => u.userId !== currentUserId)
  const isOwner = myRole === 'OWNER'

  async function handleRoleSelect(targetUserId: string, newRole: Role) {
    try {
      await api.patch(`/notes/${noteId}/members/${targetUserId}/role`, {
        role: newRole,
      })
      onRoleChange(targetUserId, newRole)
    } catch (err) {
      console.error('Role update xatosi:', err)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl
      border border-gray-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <div className="relative flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute" />
        </div>
        <span className="text-[14px] font-bold text-gray-800">Online</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100
              flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-[13px] text-gray-400 font-medium">Hech kim online emas</p>
          </div>
        ) : (
          <>
            {me && (
              <>
                <p className="text-[10px] font-semibold text-gray-400
                  uppercase tracking-wider px-2 pb-1">Siz</p>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-blue-50">
                  <div className="relative shrink-0">
                    <Avatar name={me.name} avatar={me.avatar} size={34} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                      bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                      {me.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RoleBadge role={myRole} />
                      <span className="text-[11px] text-green-500 font-medium">• Online</span>
                    </div>
                  </div>
                </div>

                {others.length > 0 && (
                  <p className="text-[10px] font-semibold text-gray-400
                    uppercase tracking-wider px-2 pt-3 pb-1">
                    Boshqalar ({others.length})
                  </p>
                )}
              </>
            )}

            {others.map(u => (
              <div key={u.userId}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl
                  hover:bg-gray-50 transition-colors">
                <div className="relative shrink-0">
                  <Avatar name={u.name} avatar={u.avatar} size={34} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                    bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                    {u.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <RoleBadge role={u.role} />
                    <span className="text-[11px] text-green-500 font-medium">• Online</span>
                  </div>
                </div>

                {isOwner && (
                  <RoleDropdown
                    userId={u.userId}
                    currentRole={u.role}
                    onSelect={handleRoleSelect}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
        <p className="text-[11px] text-gray-400 text-center">
          {users.length === 1
            ? 'Faqat siz bu hujjatdasiz'
            : `${users.length} kishi bir vaqtda tahrirlayapti`}
        </p>
      </div>
    </div>
  )
}