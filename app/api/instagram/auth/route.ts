import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getInstagramOAuthUrl } from '@/lib/instagram'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const state = crypto.randomUUID()
    const response = NextResponse.json({ url: getInstagramOAuthUrl(state) })
    response.cookies.set('ig_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao iniciar OAuth' },
      { status: 500 }
    )
  }
}
