import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Fetch a Notion database and return its contents
 * @param databaseId - The Notion database ID or URL
 * @returns Array of database rows with properties
 */
export async function fetchNotionDatabase(databaseId: string) {
  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call notion-fetch --server notion --input '${JSON.stringify({ id: databaseId })}'`
    );
    
    // Parse the Markdown output to extract database rows
    // The output contains <database> tags with SQLite schema and data
    return parseNotionDatabaseOutput(stdout);
  } catch (error) {
    console.error("Error fetching Notion database:", error);
    throw new Error("Failed to fetch Notion database");
  }
}

/**
 * Parse Notion database output from MCP CLI
 * Extracts rows and properties from the Markdown response
 */
function parseNotionDatabaseOutput(markdown: string): any[] {
  const rows: any[] = [];
  
  // Extract data source sections
  const dataSourceRegex = /<data-source[^>]*>(.*?)<\/data-source>/gs;
  const matches = markdown.matchAll(dataSourceRegex);
  
  for (const match of matches) {
    const content = match[1];
    
    // Extract table rows (simplified parsing)
    // In practice, you'd need more robust parsing based on the actual Markdown format
    const lines = content.split('\n');
    let inTable = false;
    let headers: string[] = [];
    
    for (const line of lines) {
      if (line.includes('|') && !line.includes('---')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        
        if (!inTable) {
          headers = cells;
          inTable = true;
        } else {
          const row: any = {};
          cells.forEach((cell, index) => {
            if (headers[index]) {
              row[headers[index]] = cell;
            }
          });
          rows.push(row);
        }
      }
    }
  }
  
  return rows;
}
