-- Create bids table
CREATE TABLE `bids` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `bids_id` PRIMARY KEY(`id`),
  CONSTRAINT `bids_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
-- Add bidId to proposal_settings
ALTER TABLE `proposal_settings` ADD `bidId` int NOT NULL DEFAULT 1;
--> statement-breakpoint
-- Add bidId to hero_section
ALTER TABLE `hero_section` ADD `bidId` int NOT NULL DEFAULT 1;
--> statement-breakpoint
-- Add bidId to tabs_content
ALTER TABLE `tabs_content` ADD `bidId` int NOT NULL DEFAULT 1;
--> statement-breakpoint
-- Add bidId to team_members
ALTER TABLE `team_members` ADD `bidId` int NOT NULL DEFAULT 1;
--> statement-breakpoint
-- Add bidId to projects
ALTER TABLE `projects` ADD `bidId` int NOT NULL DEFAULT 1;
--> statement-breakpoint
-- Add bidId to comments
ALTER TABLE `comments` ADD `bidId` int NOT NULL DEFAULT 1;
