import { AuthConfig } from '@auth/core'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import DiscordProvider from '@auth/core/providers/discord'
import { Ctx } from '../server'

export const getAuthConfig = async (ctx: Ctx) => {
  const adapter = DrizzleAdapter(ctx.get('drizzle'))
  return {
    basePath: '/auth',
    trustHost: true,
    secret: import.meta.env.AUTH_SECRET,
    adapter,
    providers: [
      DiscordProvider({
        clientId: import.meta.env.AUTH_DISCORD_ID,
        clientSecret: import.meta.env.AUTH_DISCORD_SECRET,
      }),
    ],
    callbacks: {
      session: ({ session }) => {
        return {
          expires: session?.expires,
          user: session?.user && {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          },
        }
      },
    },
  } satisfies AuthConfig
}
