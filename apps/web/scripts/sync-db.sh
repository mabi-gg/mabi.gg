mkdir -p /tmp/mabigg
rm /tmp/mabigg/*.sql
# pnpm wrangler d1 export mabigg --output /tmp/mabigg/mabibase_scrape.sql --table mabibase_scrape --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/item.sql --table item --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/production.sql --table production --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/production_material.sql --table production_material --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/crafting.sql --table crafting --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/crafting_finish.sql --table crafting_finish --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/crafting_finish_material.sql --table crafting_finish_material --remote --no-schema
pnpm wrangler d1 export mabigg --output /tmp/mabigg/crafting_material.sql --table crafting_material --remote --no-schema


cat /tmp/mabigg/*.sql > /tmp/mabigg/mabigg.sql

pnpm wrangler d1 execute mabigg --local --file /tmp/mabigg/item.sql