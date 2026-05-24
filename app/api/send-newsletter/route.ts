import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { sendNewsletterEmail, buildNewsletterHtml } from '@/lib/resend'

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { postId, subject, customMessage } = await req.json()

  if (!postId) return NextResponse.json({ error: 'postId obrigatório' }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id: Number(postId) } })
  if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })

  const subscribers = await prisma.subscriber.findMany({ where: { active: true } })
  if (subscribers.length === 0) return NextResponse.json({ error: 'Nenhum inscrito ativo' }, { status: 400 })

  const emailSubject = subject || `Novo artigo: ${post.title}`

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const sub of subscribers) {
    try {
      const html = buildNewsletterHtml(post)
        .replace(/\{\{email\}\}/g, encodeURIComponent(sub.email))
      await sendNewsletterEmail(sub.email, emailSubject, html)
      sent++
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100))
    } catch (err: any) {
      failed++
      errors.push(`${sub.email}: ${err.message}`)
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length, errors })
}
