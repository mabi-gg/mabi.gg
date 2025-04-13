import {
  FetchCreateContextFn,
  fetchRequestHandler,
} from '@trpc/server/adapters/fetch'
import { appRouter, AppRouter } from '../app-router'

interface CreateHandlerOptions {
  endpoint: string
  createContext: FetchCreateContextFn<AppRouter>
}

export function createFetchHandler({
  endpoint,
  createContext,
}: CreateHandlerOptions) {
  return async (request: Request): Promise<Response> => {
    return await fetchRequestHandler({
      endpoint,
      req: request,
      router: appRouter,
      createContext,
    })
  }
}
