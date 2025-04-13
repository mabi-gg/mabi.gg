import type { TRPCClient } from '@trpc/client'
import type { AppRouter } from '../server/app-router'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export type AppRouterClient = TRPCClient<AppRouter>

export type AppRouterInput = inferRouterInputs<AppRouter>
export type AppRouterOutput = inferRouterOutputs<AppRouter>
export { type AppRouter } from '../server/app-router'
