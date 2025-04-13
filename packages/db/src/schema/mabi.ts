import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const mabibaseScrapeTable = sqliteTable(
  'mabibase_scrape',
  {
    id: integer('id').notNull(),
    type: text('type').notNull(),
    json: text({ mode: 'json' }).notNull(),
    date: text('date').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.type, table.date],
    }),
  ]
)

export const itemTable = sqliteTable('item', {
  itemId: integer('item_id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  wikiPage: text('wiki_page'),
  iconUrl: text('icon_url'),
  bookUrl: text('book_url'),
  deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
})

export const craftingTable = sqliteTable(
  'crafting',
  {
    craftingId: integer('crafting_id').notNull(),
    producedItemId: integer('produced_item_id')
      .notNull()
      .references(() => itemTable.itemId, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    rank: text('rank').notNull(),
    maxProgress: integer('max_progress').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.craftingId, table.producedItemId],
    }),
  ]
)

export const craftingMaterialTable = sqliteTable(
  'crafting_material',
  {
    craftingId: integer('crafting_id').notNull(),
    producedItemId: integer('produced_item_id')
      .notNull()
      .references(() => itemTable.itemId, { onDelete: 'cascade' }),
    itemId: integer('item_id')
      .notNull()
      .references(() => itemTable.itemId, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.craftingId, table.producedItemId, table.itemId],
    }),
    foreignKey({
      columns: [table.craftingId, table.producedItemId],
      foreignColumns: [craftingTable.craftingId, craftingTable.producedItemId],
    }),
  ]
)

export const craftingFinishTable = sqliteTable(
  'crafting_finish',
  {
    craftingFinishId: integer('crafting_finish_id').notNull(),
    producedItemId: integer('produced_item_id').notNull(),
    craftingId: integer('crafting_id').notNull(),
    color1: integer('color1'),
    color2: integer('color2'),
    color3: integer('color3'),
  },
  (table) => [
    primaryKey({
      columns: [table.craftingFinishId, table.producedItemId, table.craftingId],
    }),
    foreignKey({
      columns: [table.craftingId, table.producedItemId],
      foreignColumns: [craftingTable.craftingId, craftingTable.producedItemId],
    }),
  ]
)

export const craftingFinishMaterialTable = sqliteTable(
  'crafting_finish_material',
  {
    craftingId: integer('crafting_id').notNull(),
    craftingFinishId: integer('crafting_finish_id').notNull(),
    producedItemId: integer('produced_item_id').notNull(),
    itemId: integer('item_id').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'crafting_finish_material_pkey',
      columns: [table.craftingFinishId, table.producedItemId, table.itemId],
    }),
    foreignKey({
      name: 'crafting_finish_material_item_id_fkey',
      columns: [table.itemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'crafting_finish_material_produced_item_id_fkey',
      columns: [table.producedItemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'crafting_finish_material_crafting_id_fkey',
      columns: [table.craftingFinishId, table.producedItemId, table.craftingId],
      foreignColumns: [
        craftingFinishTable.craftingFinishId,
        craftingFinishTable.producedItemId,
        craftingFinishTable.craftingId,
      ],
    }).onDelete('cascade'),
    index('crafting_finish_material_produced_item_id_idx').on(
      table.producedItemId
    ),
    index('crafting_finish_material_item_id_idx').on(table.itemId),
  ]
)

export const productionTable = sqliteTable(
  'production',
  {
    productionId: integer('production_id').notNull(),
    producedItemId: integer('produced_item_id').notNull(),
    type: text('type').notNull(),
    rank: text('rank').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'production_pkey',
      columns: [table.productionId, table.producedItemId],
    }),
    foreignKey({
      name: 'production_produced_item_id_fkey',
      columns: [table.producedItemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    index('production_produced_item_id_idx').on(table.producedItemId),
  ]
)

export const productionMaterialTable = sqliteTable(
  'production_material',
  {
    productionId: integer('production_id').notNull(),
    producedItemId: integer('produced_item_id').notNull(),
    itemId: integer('item_id').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'production_material_pkey',
      columns: [table.productionId, table.producedItemId, table.itemId],
    }),
    foreignKey({
      name: 'production_material_item_id_fkey',
      columns: [table.itemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'production_material_produced_item_id_fkey',
      columns: [table.producedItemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'production_material_production_id_fkey',
      columns: [table.productionId, table.producedItemId],
      foreignColumns: [
        productionTable.productionId,
        productionTable.producedItemId,
      ],
    }).onDelete('cascade'),
    index('production_material_produced_item_id_idx').on(table.producedItemId),
    index('production_material_item_id_idx').on(table.itemId),
  ]
)

export const imageAssetTable = sqliteTable('asset', {
  assetId: integer('asset_id').primaryKey({ autoIncrement: true }).notNull(),
  type: text('type').notNull(),
  path: text('path').notNull(),
})

export const itemAssetTable = sqliteTable(
  'item_asset',
  {
    itemId: integer('item_id').notNull(),
    assetId: integer('asset_id').notNull(),
  },
  (table) => [
    primaryKey({
      name: 'item_asset_pkey',
      columns: [table.itemId, table.assetId],
    }),
    foreignKey({
      name: 'item_asset_item_id_fkey',
      columns: [table.itemId],
      foreignColumns: [itemTable.itemId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'item_asset_asset_id_fkey',
      columns: [table.assetId],
      foreignColumns: [imageAssetTable.assetId],
    }).onDelete('cascade'),
  ]
)
