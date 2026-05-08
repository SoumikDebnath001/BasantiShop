import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Mail, RefreshCw, Lock, ShieldCheck } from 'lucide-react'
import { FormInput } from '../components/FormInput'
import OtpInput from '../components/OtpInput'
import { authService } from '../services/authService'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'
import { SHOP_NAME } from '../constants/brand'
//@ts-ignore
import logo from '../assets/logo.png'

type Step = 'email' | 'otp'

interface ResetForm {
  newPassword: string
  confirmPassword: string
}

export default function ForgotPassword() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const newPassword = watch('newPassword')

  const startResendCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const onSendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setStep('otp')
      startResendCooldown()
      showToast('OTP sent! Check your email.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to send OTP.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      startResendCooldown()
      showToast('New OTP sent!', 'success')
    } catch {
      showToast('Could not resend OTP.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onReset = async (data: ResetForm) => {
    if (otp.length < 6) { setOtpError('Please enter the 6-digit OTP'); return }
    setOtpError('')
    setLoading(true)
    try {
      await authService.resetPassword({ email, otp, newPassword: data.newPassword })
      showToast('Password reset successfully! Please sign in.', 'success')
      navigate('/login')
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Invalid or expired OTP.'))
    } finally {
      setLoading(false)
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
          <div className="w-14 h-14 bg-charcoal rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-1">Forgot password?</h1>
          <p className="text-muted text-sm">
            {step === 'email'
              ? "Enter your email and we'll send a reset code."
              : `Enter the code sent to ${email} and set a new password.`}
          </p>
        </div>

        {/* Step: email */}
        {step === 'email' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-charcoal">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendOtp()}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full px-4 py-4 border border-border rounded-2xl text-charcoal placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
            >
              <Mail size={17} />
              {loading ? 'Sending…' : 'Send Reset Code'}
            </button>
          </div>
        )}

        {/* Step: OTP + new password */}
        {step === 'otp' && (
          <form onSubmit={handleSubmit(onReset)} className="space-y-5">
            <div className="text-center p-4 bg-accent/5 rounded-2xl border border-accent/20">
              <ShieldCheck size={20} className="text-accent mx-auto mb-1" />
              <p className="text-sm text-charcoal font-medium">Check your inbox</p>
              <p className="text-xs text-muted mt-0.5">Code sent to {email}</p>
            </div>

            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={otpError} />

            <FormInput
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              required
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            <FormInput
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              required
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === newPassword || 'Passwords do not match',
              })}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setOtpError('') }}
                className="flex items-center gap-1 text-muted hover:text-charcoal transition-colors"
              >
                <ArrowLeft size={14} />
                Change email
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1 text-accent hover:text-accent-dark transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
              </button>
            </div>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
