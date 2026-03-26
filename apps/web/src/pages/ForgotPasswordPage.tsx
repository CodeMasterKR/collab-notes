import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/axios'
import Logo from '../components/Logo'

type Step = 'email' | 'otp' | 'newPassword'

function Toast({ message, type = 'error', onClose }: {
  message: string
  type?: 'error' | 'success'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#111] text-white text-[13px] px-4 py-2.5 rounded-xl shadow-lg">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5"
          stroke={type === 'success' ? '#4ade80' : '#f87171'}
          strokeWidth="1.4"
        />
        {type === 'success'
          ? <path d="M4.5 7.5l2 2 4-4" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M7.5 4.5v3M7.5 10h.01" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
        }
      </svg>
      {message}
      <button onClick={onClose} className="ml-1 text-white/50 hover:text-white">✕</button>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)

  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const navigate = useNavigate()

  // ─── TIMER ───────────────────────────────
  useEffect(() => {
    if (step !== 'otp') return
    if (timer === 0) { setCanResend(true); return }
    const interval = setInterval(() => setTimer(p => p - 1), 1000)
    return () => clearInterval(interval)
  }, [step, timer])

  // ─── 1. EMAIL YUBORISH ───────────────────
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setStep('otp')
      setTimer(60)
      setCanResend(false)
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''
      if (status === 400 || status === 404) {
        setToast({ message: "Bu email ro'yxatdan o'tmagan", type: 'error' })
      } else {
        setToast({ message: msg || 'Xatolik yuz berdi', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── 2. OTP KIRITISH → newPassword stepga o'tish ─────
  const handleCheckOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) {
      setToast({ message: "OTP kodni to'liq kiriting", type: 'error' })
      return
    }
    setStep('newPassword')
  }

  // ─── 3. YANGI PAROL + OTP → /auth/reset-password ────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Parollar mos kelmadi', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setToast({ message: "Parol kamida 6 ta belgi bo'lishi kerak", type: 'error' })
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      setToast({ message: 'Parol muvaffaqiyatli yangilandi!', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''
      if (status === 400 && msg.toLowerCase().includes('invalid')) {
        setToast({ message: "Noto'g'ri OTP kod", type: 'error' })
        setStep('otp')
        setOtp('')
      } else if (status === 400 && msg.toLowerCase().includes('expired')) {
        setToast({ message: "OTP muddati o'tgan, qayta yuboring", type: 'error' })
        setStep('otp')
        setOtp('')
      } else {
        setToast({ message: msg || 'Xatolik yuz berdi', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── RESEND ──────────────────────────────
  const handleResend = async () => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setTimer(60)
      setCanResend(false)
      setOtp('')
    } catch {
      setToast({ message: 'Kod qayta yuborilmadi', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const stepTitles: Record<Step, { title: string; sub: string }> = {
    email:       { title: 'Parolni tiklash',  sub: 'Emailingizga tasdiqlash kodi yuboramiz' },
    otp:         { title: 'OTP tasdiqlash',    sub: `${email} manziliga kod yuborildi` },
    newPassword: { title: 'Yangi parol',       sub: 'Yangi parolni kiriting' },
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-90">

          {/* ─── HEADER ───────────────────── */}
          <div className="mb-10">
            <div className="mb-6"><Logo /></div>
            <h1 className="text-[22px] font-semibold text-[#111] tracking-tight">
              {stepTitles[step].title}
            </h1>
            <p className="text-[13px] text-[#999] mt-1">
              {stepTitles[step].sub}
            </p>
          </div>

          {/* ─── STEP 1: EMAIL ────────────── */}
          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="sizning@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all"
                />
              </div>
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
                    Yuborilmoqda...
                  </span>
                ) : 'Kod yuborish'}
              </button>

              <p className="text-[13px] text-[#999] mt-2">
                Esladingizmi?{' '}
                <Link to="/login" className="text-[#111] font-medium hover:underline underline-offset-2">
                  Kirish
                </Link>
              </p>
            </form>
          )}

          {/* ─── STEP 2: OTP ──────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleCheckOtp} className="space-y-3">
              <input
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                className="w-full px-3.5 py-2.5 text-center text-lg tracking-widest bg-[#F7F7F7] rounded-lg outline-none focus:bg-white border border-transparent focus:border-[#111] transition-all"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#111] hover:bg-[#222] text-white text-[14px] font-medium rounded-lg transition-all"
              >
                Davom etish
              </button>

              <div className="text-center text-[13px] text-[#999]">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
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
                onClick={() => setStep('email')}
                className="w-full text-[13px] text-[#999] hover:underline"
              >
                Orqaga
              </button>
            </form>
          )}

          {/* ─── STEP 3: YANGI PAROL ──────── */}
          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">Yangi parol</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all"
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

              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-1.5">Parolni tasdiqlang</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-[14px] bg-[#F7F7F7] border border-transparent rounded-lg text-[#111] placeholder:text-[#bbb] outline-none focus:bg-white focus:border-[#111] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#111] hover:bg-[#222] text-white text-[14px] font-medium rounded-lg transition-all disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Saqlanmoqda...
                  </span>
                ) : 'Parolni saqlash'}
              </button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                className="w-full text-[13px] text-[#999] hover:underline"
              >
                Orqaga
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  )
}