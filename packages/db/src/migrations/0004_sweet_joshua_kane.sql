PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mabibase_scrape` (
	`id` integer NOT NULL,
	`type` text NOT NULL,
	`json` text NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`id`, `type`, `date`)
);
--> statement-breakpoint
INSERT INTO `__new_mabibase_scrape`("id", "type", "json", "date") SELECT "id", "type", "json", "date" FROM `mabibase_scrape`;--> statement-breakpoint
DROP TABLE `mabibase_scrape`;--> statement-breakpoint
ALTER TABLE `__new_mabibase_scrape` RENAME TO `mabibase_scrape`;--> statement-breakpoint
PRAGMA foreign_keys=ON;