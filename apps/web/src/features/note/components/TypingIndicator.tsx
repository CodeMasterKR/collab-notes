export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null

  return (
    <div className="hidden md:flex items-center gap-1.5 bg-[#F0F2FF] rounded-full px-3 py-1">
      <span className="flex gap-0.5 items-end h-3">
        {[0, 150, 300].map(delay => (
          <span
            key={delay}
            className="w-1 bg-[#4F6EF7] rounded-full animate-bounce"
            style={{ height: 6, animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="text-[11px] text-[#4F6EF7] font-medium">
        {users.slice(0, 2).join(', ')} yozmoqda
      </span>
    </div>
  )
}