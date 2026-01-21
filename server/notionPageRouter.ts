import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { fetchNotionPageContent } from './notionPageFetcher';

export const notionPageRouter = router({
  /**
   * Fetch Notion page content as markdown
   */
  fetchPageContent: publicProcedure
    .input(z.object({
      pageUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const { pageUrl } = input;
      
      console.log('[Notion Router] Received import request for URL:', pageUrl);
      
      try {
        const markdown = await fetchNotionPageContent(pageUrl);
        
        console.log('[Notion Router] Successfully fetched content, length:', markdown.length);
        
        return {
          success: true,
          content: markdown,
          message: 'Successfully imported content from Notion'
        };
      } catch (error: any) {
        console.error('[Notion Router] Error during import:', error);
        console.error('[Notion Router] Error message:', error.message);
        console.error('[Notion Router] Error stack:', error.stack);
        
        return {
          success: false,
          content: '',
          message: error.message || 'Failed to import from Notion'
        };
      }
    }),
});
