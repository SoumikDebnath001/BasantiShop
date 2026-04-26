import { useEffect } from 'react'

type SeoProps = {
  title: string
  description?: string
}

export default function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    const base = 'Luxe'
    document.title = title.includes(base) ? title : `${title} · ${base}`

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    if (description) {
      meta.content = description
    }
  }, [title, description])

  return null
}
