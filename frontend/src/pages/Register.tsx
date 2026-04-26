import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { FormInput } from '../components/FormInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RegisterPayload } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export default function Register() {
  const { register: registerUser, isLoading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterPayload & { confirmPassword: string }>()
  const password = watch('password')

  const onSubmit = async (data: RegisterPayload & { confirmPassword: string }) => {
    try {
      const { confirmPassword: _, ...payload } = data
      await registerUser(payload)
      showToast('Account created successfully!', 'success')
      navigate('/categories')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Registration failed. Please try again.'), 'error')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-charcoal rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Create account</h1>
          <p className="text-muted mt-2 text-sm">Join Basanti Variety Store</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Full Name"
              placeholder="Full name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            <FormInput
              label="Email"
              type="email"
              placeholder="email@gmail.com"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            <FormInput
              label="Phone"
              placeholder="10 digit Indian"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60 mt-2"
            >
              <UserPlus size={16} />
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-charcoal font-medium hover:text-accent transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
