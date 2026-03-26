import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { useNotes } from './hooks/useNotes'
import { NotesHeader } from './components/NotesHeader'
import { NoteCreateForm } from './components/NoteCreateForm'
import { NoteCard } from './components/NoteCard'
import { NotesSkeleton } from './components/NotesSkeleton'
import { NotesEmpty } from './components/NotesEmpty'

export default function NotesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { notes, loading, title, setTitle, creating, createNote, deleteNote } = useNotes()
  const [search, setSearch] = useState('')

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#111]">

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E3] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <span className="text-[20px] font-bold tracking-tight text-[#111] shrink-0">
            CollabNotes
          </span>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-sm bg-[#F6F6F4] border border-[#E5E5E3] rounded-md focus:outline-none focus:border-[#111] transition-colors placeholder:text-[#BBB]"
            />
          </div>

          <div className="flex-1" />

          {/* Logout — qizil, o'ng tomonda */}
          <button
            onClick={() => {
              if (confirm('Chiqmoqchimisiz?')) {
                logout()
                navigate('/login')
              }
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Chiqish
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold tracking-tight text-[#111]">
            Salom, {user?.name?.split(' ')[0] || 'Foydalanuvchi'} 👋
          </h1>
          <p className="text-[13px] mt-1 text-[#999]">
            {notes.length > 0
              ? `${notes.length} ta notingiz mavjud`
              : "Hali notlar yo'q — birinchisini yarating"}
          </p>
        </div>

        {/* Create form */}
        <NoteCreateForm
          title={title}
          creating={creating}
          dark={false}
          onChange={setTitle}
          onSubmit={createNote}
        />

        {/* Notes grid */}
        {loading ? (
          <NotesSkeleton dark={false} />
        ) : filtered.length === 0 ? (
          <NotesEmpty dark={false} search={search} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                dark={false}
                onClick={() => navigate(`/notes/${note.id}`)}
                onDelete={e => deleteNote(e, note.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}