import type { OnlineUser } from '../types'

const USER_COLORS = [
  '#4F6EF7', '#E85D75', '#0FADA0', '#F4A022',
  '#9B59E8', '#E84393', '#00B5D8', '#6DBE45',
]

function getColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

function Avatar({ user, index }: { user: OnlineUser; index: number }) {
  const color = getColor(user.userId)
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div
      title={user.name}
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-default select-none ring-2 ring-white transition-transform hover:scale-110 hover:-translate-y-0.5"
      style={{
        backgroundColor: color,
        marginLeft: index > 0 ? '-8px' : '0',
        zIndex: 10 - index,
        position: 'relative',
      }}
    >
      {initials}
    </div>
  )
}

export function OnlineAvatars({ users }: { users: OnlineUser[] }) {
  return (
    <div className="flex items-center" style={{ marginLeft: 4 }}>
      {users.slice(0, 5).map((u, i) => (
        <Avatar key={u.userId} user={u} index={i} />
      ))}
      {users.length > 5 && (
        <div
          className="w-8 h-8 rounded-full ring-2 ring-white bg-[#E8EAED] flex items-center justify-center text-[11px] text-[#555] font-semibold"
          style={{ marginLeft: -8, position: 'relative', zIndex: 5 }}
        >
          +{users.length - 5}
        </div>
      )}
    </div>
  )
}