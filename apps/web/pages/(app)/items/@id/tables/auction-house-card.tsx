import { useMemo } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTable } from '@mabigg/ui/components/data-table/data-table'
import { DataTableColumnHeader } from '@mabigg/ui/components/data-table/data-table-column-header'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@mabigg/ui/components/card'
import { Skeleton } from '@mabigg/ui/components/skeleton'
import { ScrollArea } from '@mabigg/ui/components/scroll-area'
import { cn } from '@mabigg/ui/lib/utils'
import { AuctionHouseListing } from '@mabigg/data-access'

interface Props {
  listings: AuctionHouseListing[]
  isLoading?: boolean
}

export function AuctionHouseCard({ listings, isLoading }: Props) {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AuctionHouseListing>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<AuctionHouseListing, any>[] = [
      columnHelper.accessor('price1', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ getValue }) => {
          return <>{getValue().toLocaleString('en-US')}</>
        },
      }),
      columnHelper.accessor((listing) => listing.price2 / listing.price1, {
        id: 'quantity',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
        cell: ({ row: { original: listing } }) => {
          return <>{listing.price2 / listing.price1}</>
        },
      }),
      columnHelper.accessor('price2', {
        id: 'Total',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ getValue }) => {
          return <>{getValue().toLocaleString('en-US')}</>
        },
      }),
      columnHelper.accessor('endDate', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ends in" />
        ),
        cell: ({ getValue }) => {
          return <>{formatDistanceToNow(parseISO(getValue()))}</>
        },
      }),
    ]
    return columns
  }, [])

  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableHiding: false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction house listings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : table.getCoreRowModel().rows.length > 0 ? (
          <ScrollArea
            className={cn('min-h-[200px]', listings.length > 10 && 'h-[400px]')}
          >
            <DataTable
              header="sticky"
              table={table}
              classes={{
                row: '*:p-2',
              }}
            />
          </ScrollArea>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm">
            No listings available
          </div>
        )}
      </CardContent>
      <CardFooter className="text-muted-foreground justify-end">
        {listings.length} listings
      </CardFooter>
    </Card>
  )
}
