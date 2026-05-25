const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || 'v21.0'}`

export function getMetaConfig() {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/instagram/callback`

  if (!appId || !appSecret) {
    throw new Error('META_APP_ID e META_APP_SECRET são obrigatórios')
  }

  return { appId, appSecret, redirectUri }
}

export function getInstagramOAuthUrl(state: string) {
  const { appId, redirectUri } = getMetaConfig()
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'business_management',
  ].join(',')

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state,
  })

  return `https://www.facebook.com/${process.env.META_GRAPH_VERSION || 'v21.0'}/dialog/oauth?${params}`
}

async function graphGet<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ ...params, access_token: token })
  const res = await fetch(`${GRAPH}${path}?${qs}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data as T
}

async function graphGetNoToken<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params)
  const res = await fetch(`${GRAPH}/oauth/access_token?${qs}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data as T
}

async function graphPost<T>(path: string, token: string, body: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...body, access_token: token })
  const res = await fetch(`${GRAPH}${path}`, { method: 'POST', body: qs })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data))
  return data as T
}

export async function exchangeCodeForToken(code: string) {
  const { appId, appSecret, redirectUri } = getMetaConfig()
  return graphGetNoToken<{ access_token: string; token_type: string; expires_in?: number }>({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })
}

export async function getLongLivedToken(shortToken: string) {
  const { appSecret, appId } = getMetaConfig()
  return graphGetNoToken<{ access_token: string; expires_in: number }>({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  })
}

export async function getPages(userToken: string) {
  return graphGet<{ data: Array<{ id: string; name: string; access_token: string }> }>(
    '/me/accounts',
    userToken,
    { fields: 'id,name,access_token' }
  )
}

export async function getInstagramBusinessAccount(pageId: string, pageToken: string) {
  return graphGet<{ instagram_business_account?: { id: string; username?: string } }>(
    `/${pageId}`,
    pageToken,
    { fields: 'instagram_business_account{id,username}' }
  )
}

export async function publishCarousel(params: {
  igUserId: string
  accessToken: string
  imageUrls: string[]
  caption: string
}) {
  const childIds: string[] = []

  for (const imageUrl of params.imageUrls) {
    const child = await graphPost<{ id: string }>(
      `/${params.igUserId}/media`,
      params.accessToken,
      {
        image_url: imageUrl,
        is_carousel_item: 'true',
      }
    )
    childIds.push(child.id)
  }

  const container = await graphPost<{ id: string }>(
    `/${params.igUserId}/media`,
    params.accessToken,
    {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: params.caption,
    }
  )

  const published = await graphPost<{ id: string }>(
    `/${params.igUserId}/media_publish`,
    params.accessToken,
    { creation_id: container.id }
  )

  return published.id
}

export async function refreshPageTokenIfNeeded(account: {
  pageId: string
  accessToken: string
  tokenExpiresAt: Date | null
}) {
  if (!account.tokenExpiresAt) return account.accessToken
  const daysLeft = (account.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysLeft > 14) return account.accessToken

  const long = await getLongLivedToken(account.accessToken)
  return long.access_token
}
