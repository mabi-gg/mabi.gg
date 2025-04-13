import { Button } from '@mabigg/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@mabigg/ui/components/dropdown-menu'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePageContext } from 'vike-react/usePageContext'

export function ThemeSwitcher() {
  const pageContext = usePageContext()

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    const mediaQuery = matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSystemTheme('dark')
      } else {
        setSystemTheme('light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    if (mediaQuery.matches) {
      setSystemTheme('dark')
    } else {
      setSystemTheme('light')
    }
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const [preferredTheme, setPreferredTheme] = useState<'light' | 'dark' | null>(
    pageContext.colorScheme
  )

  const theme = preferredTheme ?? systemTheme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {theme === 'light' ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={preferredTheme ?? 'system'}
          onValueChange={(value) => {
            const nextTheme =
              value === 'light' ? 'light' : value === 'dark' ? 'dark' : null

            if (nextTheme === null) {
              delete document.documentElement.dataset.theme
            } else {
              document.documentElement.dataset.theme = nextTheme
            }

            // eslint-disable-next-line unicorn/no-document-cookie
            document.cookie = `theme=${nextTheme ?? ''}`

            setPreferredTheme(nextTheme)
          }}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
