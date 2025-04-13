import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TRPCProvider } from '@mabigg/data-access'
import { usePageContext } from 'vike-react/usePageContext'
import { createHttpClient } from '@mabigg/trpc/client'

export function Providers({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const queryClient = useQueryClient()

  const [trpcClient] = useState(() =>
    import.meta.env.SSR
      ? pageContext.trpcClient!
      : createHttpClient('/api/trpc')
  )

  return (
    <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProvider>
  )
}
