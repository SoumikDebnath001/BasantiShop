import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type JwtUser = {
  id: string
  role: 'admin' | 'customer'
}

export function signAccessToken(payload: JwtUser): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JwtUser {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser
}

