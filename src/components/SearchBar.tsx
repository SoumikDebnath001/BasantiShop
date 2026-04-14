import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search products…', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
