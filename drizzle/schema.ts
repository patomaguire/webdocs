import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Proposal settings - password, colors, logos, etc.
 */
export const proposalSettings = mysqlTable("proposal_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProposalSetting = typeof proposalSettings.$inferSelect;
export type InsertProposalSetting = typeof proposalSettings.$inferInsert;

/**
 * Hero section content
 */
export const heroSection = mysqlTable("hero_section", {
  id: int("id").autoincrement().primaryKey(),
  mainTitle: text("mainTitle").notNull(),
  subtitle: text("subtitle"),
  stampText: varchar("stampText", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeroSection = typeof heroSection.$inferSelect;
export type InsertHeroSection = typeof heroSection.$inferInsert;

/**
 * Tab content - each proposal tab's HTML content
 */
export const tabsContent = mysqlTable("tabs_content", {
  id: int("id").autoincrement().primaryKey(),
  tabNumber: int("tabNumber").notNull().unique(),
  tabTitle: varchar("tabTitle", { length: 255 }).notNull(),
  htmlContent: text("htmlContent"),
  htmlContentEs: text("htmlContentEs"), // Spanish translation
  isVisible: boolean("isVisible").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TabContent = typeof tabsContent.$inferSelect;
export type InsertTabContent = typeof tabsContent.$inferInsert;

/**
 * Team members for the Team tab
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  bio: text("bio"),
  bioEs: text("bioEs"), // Spanish translation
  photoUrl: text("photoUrl"),
  yearsExperience: int("yearsExperience"),
  keySkills: text("keySkills"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Experience map projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  client: varchar("client", { length: 255 }),
  location: varchar("location", { length: 255 }),
  country: varchar("country", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  projectValue: varchar("projectValue", { length: 100 }),
  projectYear: varchar("projectYear", { length: 50 }),
  services: text("services"),
  description: text("description"),
  isVisible: boolean("isVisible").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Comments on proposal tabs
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  tabNumber: int("tabNumber").notNull(),
  tabName: varchar("tabName", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  commentText: text("commentText").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
