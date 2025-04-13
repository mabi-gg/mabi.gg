import type { AppRouterClient } from '@mabigg/trpc'

declare global {
  namespace Vike {
    interface PageContext {
      trpcClient: AppRouterClient
      colorScheme: 'light' | 'dark' | null
    }
  }
}

export {}
