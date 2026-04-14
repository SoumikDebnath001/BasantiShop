import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
  }

  const status = typeof (err as any)?.status === 'number' ? (err as any).status : 500
  const message =
    status === 500 ? 'Internal Server Error' : (err as any)?.message || 'Error'

  if (status === 204) return res.status(204).end()
  res.status(status).json({ error: message })
}

