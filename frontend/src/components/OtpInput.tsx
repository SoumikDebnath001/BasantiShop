import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  error?: string
}

export default function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(6, '').split('').slice(0, 6)

  const updateDigit = (index: number, digit: string) => {
    const arr = digits.slice()
    arr[index] = digit
    onChange(arr.join('').replace(/\s/g, ''))
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      updateDigit(index, '')
      return
    }
    // Handle paste of multiple digits into a single box
    if (raw.length > 1) {
      const merged = (value + raw).replace(/\D/g, '').slice(0, 6)
      onChange(merged)
      const nextIdx = Math.min(merged.length, 5)
      inputsRef.current[nextIdx]?.focus()
      return
    }
    updateDigit(index, raw)
    if (index < 5) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        updateDigit(index, '')
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus()
        updateDigit(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const nextIdx = Math.min(pasted.length, 5)
    inputsRef.current[nextIdx]?.focus()
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digits[i] === ' ' ? '' : digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all outline-none
              ${error
                ? 'border-red-400 bg-red-50 text-red-700'
                : digits[i] && digits[i] !== ' '
                  ? 'border-accent bg-amber-50 text-charcoal'
                  : 'border-border bg-white text-charcoal focus:border-accent focus:bg-amber-50/30'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
    </div>
  )
}
