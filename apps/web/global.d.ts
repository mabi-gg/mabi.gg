import type { AppRouterClient } from '@mabigg/trpc'

declare global {
  namespace Vike {
    interface PageContext {
      trpcClient: AppRouterClient
      colorScheme: 'light' | 'dark' | null
      CF_PAGES_BRANCH: string | null
      CF_PAGES_COMMIT_SHA: string | null
    }
  }
}

export {}
