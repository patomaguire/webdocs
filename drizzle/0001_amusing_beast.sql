CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tabNumber` int NOT NULL,
	`tabName` varchar(255) NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorEmail` varchar(320),
	`commentText` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hero_section` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mainTitle` text NOT NULL,
	`subtitle` text,
	`stampText` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hero_section_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`entity` varchar(100) NOT NULL,
	`client` varchar(255),
	`location` varchar(255),
	`country` varchar(100),
	`latitude` decimal(10,6),
	`longitude` decimal(10,6),
	`projectValue` varchar(100),
	`projectYear` varchar(50),
	`services` text,
	`description` text,
	`isVisible` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposal_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposal_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `tabs_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tabNumber` int NOT NULL,
	`tabTitle` varchar(255) NOT NULL,
	`htmlContent` text,
	`isVisible` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tabs_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `tabs_content_tabNumber_unique` UNIQUE(`tabNumber`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`bio` text,
	`photoUrl` text,
	`yearsExperience` int,
	`keySkills` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
