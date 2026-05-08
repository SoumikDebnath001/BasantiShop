import { useEffect, useState, useCallback } from 'react'
import { X, Download, Loader2, FileText, AlertCircle } from 'lucide-react'
import { orderService } from '../services/orderService'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'

interface InvoiceModalProps {
  orderId: string
  onClose: () => void
}

export default function InvoiceModal({ orderId, onClose }: InvoiceModalProps) {
  const { showToast } = useToast()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let url: string | null = null
    setLoading(true)
    setLoadError(false)

    orderService.getInvoiceBlobUrl(orderId)
      .then((u) => { url = u; setBlobUrl(u) })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))

    return () => { if (url) URL.revokeObjectURL(url) }
  }, [orderId])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      await orderService.downloadInvoice(orderId, `bill-${orderId.slice(-8).toUpperCase()}.pdf`)
      showToast('Bill downloaded.', 'success')
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Could not download bill.'), 'error')
    } finally {
      setDownloading(false)
    }
  }, [orderId, showToast])

  const shortId = orderId.slice(-8).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal sheet */}
      <div
        className="relative z-10 w-full md:max-w-3xl bg-white
          rounded-t-3xl md:rounded-2xl
          flex flex-col
          animate-sheet-up md:animate-slide-up"
        style={{ height: '92svh' }}
      >
        {/* Pill handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-accent" />
            <div>
              <p className="font-semibold text-charcoal text-sm leading-none">Bill #{shortId}</p>
              <p className="text-[11px] text-muted mt-0.5">Order receipt</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-charcoal text-white rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-cream text-muted hover:text-charcoal transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF area — scrollable */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm">Loading bill…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted px-6 text-center">
              <AlertCircle size={28} className="text-red-400" />
              <p className="font-medium text-charcoal">Could not load the bill</p>
              <p className="text-sm">Try downloading it directly instead.</p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
              >
                <Download size={15} />
                Download PDF
              </button>
            </div>
          ) : (
            <iframe
              src={blobUrl!}
              title={`Bill ${shortId}`}
              className="w-full h-full min-h-[600px] border-none"
            />
          )}
        </div>
      </div>
    </div>
  )
}
