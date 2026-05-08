import { useEffect, useState, useCallback, useMemo } from 'react'
import { Mail, Loader2, Send, User, Search, Clock, CheckCircle2, X } from 'lucide-react'
import { adminContactService, type AdminContactMessage } from '../services/adminContactService'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'

type Tab = 'pending' | 'resolved'

export default function AdminContactMessages() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<AdminContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<Tab>('pending')
  const [emailSearch, setEmailSearch] = useState('')

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

  useEffect(() => { void load() }, [load])

  const pending = useMemo(
    () => rows.filter((r) => !r.response),
    [rows]
  )
  const resolved = useMemo(
    () => rows.filter((r) => !!r.response),
    [rows]
  )

  const filteredPending = useMemo(() => {
    const q = emailSearch.trim().toLowerCase()
    if (!q) return pending
    return pending.filter((r) => r.email.toLowerCase().includes(q))
  }, [pending, emailSearch])

  const saveResponse = async (id: string) => {
    const text = (drafts[id] ?? '').trim()
    if (!text) {
      showToast('Enter a reply before saving.', 'warning')
      return
    }
    setSavingId(id)
    try {
      await adminContactService.saveResponse(id, text)
      showToast('Reply sent — message moved to Resolved.', 'success')
      await load()
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Could not save reply'), 'error')
    } finally {
      setSavingId(null)
    }
  }

  const tabs: { key: Tab; label: string; count: number; icon: typeof Clock }[] = [
    { key: 'pending', label: 'Pending Reply', count: pending.length, icon: Clock },
    { key: 'resolved', label: 'Resolved', count: resolved.length, icon: CheckCircle2 },
  ]

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Mail size={24} className="text-accent" />
          Contact Messages
        </h1>
        <p className="text-muted text-sm mt-1">
          Messages from the contact form. Reply to move them to Resolved.
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-cream border border-border rounded-2xl p-1 mb-6 w-fit">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-charcoal shadow-sm border border-border/60'
                : 'text-muted hover:text-charcoal'
            }`}
          >
            <Icon size={15} className={tab === key ? (key === 'pending' ? 'text-amber-500' : 'text-emerald-500') : ''} />
            {label}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              tab === key
                ? key === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
                : 'bg-border text-muted'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-12">
          <Loader2 className="animate-spin" size={22} />
          Loading messages…
        </div>
      ) : tab === 'pending' ? (
        <PendingSection
          messages={filteredPending}
          total={pending.length}
          emailSearch={emailSearch}
          setEmailSearch={setEmailSearch}
          drafts={drafts}
          setDrafts={setDrafts}
          savingId={savingId}
          onSave={saveResponse}
        />
      ) : (
        <ResolvedSection messages={resolved} />
      )}
    </div>
  )
}

/* ── Pending section ── */
function PendingSection({
  messages,
  total,
  emailSearch,
  setEmailSearch,
  drafts,
  setDrafts,
  savingId,
  onSave,
}: {
  messages: AdminContactMessage[]
  total: number
  emailSearch: string
  setEmailSearch: (v: string) => void
  drafts: Record<string, string>
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  savingId: string | null
  onSave: (id: string) => void
}) {
  return (
    <div>
      {/* Email search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="email"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          placeholder="Search by email…"
          className="w-full pl-9 pr-9 py-2.5 border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white"
        />
        {emailSearch && (
          <button
            type="button"
            onClick={() => setEmailSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />}
          title="All caught up!"
          sub="No messages waiting for a reply."
        />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<Search size={32} className="text-muted mx-auto mb-3" />}
          title="No results"
          sub={`No pending messages match "${emailSearch}".`}
        />
      ) : (
        <div className="space-y-5">
          {messages.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-border p-5 md:p-6 shadow-sm hover:border-amber-300/60 transition-colors"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <p className="font-semibold text-charcoal">{r.name}</p>
                  <p className="text-xs text-muted mt-0.5">{r.email} · {r.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock size={11} />
                    Pending
                  </span>
                  <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                </div>
              </div>

              {r.productName && (
                <p className="text-sm text-charcoal mb-2">
                  <span className="text-muted">Regarding:</span> {r.productName}
                </p>
              )}

              {r.user && (
                <div className="flex items-center gap-2 text-xs text-muted mb-3 bg-cream/80 rounded-lg px-3 py-2 w-fit">
                  <User size={13} />
                  Account: {r.user.name} ({r.user.email})
                </div>
              )}

              <div className="rounded-xl bg-cream/60 border border-border/80 p-4 mb-4">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">Message</p>
                <p className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">{r.message}</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">
                  Your reply
                </label>
                <textarea
                  value={drafts[r.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  rows={3}
                  placeholder="Type a reply…"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-y min-h-[90px]"
                />
                <button
                  type="button"
                  disabled={savingId === r.id}
                  onClick={() => onSave(r.id)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {savingId === r.id ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Send reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Resolved section ── */
function ResolvedSection({ messages }: { messages: AdminContactMessage[] }) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<Mail size={32} className="text-muted mx-auto mb-3" />}
        title="No resolved messages"
        sub="Replied messages will appear here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-2xl border border-border px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:border-emerald-300/50 transition-colors"
        >
          <div className="flex items-center gap-2 sm:w-40 shrink-0">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-emerald-700 text-xs font-bold">{r.name[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">{r.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 size={10} />
                Resolved
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-0.5">Message</p>
              <p className="text-sm text-charcoal line-clamp-2 leading-relaxed">{r.message}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">Your reply</p>
              <p className="text-sm text-charcoal leading-relaxed line-clamp-2">{r.response}</p>
            </div>
            <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Shared empty state ── */
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-12 text-center">
      {icon}
      <p className="text-charcoal font-medium">{title}</p>
      <p className="text-sm text-muted mt-1">{sub}</p>
    </div>
  )
}
