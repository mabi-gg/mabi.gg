import { useTRPC } from '@mabigg/data-access'
import { Button } from '@mabigg/ui/components/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@mabigg/ui/components/navigation-menu'
import { cn } from '@mabigg/ui/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import { isNonNullish } from '../../../packages/utils/src/utils'
import { DiscordSignin } from '../components/discord-signin'
import { QuickItemSearch } from '../components/quick-item-search/quick-item-search'
import { ThemeSwitcher } from '../components/theme-switcher'
import { UserMenu } from '../components/user-menu'
import './styles.css'

export function Layout({ children }: { children: React.ReactNode }) {
  const { urlPathname } = usePageContext()
  const [quickSearchOpen, setQuickSearchOpen] = useState(false)
  return (
    <>
      <Config
        title="mabi.gg"
        description="Mabinogi guides, tools, and resources."
      />
      <QuickItemSearch
        open={quickSearchOpen}
        onOpenChange={setQuickSearchOpen}
      />
      <header className="h-(--app-shell-header-height) bg-backdrop sticky top-0 z-50 flex shrink-0 items-center border-b">
        <div className="flex items-center px-6">
          <h1 className="text-xl">mabi.gg</h1>
        </div>
        <div className="flex flex-1 items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <NavigationMenuLink
                    data-active={
                      link.url === '/'
                        ? urlPathname === link.url
                        : urlPathname.startsWith(link.url)
                    }
                    href={link.url}
                    className={navigationMenuTriggerStyle()}
                  >
                    {link.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            variant="outline"
            onClick={() => {
              setQuickSearchOpen(true)
            }}
          >
            Search
            <span className="text-muted-foreground ml-auto text-xs tracking-widest">
              ⌘K
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-4 px-4">
          <ThemeSwitcher />
          <Suspense>
            <UserSection />
          </Suspense>
        </div>
      </header>
      <div
        id="mabigg-loading-bar"
        aria-hidden
        className={cn(
          'top-(--app-shell-header-height) absolute h-1.5 w-full overflow-hidden opacity-0 transition-opacity delay-1000'
        )}
      >
        <div className="animate-loading-bar h-full w-full origin-[left_center] bg-rose-300" />
      </div>
      <main>{children}</main>
    </>
  )
}

function UserSection() {
  const trpc = useTRPC()
  const { data: user } = useSuspenseQuery(
    trpc.user.me.queryOptions(undefined, { staleTime: Infinity })
  )
  return user ? <UserMenu /> : <DiscordSignin />
}

const navLinks = [
  { title: 'Home', url: '/' },
  { title: 'Items', url: '/items' },
  import.meta.env.DEV ? { title: 'Bartering', url: '/bartering' } : undefined,
  { title: 'Guides', url: '/guides' },
].filter((i) => isNonNullish(i))
