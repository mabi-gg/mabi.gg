import { JSDOM } from 'jsdom'
import { z } from 'zod'

export async function scrapeNextData(id: number) {
  const url = `https://na.mabibase.com/item/${id}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    )
  }
  const html = await response.text()
  const dom = new JSDOM(html)
  const data = dom.window.document.querySelector('#__NEXT_DATA__')
  if (!data) {
    throw new Error('No data')
  }
  const json = JSON.parse(data.innerHTML)
  return z
    .object({
      props: z.object({
        pageProps: z.object({
          item: z.object({
            data: z.unknown(),
            key: z.object({
              id: z.number(),
            }),
          }),
        }),
      }),
    })
    .parse(json).props.pageProps.item
}
