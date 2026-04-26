import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { Toast, ToastType } from '../types'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

const iconStyles: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()
  const Icon = icons[toast.type]
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up max-w-sm ${styles[toast.type]}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconStyles[toast.type]}`} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
