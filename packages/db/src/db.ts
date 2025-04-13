import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import { AppSchema } from './schema'
export * from './schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDatabase = BaseSQLiteDatabase<'async', any, AppSchema>
