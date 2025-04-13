import { useTRPC } from '@mabigg/data-access'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@mabigg/ui/components/command'
import { compareItems, rankings, rankItem } from '@tanstack/match-sorter-utils'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import React, { useMemo } from 'react'
import { navigate } from 'vike/client/router'

interface Props {
  open?: boolean
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>
}

export function QuickItemSearch({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const [searchText, setSearchText] = React.useState('')

  const debouncedSearchText = useDebounce(searchText, 500)

  const trpc = useTRPC()

  const itemNames = useQuery(
    trpc.item.allNames.queryOptions(undefined, {
      enabled: open,
    })
  )

  const results = useMemo(() => {
    return (
      itemNames.data?.items
        .map((item) => ({
          ...item,
          ranking: rankItem(item.name, debouncedSearchText, {
            threshold: rankings.MATCHES,
          }),
        }))
        .filter((i) => i.ranking.passed)
        .sort((a, b) => compareItems(a.ranking, b.ranking))
        .filter((e, i, a) => a.findIndex((x) => x.name === e.name) === i)
        .slice(0, 20) ?? []
    )
  }, [debouncedSearchText, itemNames.data?.items])

  return (
    <CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
      <CommandInput
        value={searchText}
        onInput={(e) => {
          setSearchText(e.currentTarget.value)
        }}
        placeholder="Search items"
      />
      <CommandList>
        <CommandEmpty>
          {itemNames.isFetching || searchText !== debouncedSearchText
            ? 'Loading...'
            : 'No items found'}
        </CommandEmpty>
        <CommandGroup heading="Results">
          {results.map((item) => (
            <CommandItem
              onSelect={() => {
                navigate(`/items/${item.itemId}`)
                setOpen(false)
              }}
              key={item.itemId}
            >
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
