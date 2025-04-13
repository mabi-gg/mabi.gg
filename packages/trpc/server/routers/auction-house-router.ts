import DataLoader from 'dataloader'
import { z } from 'zod'
import { auctionHouseSearch } from '../utils/auction-house-search'
import { router } from '../trpc'
import { auctionHouseProcedure } from '../procedures/public-procedure'

const auctionHouseLoader = new DataLoader(
  async (itemIds: readonly number[]) => {
    return await auctionHouseSearch({ itemIds: itemIds.slice() })
  }
)

export const auctionHouseRouter = router({
  bulkListings: auctionHouseProcedure
    .input(z.object({ itemIds: z.array(z.number()) }))
    .query(async ({ input: { itemIds } }) => {
      return auctionHouseLoader.loadMany(itemIds)
    }),
  listings: auctionHouseProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input: { itemId } }) => {
      return auctionHouseLoader.load(itemId)
    }),
})
