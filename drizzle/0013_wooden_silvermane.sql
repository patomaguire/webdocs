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
