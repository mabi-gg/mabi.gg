import { useTRPC } from '@mabigg/data-access'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useStable } from './use-stable'

interface Item {
  itemId: number
}

export function useWithPrices<TItem extends Item>(items: TItem[]) {
  const trpc = useTRPC()
  const auctionHouseQuery = useQueries({
    queries:
      items.map((item) =>
        trpc.auctionHouse.listings.queryOptions({
          itemId: item.itemId,
        })
      ) ?? [],
  })

  const queries = useStable(auctionHouseQuery)

  return useMemo(() => {
    return items.map((item, index) => {
      return {
        ...item,
        listings: queries[index],
      }
    })
  }, [items, queries])
}

export type WithPrices<TItem extends Item> = ReturnType<
  typeof useWithPrices<TItem>
>[number]
