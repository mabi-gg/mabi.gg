import { createCallerClient, createFetchHandler } from '@mabigg/trpc/server'
import render from 'render2'
import { getCookie } from 'hono/cookie'
import { Context, Hono } from 'hono'
import { apply } from 'vike-cloudflare/hono'
import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import { serve } from 'vike-cloudflare/hono/serve'
import { Auth, type AuthConfig } from '@auth/core'
import { appSchema, type AppDatabase } from '@mabigg/db'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { getAuthConfig } from '../auth/auth-config'
import { getCsrfToken, getProviders, getSession } from '../auth/auth-actions'
import React from 'react'

type AppEnv = {
  Bindings: {
    DB: D1Database
    R2: R2Bucket
  }
  Variables: {
    DB: D1Database
    R2: R2Bucket
    authConfig: AuthConfig
    drizzle: AppDatabase
  }
}

export type Ctx = Context<AppEnv>

const _platformProxy = import.meta.env.DEV
  ? // eslint-disable-next-line unicorn/prefer-top-level-await
    import('wrangler').then((mod) => mod.getPlatformProxy())
  : undefined

function startServer() {
  const app = new Hono<AppEnv>()

  app.use(async (ctx, next) => {
    const env = import.meta.env.DEV
      ? // eslint-disable-next-line unicorn/no-await-expression-member
        ((await _platformProxy!).env as typeof ctx.env)
      : ctx.env
    ctx.set('DB', env.DB)
    ctx.set('R2', env.R2)
    ctx.set(
      'drizzle',
      drizzleD1(env.DB, {
        schema: appSchema,
      })
    )
    ctx.set('authConfig', await getAuthConfig(ctx))
    await next()
  })

  app.use('/auth/*', async (ctx) => {
    return Auth(ctx.req.raw, ctx.get('authConfig'))
  })

  app.use('/icons/:item', async (ctx, next) => {
    const itemParam = ctx.req.param('item')
    if (!itemParam) {
      return await next()
    }

    const r2 = ctx.get('R2')

    if (import.meta.env.DEV) {
      const remoteResponse = await fetch(
        `${import.meta.env.R2_DEV_URL}/icons/${itemParam}`
      )
      return remoteResponse
    }

    const request = new Request(
      new URL(`/icons/${itemParam}`, new URL(ctx.req.url).origin),
      {
        headers: ctx.req.raw.headers,
      }
    )

    const executionCtx = import.meta.env.DEV
      ? // eslint-disable-next-line unicorn/no-await-expression-member
        (await _platformProxy!).ctx
      : ctx.executionCtx

    const response = await render.fetch(
      request,
      {
        R2_BUCKET: r2,
      },
      executionCtx
    )
    const headers = new Headers(response.headers)
    headers.set('cache-control', 'public, max-age=86400')
    return new Response(response.body, {
      headers,
      status: response.status,
    })
  })

  app.use('/api/trpc/*', (ctx) => {
    const trpcHandler = createFetchHandler({
      endpoint: '/api/trpc',
      createContext: () => getTrpcContext(ctx),
    })
    return trpcHandler(ctx.req.raw)
  })

  apply(app, {
    async pageContext(ctx) {
      const theme = getCookie(ctx.hono, 'theme')
      const trpcClient = createCallerClient(await getTrpcContext(ctx.hono))
      return {
        trpcClient,
        colorScheme:
          theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : null,
      } satisfies Vike.PageContext
    },
  })

  return serve(app, { port: 5173 })
}

async function getTrpcContext(ctx: Ctx) {
  const session = await getSession(ctx)
  return {
    db: ctx.get('drizzle'),
    session: session ?? null,
    auth: {
      getCsrfToken: React.cache(() => getCsrfToken(ctx)),
      getProviders: React.cache(() => getProviders(ctx)),
    },
  }
}

export default startServer()
