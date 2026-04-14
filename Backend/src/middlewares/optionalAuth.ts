import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type JwtUser } from '../utils/jwt.js'

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next()
  }
  const token = header.slice('Bearer '.length).trim()
  try {
    req.user = verifyAccessToken(token) as JwtUser
  } catch {
    // invalid token: proceed without user
  }
  next()
}
