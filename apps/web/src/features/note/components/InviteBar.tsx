import { useState } from 'react'
import { api } from '../../../lib/axios'

export function InviteBar({ noteId }: { noteId: string }) {
  const [inviteLink, setInviteLink] = useState('')
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const createInvite = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/notes/${noteId}/invite`, { role: 'EDITOR' })
      const link = res.data.inviteLink || res.data.link || `${window.location.origin}/invite/${res.data.token}`
      setInviteLink(link)
      setShow(true)
    } catch (e) {
      console.error('Invite yaratishda xato:', e)
    } finally {
      setLoading(false)
    }
  }

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={createInvite}
        disabled={loading}
        className="flex items-center gap-1.5 bg-[#4F6EF7] hover:bg-[#3D5CE8] active:scale-95
          disabled:opacity-60 text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-lg
          transition-all shadow-sm hover:shadow-md"
      >
        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        )}
        <span className="hidden sm:inline">Ulashish</span>
      </button>

      {/* Invite modal */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShow(false)}/>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ECEEF2] p-5">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#4F6EF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">Havola ulashish</p>
                  <p className="text-[11px] text-[#888]">Havolani nusxalab yuboring</p>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999] hover:text-[#333] hover:bg-[#F3F4F6] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2.5 min-w-0">
                <svg className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                </svg>
                <span className="text-[12px] text-[#555] font-mono truncate">{inviteLink}</span>
              </div>
              <button
                onClick={copyInvite}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all shrink-0
                  ${copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#4F6EF7] hover:bg-[#3D5CE8] text-white'}`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    Nusxalandi
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Nusxalash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}