import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

router.post('/api/notion/sync', async (req, res) => {
  try {
    const { databaseId } = req.body;
    
    if (!databaseId) {
      return res.status(400).json({ error: 'Database ID is required' });
    }

    // Call Notion MCP via manus-mcp-cli
    const command = `manus-mcp-cli tool call notion-search --server notion --input '{"database_id":"${databaseId}","query":""}'`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Notion MCP error:', stderr);
    }

    // Parse MCP output
    const output = JSON.parse(stdout);
    
    if (!output.content || !Array.isArray(output.content)) {
      throw new Error('Invalid response from Notion MCP');
    }

    // Extract rows from MCP response
    const rows = output.content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => {
        try {
          return JSON.parse(item.text);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.json({ rows });
  } catch (error) {
    console.error('Notion sync error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to sync Notion database' 
    });
  }
});

export default router;
