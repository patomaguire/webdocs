import fs from 'fs';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const csvPath = '/home/ubuntu/upload/ProjectList_260123_Rev.1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log(`Total lines in CSV: ${lines.length}`);

const header = lines[0].split(';').map(h => h.trim());
console.log('CSV Headers:', header);

const conn = await mysql.createConnection(process.env.DATABASE_URL);

let successCount = 0;
let failCount = 0;
const errors = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = line.split(';').map(v => v.trim());
  
  const row = {};
  header.forEach((h, idx) => {
    row[h] = values[idx] || '';
  });
  
  // Skip if no project name
  if (!row.projectName || row.projectName === '') {
    console.log(`Row ${i}: Skipping - no project name`);
    failCount++;
    continue;
  }
  
  // Parse isVisible
  const isVisible = row.isVisible && (
    row.isVisible.toLowerCase() === 'true' || 
    row.isVisible === '1'
  ) ? 1 : 0;
  
  try {
    await conn.query(
      `INSERT INTO projects (
        documentId, projectName, entity, client, location, country,
        latitude, longitude, services, projectYear, projectValue, isVisible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // documentId
        row.projectName || '',
        row.entity || '',
        row.client || '',
        row.location || '',
        row.country || '',
        row.latitude || '',
        row.longitude || '',
        row.services || '',
        row.year || '',
        row.value || '',
        isVisible
      ]
    );
    successCount++;
    if (successCount % 10 === 0) {
      console.log(`Imported ${successCount} projects...`);
    }
  } catch (error) {
    failCount++;
    errors.push({ row: i, projectName: row.projectName, error: error.message });
    console.log(`Row ${i} (${row.projectName}): ERROR - ${error.message}`);
  }
}

await conn.end();

console.log(`\n=== IMPORT COMPLETE ===`);
console.log(`Success: ${successCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total: ${successCount + failCount}`);

if (errors.length > 0) {
  console.log(`\nFirst 10 errors:`);
  errors.slice(0, 10).forEach(e => {
    console.log(`  Row ${e.row} (${e.projectName}): ${e.error}`);
  });
}
