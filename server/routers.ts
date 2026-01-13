import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { notionDataRouter } from "./notionDataRouter";
import { imageUploadRouter } from "./imageUploadRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { tabsContent as tabs } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  createDocument,
  getDocumentBySlug,
  getDocumentById,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  getSetting,
  getAllSettings,
  upsertSetting,
  getHeroSection,
  upsertHeroSection,
  getAllTabs,
  getTabByNumber,
  upsertTab,
  getAllTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addComment,
  getCommentsByTab,
  getAllComments,
  markCommentAsRead,
  deleteComment,
  copyDocumentContent,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  notionData: notionDataRouter,
  imageUpload: imageUploadRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Settings router
  settings: router({
    getAll: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getAllSettings(input?.documentId ?? 1)),
    getGoogleMapsApiKey: publicProcedure.query(() => {
      return { apiKey: ENV.googleMapsApiKey };
    }),
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => await getSetting(input.key)),
    upsert: publicProcedure
      .input(z.object({ key: z.string(), value: z.string(), documentId: z.number().optional() }))
      .mutation(async ({ input }) => {
        await upsertSetting(input.key, input.value, input.documentId ?? 1);
        return { success: true };
      }),
  }),

  // Hero section router
  hero: router({
    get: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getHeroSection(input?.documentId ?? 1)),
    upsert: publicProcedure
      .input(z.object({
        mainTitle: z.string(),
        subtitle: z.string().optional(),
        stampText: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await upsertHeroSection(input);
        return { success: true };
      }),
  }),

  // Tabs content router
  tabs: router({
    getAll: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getAllTabs(input?.documentId ?? 1)),
    getByNumber: publicProcedure
      .input(z.object({ tabNumber: z.number(), documentId: z.number().optional() }))
      .query(async ({ input }) => await getTabByNumber(input.tabNumber, input.documentId ?? 1)),
    upsert: publicProcedure
      .input(z.object({
        documentId: z.number(),
        tabNumber: z.number(),
        tabTitle: z.string(),
        htmlContent: z.string().optional(),
        isVisible: z.boolean().optional(),
        backgroundType: z.enum(["color", "gradient", "image"]).optional(),
        backgroundValue: z.string().optional(),
        notionDatabaseUrl: z.string().optional(),
        notionDatabaseUrl2: z.string().optional(),
        notionDatabaseUrl3: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await upsertTab(input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ documentId: z.number(), tabNumber: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(tabs).where(and(eq(tabs.documentId, input.documentId), eq(tabs.tabNumber, input.tabNumber)));
        return { success: true };
      }),
  }),

  // Team members router
  team: router({
    getAll: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getAllTeamMembers(input?.documentId ?? 1)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getTeamMember(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        title: z.string(),
        bio: z.string().optional(),
        photoUrl: z.string().optional(),
        yearsExperience: z.number().optional(),
        keySkills: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const member = await createTeamMember(input);
        return { success: true, member };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        title: z.string().optional(),
        bio: z.string().optional(),
        photoUrl: z.string().optional(),
        yearsExperience: z.number().optional(),
        keySkills: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTeamMember(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTeamMember(input.id);
        return { success: true };
      }),
    importFromNotion: publicProcedure
      .input(z.object({
        databaseId: z.string(),
        documentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { fetchNotionDatabase, validateTeamMemberFields, parseNotionTeamMembers } = await import('./notion');
        
        // Fetch Notion database
        const notionData = await fetchNotionDatabase(input.databaseId);
        
        // Validate fields
        const validation = validateTeamMemberFields(notionData);
        if (!validation.valid) {
          return {
            success: false,
            error: `Missing required fields: ${validation.missingFields.join(', ')}`,
            availableFields: validation.availableFields,
          };
        }
        
        // Parse and import
        const members = parseNotionTeamMembers(notionData);
        
        if (members.length === 0) {
          return {
            success: false,
            error: 'No team members found in Notion database',
          };
        }
        
        // Bulk insert
        for (const member of members) {
          await createTeamMember({ ...member, documentId: input.documentId });
        }
        
        return {
          success: true,
          imported: members.length,
        };
      }),
  }),

  // Projects router
  projects: router({
    getAll: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getAllProjects(input?.documentId ?? 1)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getProject(input.id)),
    create: publicProcedure
      .input(z.object({
        projectName: z.string(),
        entity: z.string(),
        client: z.string().optional(),
        location: z.string().optional(),
        country: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        projectValue: z.string().optional(),
        projectYear: z.string().optional(),
        services: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const project = await createProject(input);
        return { success: true, project };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        projectName: z.string().optional(),
        entity: z.string().optional(),
        client: z.string().optional(),
        location: z.string().optional(),
        country: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        projectValue: z.string().optional(),
        projectYear: z.string().optional(),
        services: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProject(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProject(input.id);
        return { success: true };
      }),
    importFromNotion: publicProcedure
      .input(z.object({
        databaseId: z.string(),
        documentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { fetchNotionDatabase, validateProjectFields, parseNotionProjects } = await import('./notion');
        
        // Fetch Notion database
        const notionData = await fetchNotionDatabase(input.databaseId);
        
        // Validate fields
        const validation = validateProjectFields(notionData);
        if (!validation.valid) {
          return {
            success: false,
            error: `Missing required fields: ${validation.missingFields.join(', ')}`,
            availableFields: validation.availableFields,
          };
        }
        
        // Parse and import
        const projects = parseNotionProjects(notionData);
        
        if (projects.length === 0) {
          return {
            success: false,
            error: 'No projects found in Notion database',
          };
        }
        
        // Bulk insert
        for (const project of projects) {
          await createProject({ ...project, documentId: input.documentId });
        }
        
        return {
          success: true,
          imported: projects.length,
        };
      }),
  }),

  // Documents router
  documents: router({
    create: publicProcedure
      .input(z.object({
        slug: z.string(),
        name: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const doc = await createDocument(input);
        return { success: true, document: doc };
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => await getDocumentBySlug(input.slug)),
    getAll: publicProcedure.query(async () => await getAllDocuments()),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        name: z.string().optional(),
        password: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const doc = await updateDocument(id, updates);
        return { success: true, document: doc };
      }),
    delete: publicProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDocument(input.documentId);
        return { success: true };
      }),
    copyContent: publicProcedure
      .input(z.object({
        sourceDocumentId: z.number(),
        targetDocumentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await copyDocumentContent(input.sourceDocumentId, input.targetDocumentId);
        return { success: true };
      }),
  }),

  // Comments router
  commentsRouter: router({
    add: publicProcedure
      .input(z.object({
        tabNumber: z.number(),
        tabName: z.string(),
        authorName: z.string(),
        authorEmail: z.string().optional(),
        commentText: z.string(),
      }))
      .mutation(async ({ input }) => {
        const comment = await addComment(input);
        return { success: true, comment };
      }),
    getByTab: publicProcedure
      .input(z.object({ tabNumber: z.number(), documentId: z.number().optional() }))
      .query(async ({ input }) => await getCommentsByTab(input.tabNumber, input.documentId ?? 1)),
    getAll: publicProcedure
      .input(z.object({ documentId: z.number() }).optional())
      .query(async ({ input }) => await getAllComments(input?.documentId ?? 1)),
    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markCommentAsRead(input.id);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteComment(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
