import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { documents, heroSection, tabsContent, teamMembers, projects, comments } from './drizzle/schema.ts';
import fs from 'fs';

console.log('📥 Starting database import...');

const exportData = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
console.log(`📊 Found: ${exportData.documents.length} documents, ${exportData.tabsContent.length} tabs, ${exportData.teamMembers.length} team members, ${exportData.projects.length} projects`);

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  // Import documents
  if (exportData.documents.length > 0) {
    await db.insert(documents).values(exportData.documents);
    console.log(`✅ Imported ${exportData.documents.length} documents`);
  }

  // Import hero sections
  if (exportData.heroSection.length > 0) {
    await db.insert(heroSection).values(exportData.heroSection);
    console.log(`✅ Imported ${exportData.heroSection.length} hero sections`);
  }

  // Import tabs
  if (exportData.tabsContent.length > 0) {
    await db.insert(tabsContent).values(exportData.tabsContent);
    console.log(`✅ Imported ${exportData.tabsContent.length} tabs`);
  }

  // Import team members
  if (exportData.teamMembers.length > 0) {
    await db.insert(teamMembers).values(exportData.teamMembers);
    console.log(`✅ Imported ${exportData.teamMembers.length} team members`);
  }

  // Import projects
  if (exportData.projects.length > 0) {
    await db.insert(projects).values(exportData.projects);
    console.log(`✅ Imported ${exportData.projects.length} projects`);
  }

  // Import comments
  if (exportData.comments.length > 0) {
    await db.insert(comments).values(exportData.comments);
    console.log(`✅ Imported ${exportData.comments.length} comments`);
  }

  console.log('\n✅ Database import completed successfully!');
  console.log(`📅 Original export date: ${exportData.exportDate}`);
  console.log(`🔖 Original version: ${exportData.version}`);
} catch (error) {
  console.error('❌ Import failed:', error.message);
  throw error;
} finally {
  await connection.end();
}
