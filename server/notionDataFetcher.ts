import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Extract database ID from Notion URL
 * Supports formats:
 * - https://www.notion.so/workspace/database-id?v=view-id
 * - https://notion.so/database-id
 */
function extractDatabaseId(url: string): string | null {
  if (!url) return null;
  
  // Remove query parameters and anchors
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Extract the last segment which should be the database ID
  const segments = cleanUrl.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Notion database IDs are 32 characters (hex)
  if (lastSegment && lastSegment.length === 32) {
    return lastSegment;
  }
  
  // Try to find a 32-char hex string in the URL
  const match = url.match(/([a-f0-9]{32})/i);
  return match ? match[1] : null;
}

/**
 * Fetch data from a Notion database using MCP
 * Returns array of row objects with property names as keys
 */
export async function fetchNotionDatabase(databaseUrl: string): Promise<Record<string, any>[]> {
  const databaseId = extractDatabaseId(databaseUrl);
  
  if (!databaseId) {
    throw new Error(`Invalid Notion database URL: ${databaseUrl}`);
  }
  
  try {
    // Use Notion MCP to query the database
    const { stdout, stderr } = await execAsync(
      `manus-mcp-cli tool call notion_query_database --server notion --input '${JSON.stringify({
        database_id: databaseId,
        page_size: 100
      })}'`
    );
    
    if (stderr) {
      console.error('Notion MCP stderr:', stderr);
    }
    
    const result = JSON.parse(stdout);
    
    if (result.error) {
      throw new Error(`Notion MCP error: ${result.error}`);
    }
    
    // Parse Notion response format
    // Notion returns results with properties in a specific format
    const rows: Record<string, any>[] = [];
    
    if (result.results && Array.isArray(result.results)) {
      for (const page of result.results) {
        const row: Record<string, any> = {};
        
        // Extract properties from Notion page format
        if (page.properties) {
          for (const [propName, propValue] of Object.entries(page.properties as Record<string, any>)) {
            row[propName] = extractPropertyValue(propValue);
          }
        }
        
        rows.push(row);
      }
    }
    
    return rows;
  } catch (error: any) {
    console.error('Error fetching Notion database:', error);
    throw new Error(`Failed to fetch Notion database: ${error.message}`);
  }
}

/**
 * Extract the actual value from a Notion property object
 */
function extractPropertyValue(property: any): any {
  if (!property || !property.type) return null;
  
  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'number':
      return property.number ?? 0;
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name).join(', ') || '';
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox ?? false;
    case 'url':
      return property.url || '';
    case 'email':
      return property.email || '';
    case 'phone_number':
      return property.phone_number || '';
    case 'formula':
      return extractPropertyValue({ type: property.formula?.type, [property.formula?.type]: property.formula?.[property.formula?.type] });
    case 'rollup':
      return extractPropertyValue({ type: property.rollup?.type, [property.rollup?.type]: property.rollup?.[property.rollup?.type] });
    default:
      return null;
  }
}

/**
 * Extract a specific column from Notion database results
 */
export function extractColumn(rows: Record<string, any>[], columnName: string): any[] {
  return rows.map(row => row[columnName] ?? null);
}
