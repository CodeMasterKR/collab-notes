import { useRef, useState } from 'react'
import { api } from '../../../lib/axios'

interface Props {
  dark: boolean
  search: string
  user: any
  onToggleDark: () => void
  onSearchChange: (val: string) => void
  onProfileSave: (name: string, avatar: string | null) => void
}

export function NotesHeader({ dark, search, user, onToggleDark, onSearchChange, onProfileSave }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [preview, setPreview] = useState<string | null>(user?.avatar || null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const header = dark ? 'bg-[#111111]/90 border-[#222]' : 'bg-white/90 border-[#EBEBEB]'
  const searchBox = dark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white' : 'bg-[#F0F0F0] border-transparent text-[#111]'
  const modal = dark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white' : 'bg-white border-[#E5E5E5] text-[#111]'
  const input = dark ? 'bg-[#2C2C2E] border-[#3A3A3C] text-white placeholder:text-[#555]' : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#111] placeholder:text-[#BBB]'
  const sub = dark ? 'text-[#888]' : 'text-[#999]'

  const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/me', { name, avatar: preview })
      onProfileSave(name, preview)
      setShowProfile(false)
    } catch {
      onProfileSave(name, preview)
      setShowProfile(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className={`sticky top-0 z-20 border-b backdrop-blur-md transition-colors duration-300 ${header}`}>
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? 'bg-white' : 'bg-[#111]'}`}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill={dark ? '#111' : 'white'}/>
                <rect x="8" y="1" width="5" height="5" rx="1" fill={dark ? '#111' : 'white'} opacity="0.5"/>
                <rect x="1" y="8" width="5" height="5" rx="1" fill={dark ? '#111' : 'white'} opacity="0.5"/>
                <rect x="8" y="8" width="5" height="5" rx="1" fill={dark ? '#111' : 'white'}/>
              </svg>
            </div>
            <span className={`font-semibold text-[14px] tracking-tight ${dark ? 'text-white' : 'text-[#111]'}`}>
              Notepad
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors ${searchBox}`}>
              <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Qidirish..."
                className="bg-transparent outline-none text-[13px] w-28 placeholder:opacity-40"
              />
            </div>

            <button
              onClick={onToggleDark}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${dark ? 'bg-[#1C1C1E] hover:bg-[#2C2C2E] text-yellow-400' : 'bg-[#F0F0F0] hover:bg-[#E5E5E5] text-[#555]'}`}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-violet-500/30 hover:ring-violet-500/60 transition-all"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[11px] font-bold">
                  {initials}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfile(false)}/>
          <div className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${modal}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-[16px]">Profil</h2>
              <button onClick={() => setShowProfile(false)} className={`w-7 h-7 rounded-full flex items-center justify-center ${dark ? 'hover:bg-[#2C2C2E]' : 'hover:bg-[#F0F0F0]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {preview ? (
                  <img src={preview} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-offset-2"/>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold">
                    {initials}
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#111111] hover:bg-[#222222] rounded-full flex items-center justify-center shadow-lg transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
              </div>
              <p className={`text-[12px] mt-3 ${sub}`}>Rasm yuklash uchun bosing</p>
            </div>

            <div className="mb-4">
              <label className={`block text-[12px] font-medium mb-1.5 ${sub}`}>Ism</label>
              <input value={name} onChange={e => setName(e.target.value)} className={`w-full px-3.5 py-2.5 text-[14px] rounded-xl border outline-none transition-all ${input}`} placeholder="Ismingiz"/>
            </div>

            <div className="mb-6">
              <label className={`block text-[12px] font-medium mb-1.5 ${sub}`}>Email</label>
              <input value={user?.email || ''} readOnly className={`w-full px-3.5 py-2.5 text-[14px] rounded-xl border outline-none opacity-50 cursor-not-allowed ${input}`}/>
            </div>

            <button onClick={handleSave} disabled={saving || !name.trim()} className="w-full py-2.5 bg-[#111111] hover:bg-[#222222] disabled:opacity-40 text-white text-[14px] font-medium rounded-xl transition-colors">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}