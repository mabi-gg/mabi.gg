import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { AppRouter } from '@mabigg/trpc'

const trpcContext = createTRPCContext<AppRouter>()

export const { TRPCProvider, useTRPC, useTRPCClient } = trpcContext
