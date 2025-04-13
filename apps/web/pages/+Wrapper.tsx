import React from 'react'
import { Providers } from '../components/providers'

export { Wrapper }

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
