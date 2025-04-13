import { ItemDetails as ItemDetailsType, useTRPC } from '@mabigg/data-access'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mabigg/ui/components/card'
import { ScrollArea } from '@mabigg/ui/components/scroll-area'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { render } from 'vike/abort'
import { AuctionHouseCard } from './tables/auction-house-card'
import { CraftingCard } from './tables/crafting-card'
import { ItemUsesCard } from './tables/item-uses-card'
import { ProductionCard } from './tables/production-card'

import { Fragment, JSX } from 'react'
import { Config } from 'vike-react/Config'
import { Button } from '@mabigg/ui/components/button'

interface Props {
  itemId: number
}
export function ItemDetails({ itemId }: Props) {
  const auctionHouseQuery = useAuctionHouseQuery(itemId)
  const trpc = useTRPC()
  const itemQuery = useSuspenseQuery(
    trpc.item.details.queryOptions({
      itemId,
    })
  )

  const item = itemQuery.data

  if (!item) {
    throw render(404)
  }

  const infoCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-end justify-between gap-2">
          <div className="text-xl">{item.name}</div>
          <div
            style={{
              width: 48,
              height: 48,
            }}
          >
            <img
              key={item.itemId}
              src={`/icons/${item.itemId}.png`}
              alt={``}
              className="h-full w-full object-contain"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardDescription>{item.description}</CardDescription>
        <div className='flex items-center justify-end'>
          {item.wikiPage ? (
            <Button size="sm" asChild variant="link">
              <a href={`https://wiki.mabinogiworld.com/view/${item.wikiPage}`}>
                Wiki
              </a>
            </Button>
          ) : null}
          <Button size="sm" asChild variant="link">
            <a href={`https://na.mabibase.com/item/${item.itemId}`}>Mabibase</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const rawDataCard = (
    <Card className="hidden lg:flex">
      <CardHeader>
        <CardTitle>Raw Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] max-w-[400px]">
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )

  const productionCards = item.production.map((production) => {
    return (
      <ProductionCard key={production.productionId} production={production} />
    )
  })

  const craftingCards = item.crafting.map((crafting) => {
    return <CraftingCard key={crafting.craftingId} crafting={crafting} />
  })

  const itemUsesCard =
    item.usedIn.length > 0 ? <ItemUsesCard data={item.usedIn} /> : undefined

  const bookCard = item.bookUrl ? (
    <Card>
      <CardHeader>
        <CardTitle>Book contents</CardTitle>
      </CardHeader>
      <CardContent>
        <iframe
          className="w-full rounded-md bg-slate-400"
          src={item.bookUrl}
          height={500}
        />
      </CardContent>
    </Card>
  ) : undefined

  const auctionHouseCard = (
    <AuctionHouseCard
      listings={auctionHouseQuery.data?.results ?? []}
      isLoading={auctionHouseQuery.isLoading}
    />
  )

  const column = (...cards: (JSX.Element | undefined)[]) => {
    if (cards.every((card) => !card)) {
      return null
    }

    return (
      <div className="flex w-full max-w-4xl flex-col gap-2 lg:gap-4">
        {cards.map((card, idx) => (
          <Fragment key={idx}>{card}</Fragment>
        ))}
      </div>
    )
  }

  const allCards = [
    ...productionCards,
    ...craftingCards,
    itemUsesCard,
    bookCard,
    auctionHouseCard,
  ]

  const firstColCards = [
    ...productionCards,
    ...craftingCards,
    itemUsesCard,
  ].filter(Boolean)

  if (firstColCards.length < 2) {
    firstColCards.push(bookCard)
  }

  return (
    <div className="flex flex-col gap-2 p-2 lg:flex-row lg:gap-4 lg:p-4">
      <Config
        title={`${item.name} | Mabi.gg`}
        description={`A detailed view of the item "${item.name}" in Mabinogi.`}
        image={`/icons/${item.itemId}.png`}
      />
      <div className="flex flex-col gap-2 lg:max-w-sm lg:gap-4">
        {infoCard}
        {rawDataCard}
      </div>

      {/* main body */}
      <div className="flex grow flex-col gap-2 lg:gap-4 2xl:flex-row">
        {column(...firstColCards)}
        {column(...allCards.filter((i) => !firstColCards.includes(i)))}
      </div>
    </div>
  )
}

function useAuctionHouseQuery(itemId: number) {
  const trpc = useTRPC()
  return useQuery(
    trpc.auctionHouse.listings.queryOptions({
      itemId,
    })
  )
}
export type ItemUseMetadata = ItemDetailsType['usedIn'][number]
