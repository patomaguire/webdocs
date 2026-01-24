import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotionSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: (html: string) => void;
}

export function NotionSyncDialog({ open, onOpenChange, onSync }: NotionSyncDialogProps) {
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!databaseUrl.trim()) {
      toast.error('Please enter a Notion database URL');
      return;
    }

    setLoading(true);
    try {
      // Extract database ID from URL
      const match = databaseUrl.match(/([a-f0-9]{32})/);
      if (!match) {
        throw new Error('Invalid Notion database URL');
      }
      const databaseId = match[1];

      // Call backend to fetch Notion data via MCP
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Notion database');
      }

      const data = await response.json();
      
      // Convert to HTML table
      const html = convertNotionToTable(data.rows);
      onSync(html);
      toast.success('Notion database synced successfully!');
      onOpenChange(false);
      setDatabaseUrl('');
    } catch (error) {
      console.error('Notion sync error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync Notion database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync from Notion Database</DialogTitle>
          <DialogDescription>
            Enter the URL of your Notion database to import data as a table.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="databaseUrl">Notion Database URL</Label>
            <Input
              id="databaseUrl"
              placeholder="https://www.notion.so/..."
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Example: https://www.notion.so/2bc0c93ee04c804fa09cd9d476ae1772</p>
            <p className="mt-2">The database will be converted to an HTML table and inserted into your content.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function convertNotionToTable(rows: any[]): string {
  if (!rows || rows.length === 0) {
    return '<p>No data found in Notion database</p>';
  }

  // Extract column names from first row
  const columns = Object.keys(rows[0]);
  
  // Build HTML table
  let html = '<table border="1" style="border-collapse: collapse; width: 100%;">\n';
  
  // Header row
  html += '  <thead>\n    <tr>\n';
  columns.forEach(col => {
    html += `      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${col}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n';
  
  // Data rows
  html += '  <tbody>\n';
  rows.forEach(row => {
    html += '    <tr>\n';
    columns.forEach(col => {
      const value = row[col] || '';
      html += `      <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>\n`;
    });
    html += '    </tr>\n';
  });
  html += '  </tbody>\n';
  html += '</table>';
  
  return html;
}
