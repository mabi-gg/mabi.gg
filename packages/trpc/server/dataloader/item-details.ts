import { isNonNullish, uniqueBy } from '@mabigg/utils'
import DataLoader from 'dataloader'
import { Context } from '../Context'
import {
  craftingFinishMaterialTable,
  craftingFinishTable,
  craftingMaterialTable,
  craftingTable,
  itemTable,
  productionMaterialTable,
  productionTable,
} from '@mabigg/db'
import { and, eq, inArray, sql } from 'drizzle-orm'

export function getItemDetailsDataLoader(ctx: Context) {
  const itemDetailsLoader = new DataLoader(
    async (itemIds: readonly number[]) => {
      const uniqueIds = itemIds.slice().filter(uniqueBy((i) => i))
      const { db } = ctx
      const items = db
        .select({
          itemId: itemTable.itemId,
          iconUrl: itemTable.iconUrl,
          bookUrl: itemTable.bookUrl,
          name: itemTable.name,
          type: itemTable.type,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
        })
        .from(itemTable)
        .where(inArray(itemTable.itemId, uniqueIds))
        .as('items')

      const productionMaterials = db
        .select({
          itemId: itemTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          type: itemTable.type,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: productionMaterialTable.quantity,
          productionId: productionMaterialTable.productionId,
          producedItemId: productionMaterialTable.producedItemId,
        })
        .from(productionMaterialTable)
        .leftJoin(
          itemTable,
          eq(productionMaterialTable.itemId, itemTable.itemId)
        )
        .where(inArray(productionMaterialTable.producedItemId, uniqueIds))
        .as('productionMaterials')

      const craftingMaterials = db
        .select({
          itemId: itemTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          type: itemTable.type,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: craftingMaterialTable.quantity,
          craftingId: craftingMaterialTable.craftingId,
          producedItemId: craftingMaterialTable.producedItemId,
        })
        .from(craftingMaterialTable)
        .leftJoin(itemTable, eq(craftingMaterialTable.itemId, itemTable.itemId))
        .where(inArray(craftingMaterialTable.producedItemId, uniqueIds))
        .as('craftingMaterials')

      const craftingFinishMaterials = db
        .select({
          itemId: itemTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          type: itemTable.type,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: craftingFinishMaterialTable.quantity,
          craftingFinishId: craftingFinishMaterialTable.craftingFinishId,
          producedItemId: craftingFinishMaterialTable.producedItemId,
          craftingId: craftingFinishMaterialTable.craftingId,
        })
        .from(craftingFinishMaterialTable)
        .leftJoin(
          itemTable,
          eq(craftingFinishMaterialTable.itemId, itemTable.itemId)
        )
        .where(inArray(craftingFinishMaterialTable.producedItemId, uniqueIds))
        .as('craftingFinishMaterials')

      const usedToProduce = db
        .select({
          itemId: productionMaterialTable.producedItemId,
          materialId: productionMaterialTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          rank: productionTable.rank,
          type: productionTable.type,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: productionMaterialTable.quantity,
        })
        .from(productionMaterialTable)
        .leftJoin(
          itemTable,
          eq(productionMaterialTable.producedItemId, itemTable.itemId)
        )
        .leftJoin(
          productionTable,
          and(
            eq(
              productionMaterialTable.productionId,
              productionTable.productionId
            ),
            eq(
              productionMaterialTable.producedItemId,
              productionTable.producedItemId
            )
          )
        )
        .where(inArray(productionMaterialTable.itemId, uniqueIds))
        .as('usedToProduce')

      const usedToCraft = db
        .select({
          itemId: craftingMaterialTable.producedItemId,
          materialId: craftingMaterialTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          type: craftingTable.type,
          rank: craftingTable.rank,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: craftingMaterialTable.quantity,
        })
        .from(craftingMaterialTable)
        .leftJoin(
          itemTable,
          eq(craftingMaterialTable.producedItemId, itemTable.itemId)
        )
        .leftJoin(
          craftingTable,
          and(
            eq(craftingMaterialTable.craftingId, craftingTable.craftingId),
            eq(
              craftingMaterialTable.producedItemId,
              craftingTable.producedItemId
            )
          )
        )
        .where(inArray(craftingMaterialTable.itemId, uniqueIds))
        .as('usedToCraft')

      const usedToFinishCraft = db
        .select({
          itemId: craftingFinishMaterialTable.producedItemId,
          materialId: craftingFinishMaterialTable.itemId,
          name: itemTable.name,
          iconUrl: itemTable.iconUrl,
          type: craftingTable.type,
          rank: craftingTable.rank,
          description: itemTable.description,
          wikiPage: itemTable.wikiPage,
          quantity: craftingFinishMaterialTable.quantity,
        })
        .from(craftingFinishMaterialTable)
        .leftJoin(
          itemTable,
          eq(craftingFinishMaterialTable.producedItemId, itemTable.itemId)
        )
        .leftJoin(
          craftingTable,
          and(
            eq(
              craftingFinishMaterialTable.craftingId,
              craftingTable.craftingId
            ),
            eq(
              craftingFinishMaterialTable.producedItemId,
              craftingTable.producedItemId
            )
          )
        )
        .where(inArray(craftingFinishMaterialTable.itemId, uniqueIds))
        .as('usedToFinishCraft')

      const itemsWithDetails = db
        .with(
          items,
          productionMaterials,
          craftingMaterials,
          craftingFinishMaterials
        )
        .select({
          itemId: items.itemId,
          name: items.name,
          iconUrl: items.iconUrl,
          bookUrl: items.bookUrl,
          type: items.type,
          description: items.description,
          wikiPage: items.wikiPage,
          production: {
            productionId: productionTable.productionId,
            producedItemId: productionTable.producedItemId,
            type: productionTable.type,
            rank: productionTable.rank,
          },
          productionMaterials: {
            itemId: productionMaterials.itemId,
            name: productionMaterials.name,
            iconUrl: productionMaterials.iconUrl,
            type: productionMaterials.type,
            description: productionMaterials.description,
            wikiPage: productionMaterials.wikiPage,
            quantity: productionMaterials.quantity,
          },
          crafting: {
            craftingId: craftingTable.craftingId,
            producedItemId: craftingTable.producedItemId,
            type: craftingTable.type,
            rank: craftingTable.rank,
            maxProgress: craftingTable.maxProgress,
          },
          craftingMaterials: {
            itemId: craftingMaterials.itemId,
            name: craftingMaterials.name,
            iconUrl: craftingMaterials.iconUrl,
            type: craftingMaterials.type,
            description: craftingMaterials.description,
            wikiPage: craftingMaterials.wikiPage,
            quantity: craftingMaterials.quantity,
          },
          craftingFinishes: {
            craftingFinishId: craftingFinishTable.craftingFinishId,
            color1: craftingFinishTable.color1,
            color2: craftingFinishTable.color2,
            color3: craftingFinishTable.color3,
          },
          craftingFinishMaterials: {
            itemId: craftingFinishMaterials.itemId,
            name: craftingFinishMaterials.name,
            iconUrl: craftingFinishMaterials.iconUrl,
            type: craftingFinishMaterials.type,
            description: craftingFinishMaterials.description,
            wikiPage: craftingFinishMaterials.wikiPage,
            quantity: craftingFinishMaterials.quantity,
          },
        })
        .from(items)
        .leftJoin(
          productionTable,
          eq(items.itemId, productionTable.producedItemId)
        )
        .leftJoin(
          productionMaterials,
          and(
            eq(
              productionTable.producedItemId,
              productionMaterials.producedItemId
            ),
            eq(productionTable.productionId, productionMaterials.productionId)
          )
        )
        .leftJoin(craftingTable, eq(items.itemId, craftingTable.producedItemId))
        .leftJoin(
          craftingMaterials,
          and(
            eq(craftingTable.producedItemId, craftingMaterials.producedItemId),
            eq(craftingTable.craftingId, craftingMaterials.craftingId)
          )
        )
        .leftJoin(
          craftingFinishTable,
          and(
            eq(items.itemId, craftingFinishTable.producedItemId),
            eq(craftingTable.craftingId, craftingFinishTable.craftingId)
          )
        )
        .leftJoin(
          craftingFinishMaterials,
          and(
            eq(
              craftingFinishTable.producedItemId,
              craftingFinishMaterials.producedItemId
            ),
            eq(
              craftingFinishTable.craftingFinishId,
              craftingFinishMaterials.craftingFinishId
            )
          )
        )
        .where(inArray(items.itemId, uniqueIds))

      type Relationship = 'usedToCraft' | 'usedToProduce' | 'usedToFinishCraft'

      const dependentItems = await Promise.all([
        db
          .with(usedToCraft)
          .select({
            itemId: usedToCraft.itemId,
            name: usedToCraft.name,
            iconUrl: usedToCraft.iconUrl,
            type: usedToCraft.type,
            rank: usedToCraft.rank,
            description: usedToCraft.description,
            wikiPage: usedToCraft.wikiPage,
            quantity: usedToCraft.quantity,
            materialId: usedToCraft.materialId,
            relationship: sql<Relationship>`'usedToCraft'`.as('relationship'),
          })
          .from(usedToCraft),
        db
          .with(usedToProduce)
          .select({
            itemId: usedToProduce.itemId,
            name: usedToProduce.name,
            iconUrl: usedToProduce.iconUrl,
            type: usedToProduce.type,
            rank: usedToProduce.rank,
            description: usedToProduce.description,
            wikiPage: usedToProduce.wikiPage,
            quantity: usedToProduce.quantity,
            materialId: usedToProduce.materialId,
            relationship: sql<Relationship>`'usedToProduce'`.as('relationship'),
          })
          .from(usedToProduce),
        db
          .with(usedToFinishCraft)
          .select({
            itemId: usedToFinishCraft.itemId,
            name: usedToFinishCraft.name,
            iconUrl: usedToFinishCraft.iconUrl,
            type: usedToFinishCraft.type,
            rank: usedToFinishCraft.rank,
            description: usedToFinishCraft.description,
            wikiPage: usedToFinishCraft.wikiPage,
            quantity: usedToFinishCraft.quantity,
            materialId: usedToFinishCraft.materialId,
            relationship: sql<Relationship>`'usedToFinishCraft'`.as(
              'relationship'
            ),
          })
          .from(usedToFinishCraft),
      ]).then((result) => {
        return [...result[0], ...result[1], ...result[2]]
      })

      const result = await itemsWithDetails
      const data = await Promise.all(
        result.filter(uniqueBy((r) => r.itemId)).map(async (item) => {
          const resultItems = result.filter((r) => r.itemId === item.itemId)

          const usedIn = {
            usedToCraft: dependentItems
              .filter(
                (r) =>
                  r.materialId === item.itemId &&
                  r.relationship === 'usedToCraft'
              )
              .map(({ relationship, materialId, ...r }) => ({
                ...r,
                name: r.name ?? '',
                description: r.description ?? '',
                type: r.type ?? '',
                rank: r.rank ?? '',
              }))
              .filter(uniqueBy((i) => i.itemId)),
            usedToFinishCraft: dependentItems
              .filter(
                (r) =>
                  r.materialId === item.itemId &&
                  r.relationship === 'usedToFinishCraft'
              )
              .map(({ relationship, materialId, ...r }) => ({
                ...r,
                isFinish: true,
                name: r.name ?? '',
                description: r.description ?? '',
                type: r.type ?? '',
                rank: r.rank ?? '',
              }))
              .filter(uniqueBy((i) => i.itemId)),
            usedToProduce: dependentItems
              .filter(
                (r) =>
                  r.materialId === item.itemId &&
                  r.relationship === 'usedToProduce'
              )
              .map(({ relationship, materialId, ...r }) => ({
                ...r,
                name: r.name ?? '',
                description: r.description ?? '',
                type: r.type ?? '',
                rank: r.rank ?? '',
              }))
              .filter(uniqueBy((i) => i.itemId)),
          }

          return {
            itemId: item.itemId,
            name: item.name,
            type: item.type,
            iconUrl: item.iconUrl,
            bookUrl: item.bookUrl,
            description: item.description,
            wikiPage: item.wikiPage,
            production: resultItems
              .map((r) => r.production)
              .filter(isNonNullish)
              .filter(uniqueBy((r) => r.productionId))
              .map((production) => {
                const resultItemsProduction = resultItems.filter(
                  (r) =>
                    r.production?.productionId === production.productionId &&
                    r.production.producedItemId === production.producedItemId
                )
                return {
                  productionId: production.productionId,
                  type: production.type,
                  rank: production.rank,
                  materials: resultItemsProduction
                    .map((r) => r.productionMaterials)
                    .filter((m) => isNonNullish(m?.itemId))
                    .filter(isNonNullish)
                    .filter(uniqueBy((r) => r.itemId))
                    .map(
                      (i) =>
                        i as {
                          [P in keyof typeof i]: NonNullable<(typeof i)[P]>
                        }
                    ),
                }
              }),
            crafting: resultItems
              .map((r) => r.crafting)
              .filter(isNonNullish)
              .filter(uniqueBy((r) => r.craftingId + r.producedItemId))
              .map((crafting) => {
                const resultItemCrafting = resultItems.filter(
                  (r) =>
                    r.crafting?.craftingId === crafting.craftingId &&
                    r.crafting.producedItemId === crafting.producedItemId
                )
                return {
                  ...crafting,
                  materials: resultItemCrafting
                    .map((r) => r.craftingMaterials)
                    .filter(isNonNullish)
                    .filter(uniqueBy((r) => r.itemId))
                    .map(
                      (i) =>
                        i as {
                          [P in keyof typeof i]: NonNullable<(typeof i)[P]>
                        }
                    ),

                  finishes: resultItemCrafting
                    .map((r) => r.craftingFinishes)
                    .filter(isNonNullish)
                    .filter(uniqueBy((r) => r.craftingFinishId))
                    .map((finish) => {
                      const resultItemCraftingFinish =
                        resultItemCrafting.filter(
                          (r) =>
                            r.craftingFinishes?.craftingFinishId ===
                            finish.craftingFinishId
                        )
                      return {
                        finishId: finish.craftingFinishId,
                        color1: finish.color1,
                        color2: finish.color2,
                        color3: finish.color3,
                        materials: resultItemCraftingFinish
                          .map((f) => f.craftingFinishMaterials)
                          .filter(isNonNullish)
                          .filter(uniqueBy((m) => m.itemId))
                          .map(
                            (i) =>
                              i as {
                                [P in keyof typeof i]: NonNullable<
                                  (typeof i)[P]
                                >
                              }
                          ),
                      }
                    }),
                }
              }),
            usedIn: usedIn.usedToCraft.concat(
              usedIn.usedToFinishCraft,
              usedIn.usedToProduce
            ),
          }
        })
      )

      return itemIds.map((itemId) => {
        const item = data.find((r) => r.itemId === itemId)
        if (!item) {
          return null
        }
        return item
      })
    }
  )

  return itemDetailsLoader
}
