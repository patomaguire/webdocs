import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

/**
 * Router for handling image uploads to S3
 */
export const imageUploadRouter = router({
  /**
   * Upload an image file to S3 and return the public URL
   */
  uploadImage: publicProcedure
    .input(
      z.object({
        fileData: z.string(), // base64 encoded image data
        fileName: z.string(),
        contentType: z.string(), // e.g., "image/png", "image/jpeg"
        folder: z.string().optional().default("uploads"), // S3 folder path
      })
    )
    .mutation(async ({ input }) => {
      const { fileData, fileName, contentType, folder } = input;

      // Decode base64 to buffer
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique file key with random suffix to prevent enumeration
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const fileKey = `${folder}/${timestamp}-${randomSuffix}-${fileName}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, contentType);

      return {
        success: true,
        url,
        fileKey,
      };
    }),
});
