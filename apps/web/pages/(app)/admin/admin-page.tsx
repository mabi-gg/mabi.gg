import { useTRPC } from '@mabigg/data-access'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { render } from 'vike/abort'
import { UsersTable } from './users-table'

export function AdminPage() {
  const trpc = useTRPC()
  const { data: user } = useSuspenseQuery(
    trpc.user.me.queryOptions(undefined, { staleTime: Infinity })
  )

  if (!user) {
    throw render(401)
  }

  if (!user?.roles?.includes('admin')) {
    throw render(403)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl">Users</h2>
      <UsersTable />
    </div>
  )
}
