import type { AppDatabase } from '@mabigg/db'
import type { PublicProvider, Session } from '@auth/core/types'

export interface Context {
  db: AppDatabase
  session: Session | null
  auth: {
    getCsrfToken(): Promise<string>
    getProviders(): Promise<Record<string, PublicProvider>>
  }
}
