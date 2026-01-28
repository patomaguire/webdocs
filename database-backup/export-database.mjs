import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { documents, heroSection, tabsContent, teamMembers, projects, comments } from './drizzle/schema.ts';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Export all tables
const documentsData = await db.select().from(documents);
const heroSectionData = await db.select().from(heroSection);
const tabsContentData = await db.select().from(tabsContent);
const teamMembersData = await db.select().from(teamMembers);
const projectsData = await db.select().from(projects);
const commentsData = await db.select().from(comments);

const exportData = {
  documents: documentsData,
  heroSection: heroSectionData,
  tabsContent: tabsContentData,
  teamMembers: teamMembersData,
  projects: projectsData,
  comments: commentsData,
  exportDate: new Date().toISOString(),
  version: '938e0407'
};

fs.writeFileSync('database-export.json', JSON.stringify(exportData, null, 2));
console.log('✅ Database exported to database-export.json');
console.log(`📊 Exported: ${documentsData.length} documents, ${tabsContentData.length} tabs, ${teamMembersData.length} team members, ${projectsData.length} projects`);

await connection.end();
