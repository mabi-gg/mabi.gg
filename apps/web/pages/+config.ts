import vikeCloudflare from 'vike-cloudflare/config'
import vikeReactQuery from 'vike-react-query/config'
import vikeReact from 'vike-react/config'
import { Config } from 'vike/types'

export default {
  extends: [vikeCloudflare, vikeReact, vikeReactQuery],
  stream: 'web',
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
  },
  passToClient: ['colorScheme'],
  server: {
    entry:
      process.env.DEV_PROXY === 'true' ? 'server/dev.ts' : 'server/index.ts',
  },
} satisfies Config
