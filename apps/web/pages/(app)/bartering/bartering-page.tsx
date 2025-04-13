import { useTRPC } from '@mabigg/data-access'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

export function BarteringPage() {
  const trpc = useTRPC()
  const result = useSuspenseQuery(trpc.bartering.locations.queryOptions())
  const locations = result.data.locations
  return (
    <div className="p-4">
      <div>
        {locations.map((location) => (
          <div key={location.location} className="p-2">
            <div>{location.location}</div>
            <div className="p-2">
              {location.goods.map((good) => (
                <div key={good.name}>
                  <div>{good.name}</div>
                  <div className="p-2">
                    {good.items.map((item) => (
                      <div key={item.itemId}>
                        <ItemInfo itemId={item.itemId} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemInfo({ itemId }: { itemId: number }) {
  const trpc = useTRPC()
  const query = useQuery(trpc.item.details.queryOptions({ itemId }))
  const item = query.data
  if (!item) {
    return
  }
  return (
    <div>
      <div>{item.name}</div>
      <div>Item ID: {itemId}</div>
      <div className="p-2">
        {item.crafting.map((crafting) => (
          <div key={crafting.craftingId}>
            <div>{crafting.type}</div>
            <div>{crafting.rank}</div>
            <div>{crafting.maxProgress}</div>
            <div className="p-2">
              {crafting.materials.map((material) => (
                <div key={material.itemId}>
                  <ItemInfo itemId={material.itemId} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {item.production.map((production) => (
          <div key={production.productionId}>
            <div>{production.type}</div>
            <div>{production.rank}</div>
            <div className="p-2">
              {production.materials.map((material) => (
                <div key={material.itemId}>
                  {material.name} ({material.quantity})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
