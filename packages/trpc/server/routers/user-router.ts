import { authProcedure } from '../procedures/public-procedure'
import { router } from '../trpc'

export const userRouter = router({
  me: authProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),
})
