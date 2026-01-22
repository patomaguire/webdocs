import { getDb } from "./db";
import { tabDocuments, type InsertTabDocument } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "./storage";

/**
 * List all documents for a specific tab
 */
export async function listTabDocuments(documentId: number, tabNumber: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tabDocuments)
    .where(and(
      eq(tabDocuments.documentId, documentId),
      eq(tabDocuments.tabNumber, tabNumber)
    ))
    .orderBy(tabDocuments.sortOrder);
}

/**
 * Get a single document by ID
 */
export async function getTabDocument(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tabDocuments)
    .where(eq(tabDocuments.id, id))
    .limit(1);
  return results[0] || null;
}

/**
 * Insert a new tab document
 */
export async function insertTabDocument(data: Omit<InsertTabDocument, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tabDocuments).values(data);
  return { id: Number((result as any).insertId), ...data };
}

/**
 * Delete a tab document
 */
export async function deleteTabDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tabDocuments).where(eq(tabDocuments.id, id));
  return { success: true };
}

/**
 * Upload file to S3
 */
export async function uploadToS3(file: { name: string; data: Buffer | Uint8Array; type: string }): Promise<string> {
  const randomSuffix = Math.random().toString(36).substring(7);
  const fileKey = `tab-documents/${file.name}-${randomSuffix}`;
  const { url } = await storagePut(fileKey, file.data, file.type);
  return url;
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  // Extract key from CloudFront URL
  // Example URL: https://d2xsxph8kpxj0f.cloudfront.net/310519663055864744/jkvEoGLbv7QkcKGpVwBVtE/tab-documents/file.pdf
  const urlParts = fileUrl.split('/');
  const key = urlParts.slice(3).join('/'); // Get everything after domain
  
  // Note: storageDelete is not implemented in the template, so we'll skip actual deletion
  // In production, you would implement storageDelete in server/storage.ts
  console.log(`Would delete S3 file: ${key}`);
}
