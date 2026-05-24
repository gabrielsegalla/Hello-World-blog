import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = process.env.EMAIL_FROM || 'Gabriel Segalla <newsletter@segalla.dev>'

export async function sendNewsletterEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html: htmlContent,
  })
}

export function buildNewsletterHtml(post: {
  title: string
  subtitle?: string | null
  excerpt?: string | null
  slug: string
  content: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segalla.dev'
  const postUrl = `${siteUrl}/posts/${post.slug}`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${post.title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:'Courier New',monospace;color:#e8f4ff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="padding:0 0 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:14px;color:#7c3aed;letter-spacing:.1em;">&gt;_ segalla.dev</td>
            <td align="right" style="font-size:11px;color:#7a9bbf;letter-spacing:.08em;">NEWSLETTER</td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:16px 0 0;"/>
      </td></tr>

      <!-- Category tag -->
      <tr><td style="padding:0 0 16px;">
        <span style="font-size:11px;color:#7c3aed;border:1px solid #3730a3;padding:4px 12px;border-radius:3px;letter-spacing:.1em;">
          NOVO ARTIGO
        </span>
      </td></tr>

      <!-- Title -->
      <tr><td style="padding:0 0 12px;">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">${post.title}</h1>
      </td></tr>

      ${post.subtitle ? `<tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:16px;color:#7a9bbf;line-height:1.6;">${post.subtitle}</p>
      </td></tr>` : ''}

      <!-- Excerpt -->
      ${post.excerpt ? `<tr><td style="padding:0 0 32px;">
        <div style="border-left:3px solid #7c3aed;padding:16px 20px;background:rgba(124,58,237,.08);border-radius:0 4px 4px 0;">
          <p style="margin:0;font-size:15px;color:#c4b5fd;line-height:1.8;font-style:italic;">${post.excerpt}</p>
        </div>
      </td></tr>` : ''}

      <!-- CTA -->
      <tr><td style="padding:0 0 40px;text-align:center;">
        <a href="${postUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:14px 36px;border-radius:4px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.06em;">
          LER ARTIGO COMPLETO →
        </a>
      </td></tr>

      <!-- Ebook promo -->
      <tr><td style="padding:24px;background:#0f0a1e;border:1px solid #1e1b4b;border-radius:8px;margin-bottom:32px;">
        <p style="margin:0 0 8px;font-size:11px;color:#7c3aed;letter-spacing:.1em;">// EBOOK DISPONÍVEL</p>
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#ffffff;">HelloWorld — A Jornada Real de Quem Começa na Programação</p>
        <p style="margin:0 0 16px;font-size:13px;color:#7a9bbf;">10 capítulos. 10+ anos de experiência. Sem teoria vazia.</p>
        <a href="${siteUrl}/#ebook" style="display:inline-block;border:1px solid #7c3aed;color:#c4b5fd;padding:10px 24px;border-radius:4px;font-size:13px;text-decoration:none;">
          Ver o ebook →
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:32px 0 0;">
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:0 0 20px;"/>
        <p style="margin:0;font-size:12px;color:#4a5568;text-align:center;">
          Você está recebendo este email porque se inscreveu em segalla.dev<br/>
          <a href="${siteUrl}/unsubscribe?email={{email}}" style="color:#7c3aed;">Cancelar inscrição</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function buildWelcomeHtml(name?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segalla.dev'
  const firstName = name ? name.split(' ')[0] : 'dev'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>Bem-vindo à newsletter</title></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:'Courier New',monospace;color:#e8f4ff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 32px;">
        <p style="margin:0;font-size:14px;color:#7c3aed;letter-spacing:.1em;">&gt;_ segalla.dev</p>
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:16px 0 0;"/>
      </td></tr>
      <tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:11px;color:#7c3aed;letter-spacing:.1em;">// BEM-VINDO</p>
      </td></tr>
      <tr><td style="padding:0 0 16px;">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Oi, ${firstName}! 👋</h1>
      </td></tr>
      <tr><td style="padding:0 0 24px;">
        <p style="margin:0;font-size:15px;color:#c4b5fd;line-height:1.8;">
          Você está inscrito na newsletter do <strong style="color:#ffffff;">segalla.dev</strong>.<br/>
          Vou te mandar conteúdo real sobre dev, IA e carreira — sem hype, sem teoria vazia.
        </p>
      </td></tr>
      <tr><td style="padding:0 0 32px;">
        <div style="border-left:3px solid #7c3aed;padding:16px 20px;background:rgba(124,58,237,.08);">
          <p style="margin:0;font-size:14px;color:#7a9bbf;line-height:1.8;">
            <strong style="color:#ffffff;">O que você vai receber:</strong><br/>
            → Artigos sobre IA aplicada ao dev do dia a dia<br/>
            → Experiências reais de 10+ anos de carreira<br/>
            → Dicas sobre carreira, inglês e como se posicionar no mercado
          </p>
        </div>
      </td></tr>
      <tr><td align="center" style="padding:0 0 40px;">
        <a href="${siteUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:14px 36px;border-radius:4px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.06em;">
          VER OS ARTIGOS →
        </a>
      </td></tr>
      <tr><td style="padding:32px 0 0;">
        <hr style="border:none;border-top:1px solid #1e1b4b;margin:0 0 20px;"/>
        <p style="margin:0;font-size:12px;color:#4a5568;text-align:center;">
          Gabriel Segalla · segalla.dev<br/>
          <a href="${siteUrl}/unsubscribe?email={{email}}" style="color:#7c3aed;">Cancelar inscrição</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
