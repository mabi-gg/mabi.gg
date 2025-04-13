import { inferRouterContext } from '@trpc/server'
import { type AppRouter, appRouter } from '../app-router'
import { createCallerFactory } from '../trpc'

const callerFactory = createCallerFactory(appRouter)

export function createCaller(
  context: inferRouterContext<AppRouter>,
  signal?: AbortSignal | null
) {
  return callerFactory(context, { signal: signal ?? undefined })
}
