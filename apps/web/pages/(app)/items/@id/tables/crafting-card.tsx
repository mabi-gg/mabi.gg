import { DataTable } from '@mabigg/ui/components/data-table/data-table'
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useId, useMemo, useState } from 'react'
import { ItemIdCell } from '../cells/item-id-cell'
import { DataTableColumnHeader } from '@mabigg/ui/components/data-table/data-table-column-header'
import { ItemNameCell } from '../cells/item-name-cell'
import { Skeleton } from '@mabigg/ui/components/skeleton'
import { Input } from '@mabigg/ui/components/input'
import { Label } from '@mabigg/ui/components/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@mabigg/ui/components/card'
import { useWithPrices } from '../../../../../hooks/use-with-prices'

interface Material {
  itemId: number
  name: string
  iconUrl: string
  type: string
  description: string
  wikiPage: string
  quantity: number
}

interface CraftingFinish {
  finishId: number
  materials: Material[]
}

interface Crafting {
  craftingId: number
  type: string
  rank: string
  maxProgress: number
  materials: Material[]
  finishes: CraftingFinish[]
}

interface Props {
  crafting: Crafting
}

export function CraftingCard({ crafting }: Props) {
  const materials = useWithPrices(crafting.materials)
  const finishes = crafting.finishes
  const [finishId, setFinishId] = useState(finishes.find(Boolean)?.finishId)
  const finish = finishes.find((i) => i.finishId === finishId)
  const finishWithPrices = useWithPrices(
    useMemo(() => finish?.materials ?? [], [finish?.materials])
  )
  const data = useMemo(
    () => [
      ...materials.map((f) => ({ ...f, isFinish: false })),
      ...finishWithPrices.map((f) => ({ ...f, isFinish: true })),
    ],
    [materials, finishWithPrices]
  )

  type Data = (typeof data)[number]
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Data>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<Data, any>[] = [
      columnHelper.accessor('itemId', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row: { original: item } }) => {
          return <ItemIdCell item={item} />
        },
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row: { original: item } }) => {
          return (
            <div>
              <ItemNameCell item={item} />
              {item.isFinish ? (
                <div className="text-muted-foreground">Finish</div>
              ) : null}
            </div>
          )
        },
      }),
      columnHelper.accessor('quantity', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
      }),
      columnHelper.accessor(
        (item) => item.listings.data?.results.find((r) => r.price1)?.price1,
        {
          id: 'price',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
          ),
          cell: ({ getValue, row: { original: item } }) => {
            const price = getValue()
            return (
              <div>
                {price ? (
                  <span>{price.toLocaleString('en-US')}</span>
                ) : item.listings.isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            )
          },
          enableSorting: false,
          enableColumnFilter: false,
        }
      ),
    ]

    return columns
  }, [])

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableHiding: false,
  })

  const [estimatedAttempts, setEstimatedAttempts] = useState(
    Math.ceil(100 / crafting.maxProgress)
  )

  const estimatedAttemptsId = useId()

  const estimatedCostPerAttempt = materials.reduce((acc, item) => {
    const price = item.listings.data?.results.find((r) => r.price1)?.price1
    return acc + (price || 0) * item.quantity
  }, 0)

  const costToFinish = finishWithPrices.reduce((acc, item) => {
    const price = item.listings.data?.results.find((r) => r.price1)?.price1
    return acc + (price || 0) * item.quantity
  }, 0)

  return (
    <Card key={crafting.craftingId}>
      <CardHeader>
        <CardTitle>Crafting</CardTitle>
        <CardDescription className="flex items-center justify-between">
          <div>
            {crafting.rank} {crafting.type}
          </div>
          <div>Max progress: {crafting.maxProgress}%</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
      <CardFooter className="text-muted-foreground flex items-center justify-between gap-2 pt-2 text-sm">
        <div className="flex gap-2">
          <Label className="text-sm" htmlFor={estimatedAttemptsId}>
            Attempts:
          </Label>
          <Input
            id={estimatedAttemptsId}
            type="number"
            value={estimatedAttempts.toString()}
            min={0}
            onChange={(e) => {
              setEstimatedAttempts(Number.parseInt(e.target.value, 10))
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 text-right text-sm">
          Estimated Cost:{' '}
          {materials.some((i) => i.listings.isLoading) ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            (
              estimatedCostPerAttempt * estimatedAttempts +
              costToFinish
            ).toLocaleString('en-US')
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
