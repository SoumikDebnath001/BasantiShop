import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!isOpen) return null

  const desktopWidths = { sm: 'md:max-w-sm', md: 'md:max-w-lg', lg: 'md:max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div
        className={`relative bg-white w-full ${desktopWidths[size]}
          rounded-t-3xl md:rounded-2xl shadow-sheet
          animate-sheet-up md:animate-slide-up
          max-h-[92vh] flex flex-col`}
      >
        {/* Handle pill — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border shrink-0">
          {title && (
            <h2 className="font-display text-lg md:text-xl font-semibold text-charcoal">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors text-muted hover:text-charcoal"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
