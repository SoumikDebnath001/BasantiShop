export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { error?: string } } }).response?.data
    if (data?.error && typeof data.error === 'string') return data.error
  }
  if (err instanceof Error) return err.message
  return fallback
}
