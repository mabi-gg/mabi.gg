CREATE TABLE `crafting_finish_material` (
	`crafting_id` integer NOT NULL,
	`crafting_finish_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`crafting_finish_id`, `produced_item_id`, `item_id`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`produced_item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`crafting_finish_id`,`produced_item_id`,`crafting_id`) REFERENCES `crafting_finish`(`crafting_finish_id`,`produced_item_id`,`crafting_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `crafting_finish_material_produced_item_id_idx` ON `crafting_finish_material` (`produced_item_id`);--> statement-breakpoint
CREATE INDEX `crafting_finish_material_item_id_idx` ON `crafting_finish_material` (`item_id`);--> statement-breakpoint
CREATE TABLE `crafting_finish` (
	`crafting_finish_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`crafting_id` integer NOT NULL,
	`color1` integer,
	`color2` integer,
	`color3` integer,
	PRIMARY KEY(`crafting_finish_id`, `produced_item_id`, `crafting_id`),
	FOREIGN KEY (`crafting_id`,`produced_item_id`) REFERENCES `crafting`(`crafting_id`,`produced_item_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `crafting_material` (
	`crafting_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`crafting_id`, `produced_item_id`, `item_id`),
	FOREIGN KEY (`produced_item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`crafting_id`,`produced_item_id`) REFERENCES `crafting`(`crafting_id`,`produced_item_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `crafting` (
	`crafting_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`type` text NOT NULL,
	`rank` text NOT NULL,
	`max_progress` integer NOT NULL,
	PRIMARY KEY(`crafting_id`, `produced_item_id`),
	FOREIGN KEY (`produced_item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `asset` (
	`asset_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`path` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_asset` (
	`item_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	PRIMARY KEY(`item_id`, `asset_id`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`asset_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `item` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`wiki_page` text,
	`icon_url` text,
	`book_url` text,
	`deleted` integer DEFAULT false NOT NULL,
	`hidden` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mabibase_scrape` (
	`id` integer NOT NULL,
	`type` integer NOT NULL,
	`json` text NOT NULL,
	`date` integer NOT NULL,
	PRIMARY KEY(`id`, `type`, `date`)
);
--> statement-breakpoint
CREATE TABLE `production` (
	`production_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`type` text NOT NULL,
	`rank` text NOT NULL,
	PRIMARY KEY(`production_id`, `produced_item_id`),
	FOREIGN KEY (`produced_item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `production_produced_item_id_idx` ON `production` (`produced_item_id`);--> statement-breakpoint
CREATE TABLE `production_material` (
	`production_id` integer NOT NULL,
	`produced_item_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`production_id`, `produced_item_id`, `item_id`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`produced_item_id`) REFERENCES `item`(`item_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`production_id`,`produced_item_id`) REFERENCES `production`(`production_id`,`produced_item_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `production_material_produced_item_id_idx` ON `production_material` (`produced_item_id`);--> statement-breakpoint
CREATE INDEX `production_material_item_id_idx` ON `production_material` (`item_id`);