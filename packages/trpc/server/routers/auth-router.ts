import { publicProcedure } from '../procedures/public-procedure'
import { router } from '../trpc'

export const authRouter = router({
  csrfToken: publicProcedure.query(async ({ ctx }) => {
    return await ctx.auth.getCsrfToken()
  }),
  providers: publicProcedure.query(async ({ ctx }) => {
    const providers = await ctx.auth.getProviders()
    const discord = providers['discord']
    if (!discord) {
      throw new Error('Discord provider not found')
    }
    return {
      discord,
    }
  }),
})
