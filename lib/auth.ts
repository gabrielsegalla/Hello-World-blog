import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
const SECRET = process.env.JWT_SECRET || 'segalla-secret-change-in-prod'
export const COOKIE = 'segalla_token'
export const signToken = (p: object) => jwt.sign(p, SECRET, { expiresIn: '7d' })
export const verifyToken = (t: string) => { try { return jwt.verify(t, SECRET) } catch { return null } }
export const isAuthenticated = () => { const t = cookies().get(COOKIE)?.value; return t ? !!verifyToken(t) : false }
