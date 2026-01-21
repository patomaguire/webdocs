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
      
      try {
        const markdown = await fetchNotionPageContent(pageUrl);
        
        return {
          success: true,
          content: markdown,
          message: 'Successfully imported content from Notion'
        };
      } catch (error: any) {
        return {
          success: false,
          content: '',
          message: error.message || 'Failed to import from Notion'
        };
      }
    }),
});
