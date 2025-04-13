import { createHttpClient } from '@mabigg/trpc/client'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { proxy } from 'hono/proxy'
import { apply } from 'vike-cloudflare/hono'
import { serve } from 'vike-cloudflare/hono/serve'

function startServer() {
  const app = new Hono()

  app.use(async (c, next) => {
    const url = new URL(c.req.url)

    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/auth/') ||
      url.pathname.startsWith('/icons/')
    ) {
      const res = await proxy(`https://mabi.gg/${url.pathname + url.search}`, {
        method: c.req.method,
        headers: c.req.header(),
        body: c.req.raw.body,
      })
      return res
    }

    return next()
  })

  apply(app, {
    async pageContext(ctx) {
      const theme = getCookie(ctx.hono, 'theme')
      const trpcClient = createHttpClient('https://mabi.gg/api/trpc')
      return {
        trpcClient,
        colorScheme:
          theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : null,
      } satisfies Vike.PageContext
    },
  })

  return serve(app, { port: 5173 })
}

export default startServer()
