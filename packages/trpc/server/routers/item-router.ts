import { itemTable } from '@mabigg/db'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { publicProcedure } from '../procedures/public-procedure'
import { router } from '../trpc'

export const itemRouter = router({
  allNames: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx
    const result = await db
      .select({
        itemId: itemTable.itemId,
        name: itemTable.name,
      })
      .from(itemTable)

    return {
      items: result,
      total: result.length,
    }
  }),
  list: publicProcedure
    .input(
      z.object({
        pageIndex: z.number().nullish(),
        pageSize: z.number().nullish(),
        searchText: z.string().nullish(),
        types: z.array(z.string()).nullish(),
        sort: z
          .array(
            z.object({
              id: z.string(),
              direction: z.enum(['asc', 'desc']),
            })
          )
          .nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx
      let query = db
        .select({
          item: {
            itemId: itemTable.itemId,
            name: itemTable.name,
            description: itemTable.description,
            iconUrl: itemTable.iconUrl,
            wikiPage: itemTable.wikiPage,
            type: itemTable.type,
          },
          total: {
            count: sql<number>`count(*) over()`.as('count'),
          },
        })
        .from(itemTable)
        .$dynamic()

      query = query.where(
        and(
          eq(itemTable.deleted, false),
          eq(itemTable.hidden, false),
          input.searchText
            ? sql`${itemTable.name} LIKE ${`%${input.searchText}%`}`
            : undefined,
          input.types ? inArray(itemTable.type, input.types) : undefined
        )
      )

      if (input.sort) {
        for (const sort of input.sort) {
          query = query.orderBy(
            (i) =>
              sql`${i.item[sort.id as keyof typeof i.item]} ${sql.raw(
                sort.direction
              )}`
          )
        }
      }

      const pageSize = input.pageSize ?? 25
      const pageIndex = input.pageIndex ?? 0

      query = query.limit(pageSize).offset(pageIndex * pageSize)
      const result = await query
      return {
        items: result.map((r) => r.item),
        total: result.find(Boolean)?.total.count ?? 0,
      }
    }),
  itemTypes: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx
    const itemTypes = await db
      .select({
        type: itemTable.type,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(itemTable)
      .groupBy(itemTable.type)

    return itemTypes
  }),
  details: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input: { itemId }, ctx }) => {
      return ctx.dataLoaders.itemDetails.load(itemId)
    }),
})
