import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Fetch Notion page content and convert to markdown
 * Uses Notion MCP to read page content
 */
export async function fetchNotionPageContent(pageUrl: string): Promise<string> {
  try {
    // Extract page ID from URL
    // Notion URLs format: https://www.notion.so/Page-Title-{pageId}
    const pageIdMatch = pageUrl.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    
    if (!pageIdMatch) {
      throw new Error('Invalid Notion page URL. Please provide a valid Notion page link.');
    }
    
    const pageId = pageIdMatch[1];
    
    // Use Notion MCP to read page content
    const command = `manus-mcp-cli resource read "notion://pages/${pageId}" --server notion`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large pages
    });
    
    if (stderr && !stderr.includes('OAuth')) {
      console.error('Notion MCP stderr:', stderr);
    }
    
    if (!stdout || stdout.trim() === '') {
      throw new Error('No content returned from Notion page. The page might be empty or inaccessible.');
    }
    
    // The MCP returns markdown content directly
    return stdout.trim();
    
  } catch (error: any) {
    console.error('Error fetching Notion page:', error);
    
    if (error.message?.includes('OAuth')) {
      throw new Error('Notion authentication required. Please authenticate via Notion MCP.');
    }
    
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      throw new Error('Notion page not found. Please check the URL and ensure the page is shared.');
    }
    
    throw new Error(`Failed to fetch Notion page: ${error.message || 'Unknown error'}`);
  }
}
