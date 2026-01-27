import fs from 'fs';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

const csvPath = '/home/ubuntu/upload/ProjectList_260123_Rev.1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Simple CSV parser that handles quoted fields with semicolons
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const lines = csvContent.split('\n').filter(line => line.trim());
console.log(`Total lines in CSV: ${lines.length}`);

const header = parseCSVLine(lines[0]);
console.log('CSV Headers:', header);

const conn = await mysql.createConnection(process.env.DATABASE_URL);

let successCount = 0;
let failCount = 0;
const errors = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = parseCSVLine(line);
  
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
  
  // Clean latitude/longitude - replace "?" with empty string
  const latitude = (row.latitude === '?' || !row.latitude) ? '' : row.latitude;
  const longitude = (row.longitude === '?' || !row.longitude) ? '' : row.longitude;
  
  try {
    await conn.query(
      `INSERT INTO projects (
        documentId, projectName, entity, client, location, country,
        latitude, longitude, services, projectYear, projectValue, isVisible, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // documentId
        row.projectName || '',
        row.entity || '',
        row.client || '',
        '', // location (not in CSV)
        row.country || '',
        latitude,
        longitude,
        row.services || '',
        row.projectYear || '',
        row.projectValue || '',
        isVisible,
        row.description || ''
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
  console.log(`\nAll errors:`);
  errors.forEach(e => {
    console.log(`  Row ${e.row} (${e.projectName}): ${e.error}`);
  });
}
