import type { Request, Response, NextFunction } from 'express'

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    const err = new Error('Forbidden')
    ;(err as any).status = 403
    throw err
  }
  next()
}

