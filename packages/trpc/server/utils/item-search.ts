import { z } from 'zod'

interface Options {
  pageSize: number
  pageIndex: number
}

export async function itemSearch({ pageIndex, pageSize }: Options) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  const body = [
    {
      operationName: 'itemSearch',
      variables: { filters: [], pagination: { pageSize, pageIndex } },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            'f2e61a897268bf8e39bbc090e4b8d6e285e326f71cd9617a9a2d8aed96aae906',
        },
      },
    },
  ]
  const response = await fetch('https://api.na.mabibase.com/graphql', {
    headers,
    body: JSON.stringify(body),
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }

  const data = await response.json()
  const schema = z
    .array(
      z.object({
        data: z.object({
          items: z.object({
            total: z.number(),
            results: z.array(
              z.object({
                key: z.object({
                  id: z.number(),
                }),
                data: z.any(),
              })
            ),
          }),
        }),
      })
    )
    .length(1)

  const items = schema.parse(data)[0].data.items
  return items
}
