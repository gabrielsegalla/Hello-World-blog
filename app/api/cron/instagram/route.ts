import { NextRequest, NextResponse } from 'next/server'
import { publishDueCarousels } from '@/lib/instagram-carousel'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const results = await publishDueCarousels()
  return NextResponse.json({ ok: true, results })
}
