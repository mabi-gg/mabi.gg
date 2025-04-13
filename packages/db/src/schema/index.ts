import * as users from './users'
import * as userInfo from './user-info'
import * as mabi from './mabi'
export * from './users'
export * from './user-info'
export * from './mabi'

export const appSchema = {
  ...users,
  ...userInfo,
  ...mabi,
}

export type AppSchema = typeof appSchema
