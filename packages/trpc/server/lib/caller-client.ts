/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTRPCClient, type TRPCLink } from '@trpc/client'
import type { AppRouter } from '../app-router'
import type { inferRouterContext } from '@trpc/server'
import { createCaller } from '..'
import { observable } from '@trpc/server/observable'

function createCallerLink(context: inferRouterContext<AppRouter>) {
  const link: TRPCLink<AppRouter> = () => {
    return ({ op }) => {
      const caller: any = createCaller(context, op.signal)
      return observable((observer) => {
        caller[op.path as keyof typeof caller](op.input as string)
          .then((output: unknown) => {
            observer.next({
              result: {
                data: output,
              },
            })
          })
          .catch((error: any) => {
            observer.error(error)
          })
          .finally(() => {
            observer.complete()
          })

        // eslint-disable-next-line unicorn/consistent-function-scoping
        const unsubscribe = () => {
          // noop
        }

        return unsubscribe
      })
    }
  }
  return link
}

export function createCallerClient(context: inferRouterContext<AppRouter>) {
  const callerLink = createCallerLink(context)
  return createTRPCClient<AppRouter>({
    links: [callerLink],
  })
}
