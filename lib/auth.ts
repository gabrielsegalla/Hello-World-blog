import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const COOKIE = 'segalla_token'

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'segalla-secret-change-in-prod')
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  const token = cookies().get(COOKIE)?.value
  if (!token) return false
  return !!(await verifyToken(token))
}
