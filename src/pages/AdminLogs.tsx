import { useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { adminLogService } from '../services/adminLogService'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import type { AdminLogEntry } from '../types'

export default function AdminLogs() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<AdminLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminLogService
      .list(150)
      .then(setRows)
      .catch((e) => {
        showToast(getApiErrorMessage(e, 'Failed to load logs'), 'error')
        setRows([])
      })
      .finally(() => setLoading(false))
  }, [showToast])

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Activity log</h1>
        <p className="text-muted text-sm mt-0.5">Recent admin actions</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ScrollText size={28} className="text-muted mx-auto mb-2" />
          <p className="text-charcoal font-medium">No log entries</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50 text-left text-xs text-muted uppercase">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-muted whitespace-nowrap align-top">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-charcoal">{r.admin.name}</span>
                      <br />
                      <span className="text-xs text-muted">{r.admin.email}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal align-top">{r.action}</td>
                    <td className="px-4 py-3 text-xs text-muted font-mono align-top max-w-md break-all">
                      {JSON.stringify(r.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
