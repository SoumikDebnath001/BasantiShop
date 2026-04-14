import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type JwtUser } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    const err = new Error('Unauthorized')
    ;(err as any).status = 401
    throw err
  }

  const token = header.slice('Bearer '.length).trim()
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    const err = new Error('Unauthorized')
    ;(err as any).status = 401
    throw err
  }
}

