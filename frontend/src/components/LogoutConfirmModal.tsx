import { useEffect } from 'react'
import { LogOut, X } from 'lucide-react'

interface LogoutConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutConfirmModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-hidden />

      <div className="relative z-10 w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-2xl shadow-sheet animate-sheet-up md:animate-slide-up">
        {/* Pill handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* Close */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-muted hover:bg-gray-100 hover:text-charcoal transition-colors"
            aria-label="Cancel"
          >
            <X size={17} />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <LogOut size={22} className="text-red-500" />
          </div>

          <h2 className="font-display text-lg font-semibold text-charcoal mb-1">Sign out?</h2>
          <p className="text-sm text-muted mb-6">You'll need to sign in again to access your account.</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-charcoal hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
