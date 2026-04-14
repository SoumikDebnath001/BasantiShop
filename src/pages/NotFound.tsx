import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-charcoal/10 mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-3">Page not found</h1>
        <p className="text-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-xl font-medium hover:bg-accent transition-colors"
        >
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    </div>
  )
}
