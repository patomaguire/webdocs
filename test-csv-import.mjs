import fs from 'fs';
import Papa from 'papaparse';

const csvPath = '/home/ubuntu/upload/ProjectList_260123_Rev.1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

console.log('Starting CSV import test...\n');

Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
  delimiter: '', // Auto-detect
  complete: (results) => {
    console.log(`Total rows parsed: ${results.data.length}\n`);
    
    let validCount = 0;
    let invalidCount = 0;
    const invalidRows = [];
    
    results.data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because: +1 for 0-index, +1 for header row
      
      // Check if projectName exists (required field)
      if (!row.projectName || row.projectName.trim() === '') {
        invalidCount++;
        invalidRows.push({
          row: rowNum,
          reason: 'Missing projectName',
          data: row
        });
      } else {
        validCount++;
      }
    });
    
    console.log(`Valid rows: ${validCount}`);
    console.log(`Invalid rows: ${invalidCount}\n`);
    
    if (invalidRows.length > 0) {
      console.log('First 10 invalid rows:');
      invalidRows.slice(0, 10).forEach(item => {
        console.log(`\nRow ${item.row}: ${item.reason}`);
        console.log('Data:', JSON.stringify(item.data, null, 2));
      });
    }
    
    // Check isVisible values
    console.log('\n=== isVisible Analysis ===');
    const isVisibleStats = {};
    results.data.forEach(row => {
      const val = String(row.isVisible || 'undefined');
      isVisibleStats[val] = (isVisibleStats[val] || 0) + 1;
    });
    console.log('isVisible value distribution:', isVisibleStats);
  },
  error: (error) => {
    console.error('CSV parse error:', error);
  }
});
