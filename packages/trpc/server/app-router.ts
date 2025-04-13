import { z } from 'zod'
import { publicProcedure } from './procedures/public-procedure'
import { router } from './trpc'
import { userRouter } from './routers/user-router'
import { authRouter } from './routers/auth-router'
import { adminRouter } from './routers/admin-router'
import { itemRouter } from './routers/item-router'
import { auctionHouseRouter } from './routers/auction-house-router'
import { barteringRouter } from './routers/bartering-router'

export const appRouter = router({
  greet: publicProcedure
    .input(z.object({ name: z.string(), delay: z.number().optional() }))
    .query(async ({ input: { name, delay }, signal }) => {
      if (delay) {
        let ms = 0
        while (ms < delay) {
          signal?.throwIfAborted()
          ms += 1000
          await new Promise((resolve) => setTimeout(resolve, 1000))
          // eslint-disable-next-line no-console
          console.log(`waiting ${ms}ms`)
        }
      }
      return `Hello ${name}!`
    }),
  user: userRouter,
  auth: authRouter,
  admin: adminRouter,
  auctionHouse: auctionHouseRouter,
  item: itemRouter,
  bartering: barteringRouter,
})

export type AppRouter = typeof appRouter
