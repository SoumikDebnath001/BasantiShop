import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { UserPlus, ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { FormInput } from '../components/FormInput'
import OtpInput from '../components/OtpInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/authService'
import { getApiErrorMessage } from '../utils/apiError'
import type { RegisterPayload } from '../types'
import { SHOP_NAME } from '../constants/brand'
//@ts-ignore
import logo from '../assets/logo.png'

type Step = 'form' | 'otp'

export default function Register() {
  const { setAuthFromResponse } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingName, setPendingName] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterPayload & { confirmPassword: string }>()
  const password = watch('password')

  const startResendCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const onSubmitForm = async (data: RegisterPayload & { confirmPassword: string }) => {
    setLoading(true)
    try {
      const { confirmPassword: _, ...payload } = data
      await authService.registerInitiate(payload)
      setPendingEmail(payload.email)
      setPendingName(payload.name)
      setStep('otp')
      startResendCooldown()
      showToast('OTP sent to your email!', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Registration failed. Please try again.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const onVerifyOtp = async () => {
    if (otp.length < 6) { setOtpError('Please enter the 6-digit OTP'); return }
    setOtpError('')
    setLoading(true)
    try {
      const result = await authService.registerVerify({ email: pendingEmail, otp })
      setAuthFromResponse(result)
      showToast(`Welcome to ${SHOP_NAME}, ${pendingName}!`, 'success')
      navigate('/categories', { replace: true })
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      await authService.registerInitiate({ name: pendingName, email: pendingEmail, password: '' })
      startResendCooldown()
      showToast('New OTP sent!', 'success')
    } catch {
      showToast('Could not resend OTP. Please try again.', 'error')
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
          {step === 'form' ? (
            <>
              <h1 className="font-display text-3xl font-bold text-charcoal mb-1">Create account</h1>
              <p className="text-muted text-sm">Join {SHOP_NAME} today</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-charcoal mb-1">Verify email</h1>
              <p className="text-muted text-sm">
                We sent a code to <span className="text-charcoal font-medium">{pendingEmail}</span>
              </p>
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['form', 'otp'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${step === s
                    ? 'bg-charcoal text-white ring-4 ring-charcoal/10'
                    : i < (['form', 'otp'] as Step[]).indexOf(step)
                      ? 'bg-accent text-white'
                      : 'bg-border text-muted'
                  }`}
              >
                {i < (['form', 'otp'] as Step[]).indexOf(step) ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-charcoal' : 'text-muted'}`}>
                {s === 'form' ? 'Your details' : 'Verify email'}
              </span>
              {i < 1 && (
                <div className={`h-px flex-1 transition-colors ${i < (['form', 'otp'] as Step[]).indexOf(step) ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step: form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <FormInput
              label="Full Name"
              placeholder="Your full name"
              required
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            <FormInput
              label="Email"
              type="email"
              placeholder="email@example.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            <FormInput
              label="Phone (optional)"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              required
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              required
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px] mt-2"
            >
              <UserPlus size={17} />
              {loading ? 'Sending OTP…' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mx-auto">
              <Mail size={26} className="text-accent" />
            </div>

            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={otpError} />

            <button
              type="button"
              onClick={onVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
            >
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setOtpError('') }}
                className="flex items-center gap-1 text-muted hover:text-charcoal transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1 text-accent hover:text-accent-dark transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Footer link */}
        {step === 'form' && (
          <p className="text-center text-sm text-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-charcoal font-semibold hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
