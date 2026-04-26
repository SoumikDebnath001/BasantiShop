import { useEffect, useState, useCallback } from 'react'
import { Mail, Loader2, Send, User } from 'lucide-react'
import { adminContactService, type AdminContactMessage } from '../services/adminContactService'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'

export default function AdminContactMessages() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<AdminContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminContactService.listAll()
      setRows(data)
      const next: Record<string, string> = {}
      for (const r of data) {
        next[r.id] = r.response ?? ''
      }
      setDrafts(next)
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to load messages'), 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const saveResponse = async (id: string) => {
    const text = (drafts[id] ?? '').trim()
    if (!text) {
      showToast('Enter a reply before saving.', 'warning')
      return
    }
    setSavingId(id)
    try {
      await adminContactService.saveResponse(id, text)
      showToast('Reply saved.', 'success')
      await load()
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Could not save reply'), 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Mail size={24} className="text-accent" />
          Contact messages
        </h1>
        <p className="text-muted text-sm mt-1">
          Messages sent from the public contact form and product enquiries. Reply here — customers see replies in their
          dashboard.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-12">
          <Loader2 className="animate-spin" size={22} />
          Loading messages…
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Mail size={32} className="text-muted mx-auto mb-3" />
          <p className="text-charcoal font-medium">No messages yet</p>
          <p className="text-sm text-muted mt-1">Submissions will appear here when customers use the contact page.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:border-accent/25 transition-colors"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <p className="font-semibold text-charcoal">{r.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {r.email} · {r.phone}
                  </p>
                </div>
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>

              {r.productName && (
                <p className="text-sm text-charcoal mb-2">
                  <span className="text-muted">Regarding:</span> {r.productName}
                </p>
              )}

              {r.user && (
                <div className="flex items-center gap-2 text-xs text-muted mb-3 bg-cream/80 rounded-lg px-3 py-2 w-fit">
                  <User size={14} />
                  Logged-in account: {r.user.name} ({r.user.email})
                </div>
              )}

              <div className="rounded-xl bg-cream/60 border border-border/80 p-4 mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Message</p>
                <p className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">{r.message}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                  Your reply (visible to customer)
                </label>
                <textarea
                  value={drafts[r.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  rows={4}
                  placeholder="Type a reply…"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-y min-h-[100px]"
                />
                <button
                  type="button"
                  disabled={savingId === r.id}
                  onClick={() => saveResponse(r.id)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {savingId === r.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {r.response ? 'Update reply' : 'Send reply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
