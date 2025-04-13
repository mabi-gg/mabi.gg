/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  craftingFinishMaterialTable,
  craftingFinishTable,
  craftingMaterialTable,
  craftingTable,
  itemTable,
  mabibaseScrapeTable,
  productionMaterialTable,
  productionTable,
  userRoleTable,
  usersTable,
} from '@mabigg/db'
import { adminProcedure } from '../procedures/public-procedure'
import { router } from '../trpc'
import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm'
import { uniqueBy } from '@mabigg/utils'

export const adminRouter = router({
  allUsers: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx
    const result = await db
      .select()
      .from(usersTable)
      .leftJoin(userRoleTable, eq(usersTable.id, userRoleTable.userId))

    return result
      .map((r) => r.user)
      .filter(uniqueBy((r) => r.id))
      .map((user) => ({
        ...user,
        roles: result
          .filter((r) => r.user_role?.userId === user.id)
          .map((r) => r.user_role!.role),
      }))
  }),
  importScrapedItems: adminProcedure.mutation(async ({ ctx }) => {
    const { db } = ctx

    const itemsQuery = db
      .select({
        itemId: mabibaseScrapeTable.id,
        name: sql`${mabibaseScrapeTable.json}->'data'->>'localName'`.as('name'),
        type: sql`${mabibaseScrapeTable.json}->'data'->>'type'`.as('type'),
        description:
          sql`coalesce(${mabibaseScrapeTable.json}->'data'->>'description', '')`.as(
            'description'
          ),
        wikiPage:
          sql`${mabibaseScrapeTable.json}->'data'->'miscData'->>'wikiPage'`.as(
            'wiki_page'
          ),
        iconUrl: sql.raw('null').as('icon_url'),
        bookUrl:
          sql`${mabibaseScrapeTable.json}->'data'->'miscData'->>'bookUrl'`.as(
            'book_url'
          ),
        deleted: sql.raw('false').as('deleted'),
        hidden: sql.raw('false').as('hidden'),
      })
      .from(mabibaseScrapeTable)
      .leftJoin(
        itemTable,
        and(sql`${mabibaseScrapeTable.id} = ${itemTable.itemId}`)
      )
      .groupBy(mabibaseScrapeTable.id, mabibaseScrapeTable.type)
      .where(
        and(
          isNull(itemTable.itemId),
          eq(mabibaseScrapeTable.type, 'MabibaseItemPage'),
          isNotNull(sql`${mabibaseScrapeTable.json}->'data'->>'localName'`),
          isNotNull(sql`${mabibaseScrapeTable.json}->'data'->>'type'`),
          isNotNull(
            sql`${mabibaseScrapeTable.json}->'data'->'miscData'->>'wikiPage'`
          ),
          isNotNull(
            sql`${mabibaseScrapeTable.json}->'data'->'miscData'->>'iconUrl'`
          )
        )
      )

    const insertItems = db.insert(itemTable).select(itemsQuery)
    //   .onConflictDoNothing();

    const insertResult = await insertItems
  }),
  importScrapedMaterials: adminProcedure.mutation(async ({ ctx }) => {
    const { db } = ctx
    const itemWithJson = db
      .select({
        itemId: itemTable.itemId,
        itemJson: mabibaseScrapeTable.json,
      })
      .from(mabibaseScrapeTable)
      .innerJoin(
        itemTable,
        and(
          eq(itemTable.itemId, mabibaseScrapeTable.id),
          eq(mabibaseScrapeTable.type, 'MabibaseItemPage')
        )
      )
      .as('itemWithJson')

    const productionDetails = db
      .with(itemWithJson)
      .select({
        productionId: sql<number>`(productionDetail.value->'key'->>'id')`.as(
          'production_id'
        ),
        producedItemId:
          sql<number>`(productionDetail.value->'key'->>'producedItemId')`.as(
            'produced_item_id'
          ),
        type: sql<string>`productionDetail.value->'key'->>'type'`.as('type'),
        rank: sql<string>`productionDetail.value->'data'->>'rank'`.as('rank'),
        json: sql<string>`productionDetail.value`.as('production_details_json'),
      })
      .from(
        sql`${itemWithJson}, json_each(${itemWithJson.itemJson}->'data'->'productionDetails') as productionDetail`
      )
      .where(
        sql`json_type(${itemWithJson.itemJson}->'data'->'productionDetails') = 'array'`
      )
      .as('productionDetails')

    const productionDetailsValues = await db
      .with(productionDetails)
      .select({
        productionId: productionDetails.productionId,
        producedItemId: productionDetails.producedItemId,
        type: productionDetails.type,
        rank: productionDetails.rank,
      })
      .from(productionDetails)

    for (const value of productionDetailsValues) {
      const insertProductionDetails = db
        .insert(productionTable)
        .values(value)
        .onConflictDoNothing({
          target: [
            productionTable.productionId,
            productionTable.producedItemId,
          ],
        })

      const productionDetailsResult = await insertProductionDetails
    }

    const materials = db
      .with(productionDetails)
      .select({
        productionId: productionDetails.productionId,
        producedItemId: productionDetails.producedItemId,
        itemId: sql<number>`(material.value->'sampleItem'->'key'->>'id')`.as(
          'item_id'
        ),
        quantity: sql<number>`(material.value->>'count')`.as('quantity'),
      })
      .from(
        sql`${productionDetails}, json_each(${productionDetails.json}->'data'->'materials') as material`
      )
      .where(
        sql`json_type(${productionDetails.json}->'data'->'materials') = 'array'`
      )
      .as('materials')

    const productionMaterialsValues = await db
      .with(materials)
      .select({
        productionId: materials.productionId,
        producedItemId: materials.producedItemId,
        itemId: materials.itemId,
        quantity: materials.quantity,
      })
      .from(materials)
      .where(
        and(
          isNotNull(materials.itemId),
          isNotNull(materials.quantity),
          inArray(
            materials.itemId,
            db.select({ itemId: itemTable.itemId }).from(itemTable)
          ),
          inArray(
            materials.producedItemId,
            db.select({ itemId: itemTable.itemId }).from(itemTable)
          )
        )
      )

    for (const value of productionMaterialsValues) {
      const insertProductionMaterials = db
        .insert(productionMaterialTable)
        .values(value)
        .onConflictDoNothing()
      const productionMaterialsResult = await insertProductionMaterials
    }

    const craftingDetails = db
      .with(itemWithJson)
      .select({
        craftingId:
          sql<number>`(${itemWithJson.itemJson}->'data'->'craftingDetails'->'key'->>'id')`.as(
            'crafting_id'
          ),
        producedItemId:
          sql<number>`(${itemWithJson.itemJson}->'data'->'craftingDetails'->'data'->>'producedItemId')`.as(
            'produced_item_id'
          ),
        type: sql<string>`${itemWithJson.itemJson}->'data'->'craftingDetails'->'key'->>'type'`.as(
          'type'
        ),
        rank: sql<string>`${itemWithJson.itemJson}->'data'->'craftingDetails'->'data'->>'rank'`.as(
          'rank'
        ),
        maxProgress:
          sql<number>`(${itemWithJson.itemJson}->'data'->'craftingDetails'->'data'->>'maxProgress')`.as(
            'max_progress'
          ),
        json: sql<string>`${itemWithJson.itemJson}->'data'->'craftingDetails'`.as(
          'crafting_details_json'
        ),
      })
      .from(itemWithJson)
      .where(
        sql`json_type(${itemWithJson.itemJson}->'data'->'craftingDetails') = 'object'`
      )
      .as('craftingDetails')

    const craftingDetailsValue = await db
      .with(craftingDetails)
      .selectDistinct({
        craftingId: craftingDetails.craftingId,
        producedItemId: craftingDetails.producedItemId,
        type: craftingDetails.type,
        rank: craftingDetails.rank,
        maxProgress: craftingDetails.maxProgress,
      })
      .from(craftingDetails)

    for (const value of craftingDetailsValue) {
      const insertCraftingDetails = db
        .insert(craftingTable)
        .values(value)
        .onConflictDoNothing()

      const craftingDetailsResult = await insertCraftingDetails
    }

    const craftingMaterials = db
      .with(craftingDetails)
      .select({
        craftingId: craftingDetails.craftingId,
        producedItemId: craftingDetails.producedItemId,
        itemId: sql<number>`material.value->'sampleItem'->'key'->>'id'`.as(
          'item_id'
        ),
        quantity: sql<number>`material.value->>'count'`.as('quantity'),
      })
      .from(
        sql`${craftingDetails}, json_each(${craftingDetails.json}->'data'->'materials') as material`
      )
      .where(
        and(
          sql`json_type(${craftingDetails.json}->'data'->'materials') = 'array'`,
          isNotNull(sql`(material.value->'sampleItem'->'key'->>'id')`)
        )
      )
      .as('craftingMaterials')

    const craftingMaterialsValues = await db
      .with(craftingMaterials)
      .select({
        craftingId: craftingMaterials.craftingId,
        producedItemId: craftingMaterials.producedItemId,
        itemId: craftingMaterials.itemId,
        quantity: craftingMaterials.quantity,
      })
      .from(craftingMaterials)

    for (const value of craftingMaterialsValues) {
      try {
        const insertCraftingMaterials = db
          .insert(craftingMaterialTable)
          .values(value)
          .onConflictDoNothing()

        const craftingMaterialsResult = await insertCraftingMaterials
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    const craftingFinish = db
      .with(craftingDetails)
      .select({
        craftingFinishId: sql<number>`finishingMaterials.key`.as('finish_id'),
        producedItemId: craftingDetails.producedItemId,
        craftingId: craftingDetails.craftingId,
        color1: sql<number>`(finishingMaterials.value->>'color1')`.as('color1'),
        color2: sql<number>`(finishingMaterials.value->>'color2')`.as('color2'),
        color3: sql<number>`(finishingMaterials.value->>'color3')`.as('color3'),
        json: sql`finishingMaterials.value`.as('finishing_material_json'),
      })
      .from(
        sql`${craftingDetails}, json_each(${craftingDetails.json}->'data'->'finishingMaterials') as finishingMaterials`
      )
      .where(
        sql`json_type(${craftingDetails.json}->'data'->'finishingMaterials') = 'array'`
      )
      .as('craftingFinish')

    const craftingFinishValues = await db
      .with(craftingFinish)
      .select({
        craftingFinishId: craftingFinish.craftingFinishId,
        producedItemId: craftingFinish.producedItemId,
        craftingId: craftingFinish.craftingId,
        color1: craftingFinish.color1,
        color2: craftingFinish.color2,
        color3: craftingFinish.color3,
      })
      .from(craftingFinish)

    for (const value of craftingFinishValues) {
      const insertFinish = db
        .insert(craftingFinishTable)
        .values(value)
        .onConflictDoNothing()

      const craftingFinishResult = await insertFinish
    }

    const craftingFinishMaterials = db
      .with(craftingFinish)
      .select({
        craftingFinishId: craftingFinish.craftingFinishId,
        craftingId: craftingFinish.craftingId,
        producedItemId: craftingFinish.producedItemId,
        itemId: sql<number>`material.value->'sampleItem'->'key'->>'id'`.as(
          'item_id'
        ),
        quantity: sql<number>`material.value->>'count'`.as('quantity'),
        json: sql<string>`material.value`.as('crafting_finish_material_json'),
      })
      .from(
        sql`${craftingFinish}, json_each(${craftingFinish.json}->'materials') as material`
      )
      .as('craftingFinishMaterials')

    const craftingFinishMaterialsValues = await db
      .with(craftingFinishMaterials)
      .select({
        craftingId: craftingFinishMaterials.craftingId,
        craftingFinishId: craftingFinishMaterials.craftingFinishId,
        producedItemId: craftingFinishMaterials.producedItemId,
        itemId: craftingFinishMaterials.itemId,
        quantity: craftingFinishMaterials.quantity,
      })
      .from(craftingFinishMaterials)
      .where(
        inArray(
          craftingFinishMaterials.itemId,
          db.select({ itemId: itemTable.itemId }).from(itemTable)
        )
      )

    for (const value of craftingFinishMaterialsValues) {
      const insertCraftingFinishMaterials = db
        .insert(craftingFinishMaterialTable)
        .values(value)
        .onConflictDoNothing()

      const craftingFinishMaterialsResult = await insertCraftingFinishMaterials
    }
  }),
})
