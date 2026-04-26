declare module 'pdfkit' {
  const PDFDocument: new (options?: object) => import('stream').Duplex & {
    pipe: (dest: NodeJS.WritableStream) => unknown
    fontSize: (n: number) => unknown
    text: (...args: unknown[]) => unknown
    moveDown: (n?: number) => unknown
    moveTo: (x: number, y: number) => unknown
    lineTo: (x: number, y: number) => unknown
    stroke: (color?: string) => unknown
    fillColor: (color: string) => unknown
    end: () => void
  }
  export default PDFDocument
}
