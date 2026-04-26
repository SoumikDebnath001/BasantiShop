import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { FormInput } from '../components/FormInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoginPayload } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export default function Login() {
  const { login, isLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/categories'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>()

  const onSubmit = async (data: LoginPayload) => {
    try {
      await login(data)
      showToast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Invalid email or password.'), 'error')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-charcoal rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Welcome back</h1>
          <p className="text-muted mt-2 text-sm">Sign in to Basanti Variety Store</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60 mt-2"
            >
              <LogIn size={16} />
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-charcoal font-medium hover:text-accent transition-colors">
                Register
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
