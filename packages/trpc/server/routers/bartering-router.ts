import { z } from 'zod'
import { publicProcedure } from '../procedures/public-procedure'
import { router } from '../trpc'
import { commerceLocationSchema } from './bartering/data-schema'

export const barteringRouter = router({
  locations: publicProcedure.query(async () => {
    const data = await import('./bartering/barter-data.json').then(
      (m) => m.default
    )
    const locations = z.array(commerceLocationSchema).parse(data)
    return {
      locations,
    }
  }),
})
