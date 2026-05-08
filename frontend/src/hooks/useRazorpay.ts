import { useCallback, useRef } from 'react'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') return resolve(true)

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function useRazorpay() {
  const rzpRef = useRef<RazorpayInstance | null>(null)

  const openCheckout = useCallback(
    (
      options: RazorpayOptions,
      onDismiss?: () => void
    ): Promise<void> =>
      new Promise(async (resolve, reject) => {
        const loaded = await loadScript()
        if (!loaded) return reject(new Error('Failed to load Razorpay checkout. Check your internet connection.'))

        const opts: RazorpayOptions = {
          ...options,
          modal: {
            ...options.modal,
            ondismiss: () => {
              onDismiss?.()
              resolve()
            },
          },
          handler: (response) => {
            options.handler(response)
            resolve()
          },
        }

        rzpRef.current = new window.Razorpay(opts)
        rzpRef.current?.open()
      }),
    []
  )

  return { openCheckout }
}
