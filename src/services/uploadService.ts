import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

export async function uploadProductImages(files: File[]): Promise<string[]> {
  if (!files.length) return []
  const token = localStorage.getItem('token')
  const form = new FormData()
  for (const f of files) {
    form.append('images', f)
  }
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_IMAGES}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = new Error('Image upload failed')
    ;(err as any).status = res.status
    throw err
  }
  const data = (await res.json()) as { urls: string[] }
  return data.urls
}
