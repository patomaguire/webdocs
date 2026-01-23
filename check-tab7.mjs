import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { tabsContent, documents } from './drizzle/schema.ts';
import { eq, and } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Get document ID for busplan_2026_01
const doc = await db.select().from(documents).where(eq(documents.slug, 'busplan_2026_01')).limit(1);
console.log('Document:', JSON.stringify(doc, null, 2));

if (doc.length > 0) {
  // Get Tab 7
  const tab = await db.select().from(tabsContent).where(
    and(eq(tabsContent.documentId, doc[0].id), eq(tabsContent.tabNumber, 7))
  ).limit(1);
  console.log('\nTab 7:', JSON.stringify(tab, null, 2));
}

await connection.end();
