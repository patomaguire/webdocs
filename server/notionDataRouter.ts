import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { fetchNotionDatabase, extractColumn } from "./notionDataFetcher";

/**
 * Parse placeholder syntax: {{notion:db1:column_name}}
 * Returns: { dbKey: 'db1', columnName: 'column_name' }
 */
function parsePlaceholder(placeholder: string): { dbKey: string; columnName: string } | null {
  const match = placeholder.match(/\{\{notion:(db[123]):([^}]+)\}\}/);
  if (!match) return null;
  
  return {
    dbKey: match[1],
    columnName: match[2].trim()
  };
}

/**
 * Router for Notion data fetching and placeholder replacement
 */
export const notionDataRouter = router({
  /**
   * Fetch and process Notion data for a tab's markdown content
   * Replaces all {{notion:dbX:column}} placeholders with actual data arrays
   */
  processMarkdown: publicProcedure
    .input(z.object({
      markdown: z.string(),
      notionUrls: z.object({
        db1: z.string().optional(),
        db2: z.string().optional(),
        db3: z.string().optional(),
      }),
    }))
    .query(async ({ input }) => {
      const { markdown, notionUrls } = input;
      
      // Find all placeholders in markdown
      const placeholderRegex = /\{\{notion:(db[123]):([^}]+)\}\}/g;
      const matches = Array.from(markdown.matchAll(placeholderRegex));
      
      if (matches.length === 0) {
        // No placeholders, return original markdown
        return { processedMarkdown: markdown };
      }
      
      // Fetch data from each database that's referenced
      const dbData: Record<string, Record<string, any>[]> = {};
      const dbKeys = new Set(matches.map(m => m[1]));
      
      for (const dbKey of dbKeys) {
        const url = notionUrls[dbKey as 'db1' | 'db2' | 'db3'];
        if (url) {
          try {
            dbData[dbKey] = await fetchNotionDatabase(url);
          } catch (error: any) {
            console.error(`Error fetching ${dbKey}:`, error);
            // Continue with other databases, replace with empty array
            dbData[dbKey] = [];
          }
        } else {
          dbData[dbKey] = [];
        }
      }
      
      // Replace all placeholders with actual data
      let processedMarkdown = markdown;
      
      for (const match of matches) {
        const fullPlaceholder = match[0];
        const dbKey = match[1];
        const columnName = match[2].trim();
        
        const rows = dbData[dbKey] || [];
        const columnData = extractColumn(rows, columnName);
        
        // Convert to JSON array string for Chart.js
        const replacement = JSON.stringify(columnData);
        
        processedMarkdown = processedMarkdown.replace(fullPlaceholder, replacement);
      }
      
      return { processedMarkdown };
    }),
});
