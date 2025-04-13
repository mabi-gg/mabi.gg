import { AppRouterOutput } from '@mabigg/trpc'

export type ItemDetails = NonNullable<AppRouterOutput['item']['details']>
export type AuctionHouseListing =
  AppRouterOutput['auctionHouse']['listings']['results'][number]
