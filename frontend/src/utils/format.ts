export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)

export const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(date)
  )

export const truncate = (str: string, length: number): string =>
  str.length > length ? str.slice(0, length) + '…' : str

export const generateId = (): string => Math.random().toString(36).slice(2, 11)
