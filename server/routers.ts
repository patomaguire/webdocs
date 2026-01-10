import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";

// Default bid ID for single-tenant mode (will be replaced with dynamic bidId in multi-tenant mode)
const DEFAULT_BID_ID = 1;
import {
  getAllBids,
  getBidById,
  getBidBySlug,
  createBid,
  updateBid,
  deleteBid,
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
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
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
    getAll: publicProcedure.query(async () => await getAllSettings(DEFAULT_BID_ID)),
    getGoogleMapsApiKey: publicProcedure.query(() => {
      return { apiKey: ENV.googleMapsApiKey };
    }),
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => await getSetting(DEFAULT_BID_ID, input.key)),
    upsert: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await upsertSetting(DEFAULT_BID_ID, input.key, input.value);
        return { success: true };
      }),
  }),

  // Hero section router
  hero: router({
    get: publicProcedure.query(async () => await getHeroSection(DEFAULT_BID_ID)),
    upsert: publicProcedure
      .input(z.object({
        mainTitle: z.string(),
        subtitle: z.string().optional(),
        stampText: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await upsertHeroSection({ ...input, bidId: DEFAULT_BID_ID });
        return { success: true };
      }),
  }),

  // Tabs content router
  tabs: router({
    getAll: publicProcedure.query(async () => await getAllTabs(DEFAULT_BID_ID)),
    getByNumber: publicProcedure
      .input(z.object({ tabNumber: z.number() }))
      .query(async ({ input }) => await getTabByNumber(DEFAULT_BID_ID, input.tabNumber)),
    upsert: publicProcedure
      .input(z.object({
        tabNumber: z.number(),
        tabTitle: z.string(),
        htmlContent: z.string().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await upsertTab({ ...input, bidId: DEFAULT_BID_ID });
        return { success: true };
      }),
  }),

  // Team members router
  team: router({
    getAll: publicProcedure.query(async () => await getAllTeamMembers(DEFAULT_BID_ID)),
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
        const member = await createTeamMember({ ...input, bidId: DEFAULT_BID_ID });
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
  }),

  // Projects router
  projects: router({
    getAll: publicProcedure.query(async () => await getAllProjects(DEFAULT_BID_ID)),
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
        const project = await createProject({ ...input, bidId: DEFAULT_BID_ID });
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
  }),

  // Comments router
  comments: router({
    add: publicProcedure
      .input(z.object({
        tabNumber: z.number(),
        tabName: z.string(),
        authorName: z.string(),
        authorEmail: z.string().optional(),
        commentText: z.string(),
      }))
      .mutation(async ({ input }) => {
        const comment = await addComment({ ...input, bidId: DEFAULT_BID_ID });
        return { success: true, comment };
      }),
    getByTab: publicProcedure
      .input(z.object({ tabNumber: z.number() }))
      .query(async ({ input }) => await getCommentsByTab(DEFAULT_BID_ID, input.tabNumber)),
    getAll: publicProcedure.query(async () => await getAllComments(DEFAULT_BID_ID)),
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

  // Bids router
  bids: router({
    getAll: publicProcedure.query(async () => await getAllBids()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getBidById(input.id)),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => await getBidBySlug(input.slug)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const bid = await createBid(input);
        return { success: true, bid };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        password: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateBid(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBid(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
