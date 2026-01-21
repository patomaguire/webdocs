import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Fetch Notion page content and convert to markdown
 * Uses Notion MCP notion-fetch tool to read page content
 */
export async function fetchNotionPageContent(pageUrl: string): Promise<string> {
  try {
    // Extract page ID from URL
    // Notion URLs format: https://www.notion.so/Page-Title-{pageId}
    // Also supports block anchors: https://www.notion.so/Page-Title-{pageId}#{blockId}
    const pageIdMatch = pageUrl.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    
    if (!pageIdMatch) {
      throw new Error('Invalid Notion page URL. Please provide a valid Notion page link.');
    }
    
    const pageId = pageIdMatch[1];
    
    // Use Notion MCP notion-fetch tool to read page content
    const command = `manus-mcp-cli tool call notion-fetch --server notion --input '{"id": "${pageId}"}'`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large pages
    });
    
    if (stderr && !stderr.includes('OAuth') && !stderr.includes('Tool execution')) {
      console.error('Notion MCP stderr:', stderr);
    }
    
    if (!stdout || stdout.trim() === '') {
      throw new Error('No content returned from Notion page. The page might be empty or inaccessible.');
    }
    
    // Parse the JSON response from MCP
    try {
      // Extract JSON from the output (it may contain other text)
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Notion MCP');
      }
      
      const response = JSON.parse(jsonMatch[0]);
      
      if (!response.text) {
        throw new Error('No content in Notion page response');
      }
      
      // Extract the markdown content from the <content> tag
      const contentMatch = response.text.match(/<content>([\s\S]*?)<\/content>/);
      if (contentMatch && contentMatch[1]) {
        return convertNotionMarkdownToStandard(contentMatch[1].trim());
      }
      
      // If no <content> tag, return the full text
      return convertNotionMarkdownToStandard(response.text);
      
    } catch (parseError: any) {
      console.error('Error parsing Notion MCP response:', parseError);
      throw new Error('Failed to parse Notion page content');
    }
    
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

/**
 * Convert Notion-flavored Markdown to standard Markdown/HTML
 * Handles Notion-specific syntax like toggle blocks, columns, etc.
 */
function convertNotionMarkdownToStandard(notionMarkdown: string): string {
  let markdown = notionMarkdown;
  
  // Remove toggle blocks (▶) and convert to regular headings
  markdown = markdown.replace(/▶\s*###\s*\*\*(.*?)\*\*/g, '### $1');
  markdown = markdown.replace(/▶\s*##\s*\*\*(.*?)\*\*/g, '## $1');
  markdown = markdown.replace(/▶\s*#\s*\*\*(.*?)\*\*/g, '# $1');
  markdown = markdown.replace(/▶\s*\*\*(.*?)\*\*/g, '**$1**');
  markdown = markdown.replace(/▶\s*/g, '');
  
  // Remove Notion color syntax {color="..."}
  markdown = markdown.replace(/\s*\{color="[^"]+"\}/g, '');
  
  // Remove empty blocks
  markdown = markdown.replace(/<empty-block\/>/g, '');
  
  // Convert Notion columns to simple sections
  markdown = markdown.replace(/<columns>[\s\S]*?<\/columns>/g, (match) => {
    // Extract column content
    const columnMatches = match.match(/<column>([\s\S]*?)<\/column>/g);
    if (!columnMatches) return '';
    
    return columnMatches.map(col => {
      const content = col.replace(/<\/?column>/g, '').trim();
      return content;
    }).join('\n\n---\n\n');
  });
  
  // Convert Notion images to standard markdown images
  markdown = markdown.replace(/<image source="([^"]+)"[^>]*>/g, '![]($1)');
  
  // Convert Notion files to links
  markdown = markdown.replace(/<file source="([^"]+)"[^>]*>/g, '[Download File]($1)');
  
  // Convert Notion tables to standard markdown tables
  // Note: Notion uses <table> tags, we'll keep them as HTML for now
  
  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}
