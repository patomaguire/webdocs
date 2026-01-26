CREATE TABLE `tab_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`tabNumber` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tab_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `entity` varchar(100);--> statement-breakpoint
ALTER TABLE `tabs_content` ADD `notionDatabaseUrl2` text;--> statement-breakpoint
ALTER TABLE `tabs_content` ADD `notionDatabaseUrl3` text;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `sortOrder`;