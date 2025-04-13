import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { usersTable } from './users'

export const userRoleTable = sqliteTable(
  'user_role',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: text('user_id').references(() => usersTable.id, {
      onDelete: 'cascade',
    }),
    role: text('role').notNull(),
  },
  (table) => [
    index('user_role_user_id_index').on(table.userId),
    index('user_role_role_index').on(table.role),
  ]
)

export const rolePermissionTable = sqliteTable(
  'role_permission',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    role: text('role').notNull(),
    permission: text('permission').notNull(),
  },
  (table) => [
    index('role_permission_role_index').on(table.role),
    unique('role_permission_role_permission_unique').on(
      table.role,
      table.permission
    ),
  ]
)
