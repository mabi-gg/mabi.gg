import { usersTable, userRoleTable } from '@mabigg/db'
import { eq } from 'drizzle-orm'
import { procedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { getItemDetailsDataLoader } from '../dataloader/item-details'

export const publicProcedure = procedure.use(async (opts) => {
  return opts.next({
    ctx: {
      ...opts.ctx,
      dataLoaders: {
        itemDetails: getItemDetailsDataLoader(opts.ctx),
      },
    },
  })
})

export const authProcedure = procedure.use(async (opts) => {
  const userResult = opts.ctx.session?.user?.id
    ? await opts.ctx.db
        .select({
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            image: usersTable.image,
          },
          role: {
            role: userRoleTable.role,
          },
        })
        .from(usersTable)
        .leftJoin(userRoleTable, eq(usersTable.id, userRoleTable.userId))
        .where(eq(usersTable.id, opts.ctx.session.user.id))
        .limit(1)
    : null

  const user = userResult?.[0]?.user
  const roles = userResult
    ?.map((info) => info.role?.role)
    .filter((r) => typeof r === 'string')

  return opts.next({
    ctx: {
      ...opts.ctx,
      user: user ? { ...user, roles } : null,
    },
  })
})

export const adminProcedure = authProcedure.use(async (opts) => {
  if (!opts.ctx.user?.roles?.includes('admin')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }

  return opts.next(opts)
})

export const auctionHouseProcedure = authProcedure.use(
  async ({ ctx, next }) => {
    // if (!ctx.?.includes("auctionHouse.read")) {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: "You do not have permission to access this resource.",
    //   });
    // }

    return next({
      ctx,
    })
  }
)
