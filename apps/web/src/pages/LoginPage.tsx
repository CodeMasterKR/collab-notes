import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import Logo from '../components/Logo'

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#111] text-white text-[13px] px-4 py-2.5 rounded-xl shadow-lg">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" stroke="#f87171" strokeWidth="1.4"/>
        <path d="M7.5 4.5v3M7.5 10h.01" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      {message}
      <button onClick={onClose} className="ml-1 text-white/50 hover:text-white">✕</button>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search)
    const redirect = params.get('redirect')
    
    return redirect ? decodeURIComponent(redirect) : '/notes'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      
      const savedToken = localStorage.getItem('token')
      
      if (savedToken) {
        const target = getRedirectPath()
        console.log("Yo'naltirilmoqda:", target) 
        navigate(target, { replace: true })
      }} catch (err: any) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid')) {
        setToast("Email yoki parol noto'g'ri")
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('exist')) {
        setToast("Bu email ro'yxatdan o'tmagan")
      } else {
        setToast(msg || 'Xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-90">

          {/* ─── HEADER ───────────────────── */}
          <div className="mb-10">
            <div className="mb-6">
              <Logo />
            </div>
            <h1 className="text-[22px] font-semibold text-[#111] tracking-tight">Kirish</h1>
            <p className="text-[13px] text-[#999] mt-1">Hisobingizga xush kelibsiz</p>
          </div>

          {/* ─── FORM ─────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#555] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="sizning@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all duration-150"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-[#555]">Parol</label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-[#999] hover:text-[#111] transition-colors"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 bg-[#111] hover:bg-[#222] text-white text-[14px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Kirmoqda...
                </span>
              ) : 'Kirish'}
            </button>
          </form>

          {/* ─── FOOTER ─────────────────── */}
          <p className="text-[13px] text-[#999] mt-6">
            Hisob yo'qmi?{' '}
            <Link to="/register" className="text-[#111] font-medium hover:underline underline-offset-2">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}