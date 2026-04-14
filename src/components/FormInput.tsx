import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?: number
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-charcoal">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none transition-all
          focus:border-accent focus:ring-2 focus:ring-accent/10
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-border'}
          ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
FormInput.displayName = 'FormInput'

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, rows = 4, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-charcoal">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none transition-all resize-none
          focus:border-accent focus:ring-2 focus:ring-accent/10
          ${error ? 'border-red-300' : 'border-border'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
FormTextarea.displayName = 'FormTextarea'
