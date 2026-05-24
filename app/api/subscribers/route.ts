import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { sendNewsletterEmail, buildWelcomeHtml, FROM } from '@/lib/resend'

// POST /api/subscribers - public subscribe
export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const existing = await prisma.subscriber.findUnique({ where: { email } })
  if (existing) {
    if (!existing.active) {
      await prisma.subscriber.update({ where: { email }, data: { active: true } })
      return NextResponse.json({ ok: true, message: 'Inscrição reativada!' })
    }
    return NextResponse.json({ error: 'Este email já está inscrito.' }, { status: 409 })
  }

  await prisma.subscriber.create({ data: { email, name } })

  // Send welcome email
  try {
    const html = buildWelcomeHtml(name).replace(/\{\{email\}\}/g, encodeURIComponent(email))
    await sendNewsletterEmail(email, 'Bem-vindo à newsletter segalla.dev! 🚀', html)
  } catch (err) {
    console.error('Welcome email failed:', err)
  }

  return NextResponse.json({ ok: true })
}

// GET /api/subscribers - admin only
export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(subscribers)
}
