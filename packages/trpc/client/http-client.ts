import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/app-router'

export function createHttpClient(url: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  })
}
