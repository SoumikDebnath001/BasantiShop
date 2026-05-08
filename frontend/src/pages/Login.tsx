import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LogIn, KeyRound, Mail, RefreshCw, ArrowRight } from 'lucide-react'
import { FormInput } from '../components/FormInput'
import OtpInput from '../components/OtpInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/authService'
import { getApiErrorMessage } from '../utils/apiError'
import { SHOP_NAME } from '../constants/brand'
//@ts-ignore
import logo from '../assets/logo.png'

type Tab = 'password' | 'otp'
type OtpPhase = 'email' | 'verify'

export default function Login() {
  const { login, setAuthFromResponse } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/categories'

  const [tab, setTab] = useState<Tab>('password')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()

  const [otpPhase, setOtpPhase] = useState<OtpPhase>('email')
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const startResendCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const onPasswordLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      await login(data)
      showToast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Invalid email or password.'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const onSendOtp = async () => {
    if (!otpEmail || !/^\S+@\S+\.\S+$/.test(otpEmail)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    setIsLoading(true)
    try {
      await authService.loginSendOtp(otpEmail)
      setOtpPhase('verify')
      startResendCooldown()
      showToast('OTP sent! Check your email.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to send OTP.'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOtp = async () => {
    if (otp.length < 6) { setOtpError('Please enter the 6-digit OTP'); return }
    setOtpError('')
    setIsLoading(true)
    try {
      const result = await authService.loginVerifyOtp({ email: otpEmail, otp })
      setAuthFromResponse(result)
      showToast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Invalid or expired OTP.'))
    } finally {
      setIsLoading(false)
    }
  }

  const onResendOtp = async () => {
    if (resendCooldown > 0) return
    setIsLoading(true)
    try {
      await authService.loginSendOtp(otpEmail)
      startResendCooldown()
      showToast('New OTP sent!', 'success')
    } catch {
      showToast('Could not resend OTP.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col md:items-center md:justify-center px-4 py-8 md:py-16 animate-fade-in">
      <div className="w-full max-w-sm mx-auto">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <img src={logo} alt={SHOP_NAME} className="w-10 h-10 object-contain" />
            <span className="font-display text-lg font-semibold text-charcoal">{SHOP_NAME}</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-1">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to your account</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-cream rounded-2xl p-1 mb-5 border border-border">
          {([
            { id: 'password' as Tab, label: 'Password', icon: KeyRound },
            { id: 'otp' as Tab, label: 'Email OTP', icon: Mail },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setOtp(''); setOtpError(''); setOtpPhase('email') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
                ${tab === id ? 'bg-white text-charcoal shadow-card' : 'text-muted hover:text-charcoal'}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Password login */}
        {tab === 'password' && (
          <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
            <FormInput
              label="Email"
              type="email"
              placeholder="name@gmail.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            <div>
              <FormInput
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-dark transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
            >
              <LogIn size={17} />
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* OTP login */}
        {tab === 'otp' && (
          <div className="space-y-4">
            {otpPhase === 'email' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-charcoal">Email</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSendOtp()}
                    placeholder="name@gmail.com"
                    autoComplete="email"
                    className="w-full px-4 py-4 border border-border rounded-2xl text-charcoal placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={onSendOtp}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
                >
                  <Mail size={17} />
                  {isLoading ? 'Sending…' : 'Send OTP'}
                </button>
              </>
            )}

            {otpPhase === 'verify' && (
              <div className="space-y-5">
                <div className="text-center p-4 bg-accent/5 rounded-2xl border border-accent/20">
                  <p className="text-sm text-charcoal">Code sent to</p>
                  <p className="font-semibold text-charcoal">{otpEmail}</p>
                </div>

                <OtpInput value={otp} onChange={setOtp} disabled={isLoading} error={otpError} />

                <button
                  type="button"
                  onClick={onVerifyOtp}
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
                >
                  {isLoading ? 'Verifying…' : 'Sign In'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setOtpPhase('email'); setOtp(''); setOtpError('') }}
                    className="text-muted hover:text-charcoal transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className="flex items-center gap-1 text-accent hover:text-accent-dark transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer link */}
        <p className="text-center text-sm text-muted mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-charcoal font-semibold hover:text-accent transition-colors inline-flex items-center gap-1">
            Create one <ArrowRight size={13} />
          </Link>
        </p>
      </div>
    </div>
  )
}
