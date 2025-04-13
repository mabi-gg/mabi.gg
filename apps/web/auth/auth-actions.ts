import { Auth, createActionURL } from '@auth/core'
import { PublicProvider, Session } from '@auth/core/types'
import type { Ctx } from '../server'

export async function getSession(ctx: Ctx): Promise<Session | null> {
  const request = ctx.req.raw
  const authConfig = ctx.get('authConfig')
  const requestUrl = new URL(request.url)

  const url = createActionURL(
    'session',
    requestUrl.protocol,
    request.headers,
    {},
    authConfig
  )

  const response = await Auth(
    new Request(url, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    }),
    authConfig
  )

  const { status = 200 } = response
  const data = await response.json()

  if (!data || Object.keys(data).length === 0) return null
  if (status === 200) return data
  throw new Error(data.message)
}

export async function getCsrfToken(ctx: Ctx): Promise<string> {
  const request = ctx.req.raw
  const authConfig = ctx.get('authConfig')
  const requestUrl = new URL(request.url)

  const url = createActionURL(
    'csrf',
    requestUrl.protocol,
    request.headers,
    {},
    authConfig
  )

  const response = await Auth(
    new Request(url, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    }),
    authConfig
  )

  const { status = 200 } = response
  const data = await response.json()

  if (!data || Object.keys(data).length === 0) {
    throw new Error('No csrf token found')
  }
  if (status === 200) return data.csrfToken
  throw new Error(data.message)
}

export async function getProviders(
  ctx: Ctx
): Promise<Record<string, PublicProvider>> {
  const request = ctx.req.raw
  const authConfig = ctx.get('authConfig')
  const requestUrl = new URL(request.url)

  const url = createActionURL(
    'providers',
    requestUrl.protocol,
    request.headers,
    {},
    authConfig
  )

  const response = await Auth(
    new Request(url, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    }),
    authConfig
  )

  const { status = 200 } = response
  const data = await response.json()

  if (!data || Object.keys(data).length === 0) {
    throw new Error('No providers found')
  }
  if (status === 200) return data
  throw new Error(data.message)
}
