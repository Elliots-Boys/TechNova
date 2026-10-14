import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const TECHNOVA_ORIGIN = 'https://technova-bmm.pages.dev'

function cors(origin: string | null) {
  const allowed =
    origin === TECHNOVA_ORIGIN ||
    origin === 'http://localhost:3000' ||
    origin === 'http://127.0.0.1:3000'

  return {
    'Access-Control-Allow-Origin': allowed && origin ? origin : TECHNOVA_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors(origin),
  })
}

function cleanString(value: unknown, max: number) {
  return typeof value === 'string'
    ? value.trim().slice(0, max)
    : ''
}

function optionalUrl(value: unknown) {
  const raw = cleanString(value, 500)
  if (!raw) return null

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new Error('HTTPS is required.')
    }
    return url.toString()
  } catch {
    throw new Error('Enter a valid HTTPS URL.')
  }
}

function redirectUris(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('At least one redirect URI is required.')
  }

  const unique = [...new Set(
    value
      .map(item => cleanString(item, 1000))
      .filter(Boolean)
  )]

  if (!unique.length || unique.length > 10) {
    throw new Error('Add between 1 and 10 redirect URIs.')
  }

  return unique.map(raw => {
    try {
      const url = new URL(raw)
      const local =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1'

      if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
        throw new Error()
      }

      if (url.hash) {
        throw new Error()
      }

      return url.toString()
    } catch {
      throw new Error('Every redirect URI must be a complete HTTPS URL. HTTP is only allowed for localhost development.')
    }
  })
}

async function getUser(req: Request) {
  const authorization = req.headers.get('Authorization') ?? ''
  if (!authorization.startsWith('Bearer ')) return null

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: SERVICE_ROLE_KEY,
    },
  })

  if (!response.ok) return null
  return await response.json()
}

async function adminOAuth(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/oauth/clients${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error_description || data?.error || 'OAuth client operation failed.')
  }

  return data
}

async function dbRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message || data?.details || 'Database operation failed.')
  }

  return data
}

async function ownedApp(userId: string, clientId: string) {
  const rows = await dbRequest(
    `developer_oauth_apps?owner_user_id=eq.${encodeURIComponent(userId)}&oauth_client_id=eq.${encodeURIComponent(clientId)}&select=*`
  )

  return Array.isArray(rows) ? rows[0] ?? null : null
}

