import type { Note } from '../types'

function stripHtml(html: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || ''
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Hozirgina'
  if (mins < 60) return `${mins} daq oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  return `${Math.floor(hours / 24)} kun oldin`
}

interface Props {
  note: Note
  dark: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

export function NoteCard({ note, dark, onClick, onDelete }: Props) {
  const preview = stripHtml(note.content || '').slice(0, 160)
  const wordCount = stripHtml(note.content || '').split(/\s+/).filter(Boolean).length

  const card = dark ? 'bg-[#1C1C1E] border-[#2C2C2E] hover:border-[#3A3A3C]' : 'bg-white border-[#EBEBEB] hover:border-[#D0D0D0]'
  const title = dark ? 'text-white' : 'text-[#111]'
  const body = dark ? 'text-[#888]' : 'text-[#999]'
  const meta = dark ? 'text-[#555]' : 'text-[#BBB]'
  const del = dark ? 'bg-[#2C2C2E] hover:bg-red-500/20 text-[#555] hover:text-red-400' : 'bg-[#F5F5F5] hover:bg-red-50 text-[#CCC] hover:text-red-500'

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${card}`}
    >
      <button
        onClick={onDelete}
        className={`absolute top-4 right-4 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150 ${del}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <h3 className={`font-semibold text-[15px] leading-snug line-clamp-1 pr-8 mb-3 ${title}`}>
        {note.title || 'Sarlavhasiz'}
      </h3>

      <p className={`text-[13px] leading-relaxed line-clamp-3 mb-5 min-h-[60px] ${body}`}>
        {preview || 'Hali hech narsa yozilmagan...'}
      </p>

      <div className={`flex items-center justify-between text-[12px] ${meta}`}>
        <span>{timeAgo(note.updatedAt)}</span>
        <div className="flex items-center gap-3">
          {wordCount > 0 && <span>{wordCount} so'z</span>}
          {note.members?.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {note.members.length + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}