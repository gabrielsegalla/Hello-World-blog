import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getPages,
  getInstagramBusinessAccount,
} from '@/lib/instagram'
import { SITE_URL } from '@/lib/site'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error_description') || searchParams.get('error')
  const savedState = cookies().get('ig_oauth_state')?.value

  if (error) {
    return NextResponse.redirect(`${SITE_URL}/admin/instagram?error=${encodeURIComponent(error)}`)
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${SITE_URL}/admin/instagram?error=oauth_invalido`)
  }

  try {
    const short = await exchangeCodeForToken(code)
    const long = await getLongLivedToken(short.access_token)
    const pages = await getPages(long.access_token)

    let connected = false
    for (const page of pages.data || []) {
      const ig = await getInstagramBusinessAccount(page.id, page.access_token)
      const igAccount = ig.instagram_business_account
      if (!igAccount?.id) continue

      const expiresAt = long.expires_in
        ? new Date(Date.now() + long.expires_in * 1000)
        : null

      await prisma.instagramAccount.upsert({
        where: { igUserId: igAccount.id },
        create: {
          igUserId: igAccount.id,
          username: igAccount.username || 'instagram',
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          tokenExpiresAt: expiresAt,
        },
        update: {
          username: igAccount.username || 'instagram',
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          tokenExpiresAt: expiresAt,
        },
      })
      connected = true
      break
    }

    if (!connected) {
      return NextResponse.redirect(
        `${SITE_URL}/admin/instagram?error=${encodeURIComponent('Nenhuma conta Instagram Business vinculada a uma Page do Facebook')}`
      )
    }

    return NextResponse.redirect(`${SITE_URL}/admin/instagram?connected=1`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro na conexão'
    return NextResponse.redirect(`${SITE_URL}/admin/instagram?error=${encodeURIComponent(msg)}`)
  }
}
