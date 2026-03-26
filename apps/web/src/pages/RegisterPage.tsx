import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import Logo from '../components/Logo'

// ─── Toast ───────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

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

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'otp'>('register')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const { register, verifyOtp, resendOtp } = useAuthStore()
  const navigate = useNavigate()

  // ─── TIMER ───────────────────────────────
  useEffect(() => {
    if (step !== 'otp') return
    if (timer === 0) { setCanResend(true); return }
    const interval = setInterval(() => setTimer(p => p - 1), 1000)
    return () => clearInterval(interval)
  }, [step, timer])

  // ─── REGISTER ────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(name, email, password)
      setStep('otp')
      setTimer(60)
      setCanResend(false)
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''

      if (status === 409) {
        setToast("Bu email allaqachon ro'yxatdan o'tgan")
      } else if (status === 400) {
        setToast(msg || "Ma'lumotlar noto'g'ri")
      } else {
        setToast(msg || 'Xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── VERIFY OTP ──────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await verifyOtp(email, otp)
      navigate('/', { replace: true })
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''

      if (status === 400 && msg.toLowerCase().includes('expired')) {
        setToast("OTP muddati o'tgan, qayta yuboring")
      } else if (status === 400) {
        setToast("Noto'g'ri OTP kod")
      } else {
        setToast(msg || 'Xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── RESEND OTP ───────────────────────────
  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await resendOtp(name, email, password)
      setTimer(60)
      setCanResend(false)
    } catch {
      setToast('Kod qayta yuborilmadi')
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
            <h1 className="text-[22px] font-semibold text-[#111] tracking-tight">
              {step === 'register' ? "Ro'yxatdan o'tish" : 'OTP tasdiqlash'}
            </h1>
            <p className="text-[13px] text-[#999] mt-1">
              {step === 'register'
                ? 'Yangi hisob yarating'
                : `${email} manziliga kod yuborildi`}
            </p>
          </div>

          {/* ─── REGISTER FORM ───────────── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">
                  Ism
                </label>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">
                  Email
                </label>
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
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">
                  Parol
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all duration-150"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-1 bg-[#111] hover:bg-[#222] text-white text-[14px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Tekshirilmoqda...
                  </span>
                ) : "Ro'yxatdan o'tish"}
              </button>
            </form>
          )}

          {/* ─── OTP FORM ───────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <input
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full px-3.5 py-2.5 text-center text-lg tracking-widest bg-[#F7F7F7] rounded-lg outline-none focus:bg-white border border-transparent focus:border-[#111] transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#111] hover:bg-[#222] text-white text-[14px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Tekshirilmoqda...
                  </span>
                ) : 'Tasdiqlash'}
              </button>

              {/* TIMER */}
              <div className="text-center text-[13px] text-[#999]">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#111] font-medium hover:underline disabled:opacity-40"
                  >
                    Qayta yuborish
                  </button>
                ) : (
                  <span>Qayta yuborish {timer}s</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full text-[13px] text-[#999] hover:underline"
              >
                Orqaga
              </button>
            </form>
          )}

          {/* ─── FOOTER ─────────────────── */}
          {step === 'register' && (
            <p className="text-[13px] text-[#999] mt-6">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="text-[#111] font-medium hover:underline underline-offset-2">
                Kirish
              </Link>
            </p>
          )}

        </div>
      </div>
    </>
  )
}