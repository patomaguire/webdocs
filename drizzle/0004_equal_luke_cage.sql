ALTER TABLE `tabs_content` ADD `backgroundType` enum('color','image') DEFAULT 'color';--> statement-breakpoint
ALTER TABLE `tabs_content` ADD `backgroundValue` text;