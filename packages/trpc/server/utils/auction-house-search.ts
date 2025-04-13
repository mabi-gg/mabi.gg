import { z } from 'zod'

interface Options {
  itemIds: number[]
  pageSize?: number
  pageIndex?: number
}

export async function auctionHouseSearch({
  pageIndex = 0,
  pageSize = 25,
  itemIds,
}: Options) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  const body = itemIds.map((itemId) => ({
    operationName: 'auctionHouseSearch',
    variables: {
      server: 'mabius6',
      filters: [
        {
          type: 'ItemId',
          comparator: 'eq',
          value: itemId.toString(),
        },
      ],
      pagination: {
        pageSize,
        pageIndex,
      },
      sort: {
        attribute: 'ItemPrice',
        direction: 'Ascending',
      },
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash:
          'e42f50b9ab00b0e7b820afbaae91c07722178ed6b0d3aa3b578c8cc4edfe3a84',
      },
    },
  }))
  const response = await fetch('https://api.na.mabibase.com/graphql', {
    headers,
    body: JSON.stringify(body),
    method: 'POST',
    // cache: "force-cache",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }

  const data = await response.json()
  const schema = z.array(
    z.object({
      data: z.object({
        auctionHouse: z.object({
          total: z.number(),
          results: z.array(auctionHouseListing),
        }),
      }),
    })
  )

  return schema.parse(data).map((data) => data.data.auctionHouse)
}

const auctionHouseListing = z.object({
  key: z.object({
    id: z.string(),
  }),
  endDate: z.string(),
  itemName: z.string(),
  listedDate: z.string(),
  listingId: z.number(),
  price1: z.number(),
  price2: z.number(),
  type: z.string(),
  itemInfo: z.unknown(),
})

export type AuctionHouseListing = z.infer<typeof auctionHouseListing>
