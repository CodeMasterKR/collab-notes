import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/axios'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const acceptInvite = useCallback(async () => {
    if (!token) return

    try {
      const res = await api.post(`/invite/${token}/accept`)
      console.log('✅ Invite accept response:', res.data)

      setStatus('success')
      setTimeout(() => navigate(`/notes/${res.data.noteId}`), 2000)

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xatolik yuz berdi'
      console.error('❌ Invite error:', msg)

      if (err.response?.status === 401) {
        const currentPath = location.pathname + location.search
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true })
        return
      }

      if (
        msg.toLowerCase().includes('already') ||
        msg.toLowerCase().includes('allaqachon') ||
        err.response?.status === 409
      ) {
        setStatus('success')
        try {
          const infoRes = await api.get(`/invite/${token}`)
          setTimeout(() => navigate(`/notes/${infoRes.data.noteId}`), 1500)
        } catch {
          setTimeout(() => navigate('/notes'), 1500)
        }
        return
      }

      setStatus('error')
      setMessage(msg)
    }
  }, [token, navigate, location.pathname, location.search])

  useEffect(() => {
    if (!token) return

    const userToken = localStorage.getItem('token')
    
    if (!userToken) {
      const currentPath = location.pathname + location.search
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true })
      return
    }

    acceptInvite()
  }, [token, navigate, location.pathname, location.search, acceptInvite])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-10 text-center">

          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Taklif qabul qilinmoqda</h2>
                <p className="text-sm text-gray-400">Bir lahza kuting...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Muvaffaqiyatli!</h2>
                <p className="text-sm text-gray-400">Notega yo'naltirilmoqda...</p>
              </div>
              <div className="flex gap-1 mt-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Xatolik yuz berdi</h2>
                <p className="text-[13px] text-red-500/80 leading-relaxed px-2">{message}</p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() => navigate('/notes')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Notlarga o'tish
                </button>
                <button
                  onClick={() => { setStatus('loading'); acceptInvite() }}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}