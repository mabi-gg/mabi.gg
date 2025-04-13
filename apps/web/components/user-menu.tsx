import { useTRPC } from '@mabigg/data-access'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@mabigg/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@mabigg/ui/components/dropdown-menu'
import { useSuspenseQuery } from '@tanstack/react-query'

export function UserMenu() {
  const trpc = useTRPC()
  const { data: user } = useSuspenseQuery(
    trpc.user.me.queryOptions(undefined, { staleTime: Infinity })
  )
  const csrfToken = useSuspenseQuery(
    trpc.auth.csrfToken.queryOptions(undefined)
  )

  if (!user) {
    throw new Error('User is not signed in')
  }

  const name = user.name || user.email || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          {user.image && <AvatarImage src={user.image} />}
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Logged in as {name}</DropdownMenuLabel>
        {user.roles?.includes('admin') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin">Admin</a>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="POST">
          <input type="hidden" name="csrfToken" value={csrfToken.data} />
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
