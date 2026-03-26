interface Props {
  title: string
  creating: boolean
  dark: boolean
  onChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function NoteCreateForm({ title, creating, dark, onChange, onSubmit }: Props) {
  const inputBox = dark
    ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white placeholder:text-[#444]'
    : 'bg-white border-[#E5E5E5] text-[#111] placeholder:text-[#CCC]'

  return (
    <form onSubmit={onSubmit} className="flex gap-2.5 mb-10">
      <input
        type="text"
        placeholder="Yangi not nomini kiriting..."
        value={title}
        onChange={e => onChange(e.target.value)}
        className={`flex-1 px-4 py-2.5 text-[14px] rounded-xl border outline-none focus:ring-2 focus:ring-[#333333] transition-all shadow-sm ${inputBox}`}
      />
      <button
        type="submit"
        disabled={!title.trim() || creating}
        className="flex items-center gap-2 bg-[#111111] hover:bg-[#222222] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        {creating ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
        )}
        Yaratish
      </button>
    </form>
  )
}