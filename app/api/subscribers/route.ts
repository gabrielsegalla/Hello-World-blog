import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { sendNewsletterEmail, buildWelcomeHtml } from '@/lib/resend'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const existing = await prisma.subscriber.findUnique({ where: { email: normalized } })
  if (existing) {
    if (!existing.active) {
      await prisma.subscriber.update({ where: { email: normalized }, data: { active: true, name: name || existing.name } })
      return NextResponse.json({ ok: true, message: 'Inscrição reativada!' })
    }
    return NextResponse.json({ error: 'Este email já está inscrito.' }, { status: 409 })
  }

  await prisma.subscriber.create({ data: { email: normalized, name: name?.trim() || null } })

  try {
    const html = buildWelcomeHtml(name).replace(/\{\{email\}\}/g, encodeURIComponent(normalized))
    await sendNewsletterEmail(normalized, 'Bem-vindo à newsletter segalla.dev! 🚀', html)
  } catch (err) {
    console.error('Welcome email failed:', err)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(subscribers)
}

export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const normalized = normalizeEmail(email)
  const subscriber = await prisma.subscriber.findUnique({ where: { email: normalized } })
  if (!subscriber) return NextResponse.json({ error: 'Email não encontrado' }, { status: 404 })

  await prisma.subscriber.update({ where: { email: normalized }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
