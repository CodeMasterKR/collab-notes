import type { SaveStatus } from '../types'

export function SaveStatus({ status }: { status: SaveStatus }) {
  if (status === 'saved') return (
    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
      </svg>
      Saqlandi
    </span>
  )

  if (status === 'saving') return (
    <span className="flex items-center gap-1 text-[11px] text-[#4F6EF7] font-medium">
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Saqlanmoqda...
    </span>
  )

  return (
    <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/>
      Saqlanmagan
    </span>
  )
}