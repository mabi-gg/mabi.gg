import { useTRPC } from '@mabigg/data-access'
import { navigate } from 'vike/client/router'
import { EllipsisIcon, X } from 'lucide-react'
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { z } from 'zod'
import { usePageContext } from 'vike-react/usePageContext'
import { Button } from '@mabigg/ui/components/button'
import { Skeleton } from '@mabigg/ui/components/skeleton'
import {
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableViewOptions,
  DataTable,
  DataTablePagination,
} from '@mabigg/ui/components/data-table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@mabigg/ui/components/dropdown-menu'
import {
  useQuery,
  keepPreviousData,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useMemo, useState, useEffect, useRef } from 'react'
import { Config } from 'vike-react/Config'
import { Input } from '@mabigg/ui/components/input'
import { useWithPrices, WithPrices } from '../../../hooks/use-with-prices'
import { AppRouterOutput } from '@mabigg/trpc'
import { cn } from '@mabigg/ui/lib/utils'

type Item = WithPrices<AppRouterOutput['item']['list']['items'][number]>

export function ItemsPage() {
  const pageContext = usePageContext()
  const trpc = useTRPC()

  const page =
    z.coerce.number().int().safeParse(pageContext.urlParsed.search.page).data ??
    1
  const pageSize =
    z.coerce.number().int().safeParse(pageContext.urlParsed.search.size).data ??
    50
  const pageIndex = page - 1

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const sorting = useMemo<SortingState>(() => {
    const sortParam = pageContext.urlParsed.search.sort
    const sort = sortParam
      ? sortParam
          .split(',')
          .map((s) => s.split(':'))
          .map(([id, order]) => ({
            id,
            desc: order === 'desc',
          }))
      : []
    return sort
  }, [pageContext.urlParsed.search.sort])

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    return pageContext.urlParsed.search.filter
      ? JSON.parse(pageContext.urlParsed.search.filter)
      : []
  }, [pageContext.urlParsed.search.filter])

  const typesFilterValue = columnFilters.find(({ id }) => id === 'type')?.value
  const nameFilterValue = columnFilters.find(({ id }) => id === 'name')?.value

  const itemsQueryOptions = trpc.item.list.queryOptions(
    {
      pageIndex,
      pageSize,
      searchText:
        nameFilterValue && typeof nameFilterValue === 'string'
          ? nameFilterValue
          : undefined,
      sort:
        sorting.length > 0
          ? sorting.map((sort) => ({
              id: sort.id,
              direction: sort.desc ? 'desc' : 'asc',
            }))
          : undefined,
      types:
        Array.isArray(typesFilterValue) && typesFilterValue.length > 0
          ? typesFilterValue
          : undefined,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const [initialItemsQueryOptions] = useState(itemsQueryOptions)
  useSuspenseQuery(initialItemsQueryOptions)

  const itemsQuery = useQuery(itemsQueryOptions)

  const data = useWithPrices(itemsQuery.data?.items ?? [])

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Item>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<Item, any>[] = []

    columns.push(
      columnHelper.accessor('itemId', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row: { original: item } }) => {
          return (
            <a
              href={`/items/${item.itemId}`}
              className="flex h-full w-full items-center gap-2"
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                }}
              >
                <img
                  key={item.itemId}
                  src={`/icons/${item.itemId}.png`}
                  alt={``}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="truncate">{item.itemId}</div>
            </a>
          )
        },
        meta: {
          width: 'max-content',
        },
        enableHiding: false,
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row: { original: item } }) => {
          return (
            <a
              href={`/items/${item.itemId}`}
              className="flex h-full w-full items-center"
            >
              <span className="truncate">{item.name}</span>
            </a>
          )
        },
        enableHiding: false,
        meta: {},
      }),
      columnHelper.accessor('description', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ getValue }) => {
          return <div className="truncate">{getValue()}</div>
        },
        meta: {},
      }),
      columnHelper.accessor('type', {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        meta: {
          width: 'max-content',
        },
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
          meta: {
            width: 'max-content',
          },
        }
      ),
      columnHelper.display({
        id: 'actions',
        cell: ({ row: { original: item } }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisIcon />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <a href={`/items/${item.itemId}`}>View Details</a>
                </DropdownMenuItem>
                {item.wikiPage ? (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <a
                      href={`https://wiki.mabinogiworld.com/view/${item.wikiPage}`}
                    >
                      Wiki
                    </a>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <a href={`https://na.mabibase.com/item/${item.itemId}`}>
                    Mabibase
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        meta: {
          width: 'max-content',
        },
      })
    )

    return columns
  }, [])

  const itemTypesQuery = useQuery(trpc.item.itemTypes.queryOptions())

  const updateParams = (searchParams: URLSearchParams) => {
    const currentSearchParams = new URLSearchParams(
      pageContext.urlParsed.searchOriginal || undefined
    )

    if (
      currentSearchParams.get('page') === searchParams.get('page') &&
      currentSearchParams.get('size') === searchParams.get('size') &&
      currentSearchParams.get('sort') === searchParams.get('sort') &&
      currentSearchParams.get('filter') === searchParams.get('filter')
    ) {
      return
    }

    navigate(
      pageContext.urlParsed.pathname + searchParams.size
        ? `?${searchParams}`
        : ''
    )
  }

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: itemsQuery.data?.total ?? 0,
    onSortingChange: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(sorting) : updater
      const searchParams = new URLSearchParams(
        pageContext.urlParsed.searchOriginal || undefined
      )

      if (newState.length > 0) {
        searchParams.set(
          'sort',
          newState.map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',')
        )
      } else {
        searchParams.delete('sort')
      }

      updateParams(searchParams)
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(pagination) : updater
      const searchParams = new URLSearchParams(
        pageContext.urlParsed.searchOriginal || undefined
      )

      if (newState.pageIndex) {
        searchParams.set('page', (newState.pageIndex + 1).toString())
      } else {
        searchParams.delete('page')
      }

      if (newState.pageSize) {
        searchParams.set('size', newState.pageSize.toString())
      } else {
        searchParams.delete('size')
      }

      updateParams(searchParams)
    },
    onColumnFiltersChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater(table.getState().columnFilters)
          : updater
      const searchParams = new URLSearchParams(
        pageContext.urlParsed.searchOriginal || undefined
      )
      if (newState.length > 0) {
        searchParams.set('filter', JSON.stringify(newState))
      } else {
        searchParams.delete('filter')
      }

      updateParams(searchParams)
    },
    initialState: {
      pagination,
      sorting,
      columnFilters,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
    },
  })

  const isFiltered = table.getState().columnFilters.length > 0
  const nameColumn = table.getColumn('name')!
  const typeColumn = table.getColumn('type')!
  const [searchText, setSearchText] = useState(
    typeof nameFilterValue === 'string' ? nameFilterValue : ''
  )
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText) {
        nameColumn.setFilterValue(searchText)
      } else {
        nameColumn.setFilterValue(undefined)
      }
    }, 300)
    return () => {
      clearTimeout(timeout)
    }
  }, [searchText, nameColumn])

  if (itemsQuery.isLoading) {
    return <div className="px-4">Loading...</div>
  }

  return (
    <div className="w-full px-4">
      <Config title="Items | mabi.gg" description="A list of items in Mabinogi." />
      <div className="top-(--app-shell-header-height) bg-backdrop sticky z-10 flex h-[48px] items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter items..."
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <DataTableFacetedFilter
            column={typeColumn}
            title="Types"
            options={
              itemTypesQuery.data?.map(({ type, count }) => ({
                value: type,
                label: `${type} (${count})`,
                icon: undefined,
              })) ?? []
            }
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchText('')
                table.resetColumnFilters()
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <DataTable
        table={table}
        classes={{
          header:
            'sticky top-[calc(var(--app-shell-header-height)+48px)] z-10 bg-backdrop',
          row: '*:*:p-2',
          body: cn(itemsQuery.isFetching && 'animate-pulse opacity-80'),
        }}
      />

      <DataTablePagination
        table={table}
        className={'bg-backdrop sticky bottom-0 h-16'}
      />
    </div>
  )
}
