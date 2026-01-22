import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { uploadToS3, deleteFromS3 } from "./tabDocumentsDb";

export const tabDocumentsRouter = router({
  /**
   * List all documents for a tab
   */
  list: publicProcedure
    .input(z.object({
      documentId: z.number(),
      tabNumber: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const { listTabDocuments } = await import("./tabDocumentsDb");
      return await listTabDocuments(input.documentId, input.tabNumber);
    }),

  /**
   * Upload a document to a tab
   */
  upload: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      tabNumber: z.number(),
      file: z.any(), // File object from frontend
    }))
    .mutation(async ({ input, ctx }) => {
      const { file, documentId, tabNumber } = input;
      
      // Upload to S3
      const fileUrl = await uploadToS3(file);
      
      // Save metadata to database
      const { insertTabDocument } = await import("./tabDocumentsDb");
      return await insertTabDocument({
        documentId,
        tabNumber,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        sortOrder: 0,
      });
    }),

  /**
   * Delete a document
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { deleteTabDocument, getTabDocument } = await import("./tabDocumentsDb");
      
      // Get document to retrieve S3 URL
      const doc = await getTabDocument(input.id);
      if (!doc) {
        throw new Error("Document not found");
      }
      
      // Delete from S3
      await deleteFromS3(doc.fileUrl);
      
      // Delete from database
      return await deleteTabDocument(input.id);
    }),
});
