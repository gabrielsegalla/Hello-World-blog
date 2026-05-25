import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const account = await prisma.instagramAccount.findFirst({
    orderBy: { connectedAt: 'desc' },
    select: {
      id: true,
      username: true,
      pageName: true,
      igUserId: true,
      connectedAt: true,
      tokenExpiresAt: true,
    },
  })

  return NextResponse.json({
    connected: !!account,
    account,
    metaConfigured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  })
}
