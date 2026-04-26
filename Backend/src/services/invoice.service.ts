import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import { Prisma } from '@prisma/client'
import { INVOICE_SHOP } from '../config/invoice.js'

/** Minimal typing for pdfkit document (library surface used below). */
type PdfDoc = {
  pipe: (s: NodeJS.WritableStream) => void
  fontSize: (n: number) => PdfDoc
  text: (...args: unknown[]) => PdfDoc
  moveDown: (n?: number) => PdfDoc
  moveTo: (x: number, y: number) => PdfDoc
  lineTo: (x: number, y: number) => PdfDoc
  stroke: (color?: string) => PdfDoc
  fillColor: (color: string) => PdfDoc
  end: () => void
  y: number
}

function invoicesDir() {
  return path.join(process.cwd(), 'uploads', 'invoices')
}

export type InvoiceOrderInput = {
  id: string
  createdAt: Date
  user: { name: string; email: string }
  items: { name: string; quantity: number; price: Prisma.Decimal }[]
  displayTotal: number
}

/**
 * Writes invoice PDF under uploads/invoices/{orderId}.pdf.
 * @returns Relative path for DB: `invoices/{orderId}.pdf`
 */
export async function generateOrderInvoicePdf(order: InvoiceOrderInput): Promise<string> {
  const dir = invoicesDir()
  fs.mkdirSync(dir, { recursive: true })
  const filename = `${order.id}.pdf`
  const absPath = path.join(dir, filename)

  const doc = new PDFDocument({ margin: 50, size: 'A4' }) as unknown as PdfDoc
  const stream = fs.createWriteStream(absPath)

  await new Promise<void>((resolve, reject) => {
    stream.on('error', reject)
    doc.pipe(stream)

    doc.fontSize(18).text(INVOICE_SHOP.name, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#444').text(INVOICE_SHOP.address, { align: 'center' })
    doc.text(`Phone: ${INVOICE_SHOP.phone}`, { align: 'center' })
    doc.moveDown(1.5)
    doc.fillColor('#000')

    doc.fontSize(14).text('INVOICE', { underline: true })
    doc.moveDown(0.75)
    doc.fontSize(11)
    doc.text(`Customer: ${order.user.name}`)
    doc.text(`Email: ${order.user.email}`)
    doc.text(`Order ID: ${order.id}`)
    doc.text(
      `Date: ${order.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
    )
    doc.moveDown(1)

    doc.fontSize(12).text('Order details', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(10)

    let y = doc.y
    const rowH = 18
    doc.text('Product', 50, y)
    doc.text('Qty', 320, y)
    doc.text('Price', 380, y)
    doc.text('Line', 460, y)
    y += rowH
    doc.moveTo(50, y).lineTo(545, y).stroke('#ccc')
    y += 8

    for (const line of order.items) {
      const unit = Number(line.price)
      const lineTotal = unit * line.quantity
      doc.text(line.name.slice(0, 45), 50, y, { width: 250 })
      doc.text(String(line.quantity), 320, y)
      doc.text(unit.toFixed(2), 380, y)
      doc.text(lineTotal.toFixed(2), 460, y)
      y += rowH + 4
    }

    doc.moveDown(1)
    doc.fontSize(12).text(`Total amount: ₹${order.displayTotal.toFixed(2)}`, { align: 'right' })
    doc.moveDown(0.75)
    doc.fontSize(11).fillColor('#0a5').text('Status: Delivered', { align: 'left' })
    doc.fillColor('#000')
    doc.moveDown(2)
    doc.fontSize(10).fillColor('#666').text('Thank you for your purchase!', { align: 'center' })

    doc.end()
    stream.on('finish', () => resolve())
  })

  return `invoices/${filename}`
}

/** Absolute path for a DB-stored relative path like invoices/xxx.pdf */
export function resolveInvoiceAbsolutePath(storedRelative: string): string {
  const normalized = storedRelative.replace(/^[/\\]+/, '')
  const full = path.resolve(process.cwd(), 'uploads', normalized)
  const uploadsRoot = path.resolve(process.cwd(), 'uploads')
  if (!full.startsWith(uploadsRoot + path.sep) && full !== uploadsRoot) {
    const err = new Error('Invalid invoice path')
    ;(err as any).status = 400
    throw err
  }
  return full
}
