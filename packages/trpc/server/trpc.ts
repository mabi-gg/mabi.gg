import { initTRPC } from '@trpc/server'
import { Context } from './Context'

const t = initTRPC.context<Context>().create()

export const { procedure, router, createCallerFactory } = t
