import { useTRPC } from '@mabigg/data-access'
import { AppRouterOutput } from '@mabigg/trpc'
import { DataTable } from '@mabigg/ui/components/data-table'
import { ScrollArea } from '@mabigg/ui/components/scroll-area'
import { cn } from '@mabigg/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

type User = AppRouterOutput['admin']['allUsers'][number]

export function UsersTable() {
  const trpc = useTRPC()
  const usersQuery = useQuery(trpc.admin.allUsers.queryOptions())

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<User>()
    return [
      columnHelper.accessor('id', {}),
      columnHelper.accessor('name', {}),
      columnHelper.accessor('roles', {}),
    ]
  }, [])

  const data = useMemo(() => {
    return usersQuery.data ?? []
  }, [usersQuery.data])

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="">
      <ScrollArea className="h-400px">
        <DataTable
          header="sticky"
          table={table}
          classes={{
            row: '*:p-2',
          }}
        />
      </ScrollArea>
    </div>
  )
}