function publicApp(row: any) {
  return {
    id: row.id,
    client_id: row.oauth_client_id,
    name: row.name,
    description: row.description,
    website_url: row.website_url,
    logo_url: row.logo_url,
    privacy_url: row.privacy_url,
    terms_url: row.terms_url,
    client_type: row.client_type,
    token_endpoint_auth_method: row.token_endpoint_auth_method,
    redirect_uris: row.redirect_uris,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'POST required' }, 405, origin)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'Developer services are not configured.' }, 503, origin)
  }

  const user = await getUser(req)
  if (!user?.id) {
    return json({ error: 'Sign in to your TechNova account first.' }, 401, origin)
  }

  try {
    const body = await req.json()
    const action = cleanString(body?.action, 40)

    if (action === 'list') {
      const rows = await dbRequest(
        `developer_oauth_apps?owner_user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc`
      )

      return json({
        apps: (rows ?? []).map(publicApp),
      }, 200, origin)
    }

    if (action === 'get') {
      const clientId = cleanString(body?.client_id, 100)
      const row = await ownedApp(user.id, clientId)

      if (!row) {
        return json({ error: 'Application not found.' }, 404, origin)
      }

      const client = await adminOAuth(`/${encodeURIComponent(clientId)}`, {
        method: 'GET',
      })

      return json({
        app: publicApp(row),
        oauth: {
          client_id: client.client_id,
          client_name: client.client_name,
          client_type: client.client_type,
          token_endpoint_auth_method: client.token_endpoint_auth_method,
          redirect_uris: client.redirect_uris,
          client_uri: client.client_uri ?? null,
          logo_uri: client.logo_uri ?? null,
          created_at: client.created_at ?? null,
        },
      }, 200, origin)
    }

    if (action === 'create') {
      const name = cleanString(body?.name, 80)
      const description = cleanString(body?.description, 500)
      const clientType = body?.client_type === 'confidential' ? 'confidential' : 'public'
      const redirects = redirectUris(body?.redirect_uris)
      const websiteUrl = optionalUrl(body?.website_url)
      const logoUrl = optionalUrl(body?.logo_url)
      const privacyUrl = optionalUrl(body?.privacy_url)
      const termsUrl = optionalUrl(body?.terms_url)

      if (!name) {
        throw new Error('Application name is required.')
      }

      const tokenMethod =
        clientType === 'public'
          ? 'none'
          : 'client_secret_basic'

      let oauthClient: any = null

      try {
        oauthClient = await adminOAuth('', {
          method: 'POST',
          body: JSON.stringify({
            client_name: name,
            ...(websiteUrl ? { client_uri: websiteUrl } : {}),
            redirect_uris: redirects,
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            scope: 'openid profile email',
            token_endpoint_auth_method: tokenMethod,
          }),
        })

        const createdSecret =
          oauthClient.client_secret ?? null

        if (logoUrl) {
          const updatedClient = await adminOAuth(`/${encodeURIComponent(oauthClient.client_id)}`, {
            method: 'PUT',
            body: JSON.stringify({
              logo_uri: logoUrl,
            }),
          })

          oauthClient = {
            ...oauthClient,
            ...updatedClient,
            client_secret: createdSecret,
          }
        }

        const inserted = await dbRequest('developer_oauth_apps', {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            owner_user_id: user.id,
            oauth_client_id: oauthClient.client_id,
            name,
            description,
            website_url: websiteUrl,
            logo_url: logoUrl,
            privacy_url: privacyUrl,
            terms_url: termsUrl,
            client_type: oauthClient.client_type ?? clientType,
            token_endpoint_auth_method: oauthClient.token_endpoint_auth_method ?? tokenMethod,
            redirect_uris: redirects,
          }),
        })

        const row = Array.isArray(inserted) ? inserted[0] : inserted

        return json({
          app: publicApp(row),
          client_secret: oauthClient.client_secret ?? null,
        }, 201, origin)
      } catch (error) {
        if (oauthClient?.client_id) {
          try {
            await adminOAuth(`/${encodeURIComponent(oauthClient.client_id)}`, {
              method: 'DELETE',
            })
          } catch {
            // Best-effort cleanup if metadata storage fails.
          }
        }
        throw error
      }
    }

    if (action === 'update') {
      const clientId = cleanString(body?.client_id, 100)
      const row = await ownedApp(user.id, clientId)

      if (!row) {
        return json({ error: 'Application not found.' }, 404, origin)
      }

      const name = cleanString(body?.name, 80)
      const description = cleanString(body?.description, 500)
      const redirects = redirectUris(body?.redirect_uris)
      const websiteUrl = optionalUrl(body?.website_url)
      const logoUrl = optionalUrl(body?.logo_url)
      const privacyUrl = optionalUrl(body?.privacy_url)
      const termsUrl = optionalUrl(body?.terms_url)

      if (!name) throw new Error('Application name is required.')

      await adminOAuth(`/${encodeURIComponent(clientId)}`, {
        method: 'PUT',
        body: JSON.stringify({
          client_name: name,
          client_uri: websiteUrl,
          logo_uri: logoUrl,
          redirect_uris: redirects,
        }),
      })

      const updated = await dbRequest(
        `developer_oauth_apps?owner_user_id=eq.${encodeURIComponent(user.id)}&oauth_client_id=eq.${encodeURIComponent(clientId)}`,
        {
          method: 'PATCH',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            name,
            description,
            website_url: websiteUrl,
            logo_url: logoUrl,
            privacy_url: privacyUrl,
            terms_url: termsUrl,
            redirect_uris: redirects,
            updated_at: new Date().toISOString(),
          }),
        }
      )

      const updatedRow = Array.isArray(updated) ? updated[0] : updated

      return json({ app: publicApp(updatedRow) }, 200, origin)
    }

    if (action === 'regenerate_secret') {
      const clientId = cleanString(body?.client_id, 100)
      const row = await ownedApp(user.id, clientId)

      if (!row) {
        return json({ error: 'Application not found.' }, 404, origin)
      }

      if (row.client_type !== 'confidential') {
        return json({ error: 'Public clients do not have a client secret.' }, 400, origin)
      }

      const client = await adminOAuth(
        `/${encodeURIComponent(clientId)}/regenerate_secret`,
        { method: 'POST' }
      )

      return json({
        client_id: client.client_id,
        client_secret: client.client_secret,
      }, 200, origin)
    }

    if (action === 'delete') {
      const clientId = cleanString(body?.client_id, 100)
      const row = await ownedApp(user.id, clientId)

      if (!row) {
        return json({ error: 'Application not found.' }, 404, origin)
      }

      await adminOAuth(`/${encodeURIComponent(clientId)}`, {
        method: 'DELETE',
      })

      await dbRequest(
        `developer_oauth_apps?owner_user_id=eq.${encodeURIComponent(user.id)}&oauth_client_id=eq.${encodeURIComponent(clientId)}`,
        { method: 'DELETE' }
      )

      return json({ deleted: true }, 200, origin)
    }

    return json({ error: 'Unknown action.' }, 400, origin)
  } catch (error) {
    console.error('TechNova developer OAuth error:', error)
    return json({
      error: error instanceof Error ? error.message : 'Developer operation failed.',
    }, 400, origin)
  }
})
