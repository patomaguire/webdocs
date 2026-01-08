import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Bid Template System", () => {
  describe("Settings Management", () => {
    it("should upsert and retrieve settings", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Upsert a setting
      const upsertResult = await caller.settings.upsert({
        key: "test_setting",
        value: "test_value",
      });
      expect(upsertResult.success).toBe(true);

      // Retrieve the setting
      const setting = await caller.settings.get({ key: "test_setting" });
      expect(setting).toBe("test_value");
    });

    it("should retrieve all settings", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const settings = await caller.settings.getAll();
      expect(Array.isArray(settings)).toBe(true);
    });
  });

  describe("Hero Section", () => {
    it("should upsert and retrieve hero section", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const heroData = {
        mainTitle: "Test Title",
        subtitle: "Test Subtitle",
        stampText: "TEST STAMP",
      };

      const upsertResult = await caller.hero.upsert(heroData);
      expect(upsertResult.success).toBe(true);

      const hero = await caller.hero.get();
      expect(hero).toBeDefined();
      if (hero) {
        expect(hero.mainTitle).toBe("Test Title");
        expect(hero.subtitle).toBe("Test Subtitle");
        expect(hero.stampText).toBe("TEST STAMP");
      }
    });
  });

  describe("Tabs Content", () => {
    it("should upsert and retrieve tab content", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const tabData = {
        tabNumber: 99,
        tabTitle: "Test Tab",
        htmlContent: "<p>Test content</p>",
        isVisible: true,
      };

      const upsertResult = await caller.tabs.upsert(tabData);
      expect(upsertResult.success).toBe(true);

      const tab = await caller.tabs.getByNumber({ tabNumber: 99 });
      expect(tab).toBeDefined();
      if (tab) {
        expect(tab.tabTitle).toBe("Test Tab");
        expect(tab.htmlContent).toBe("<p>Test content</p>");
        expect(tab.isVisible).toBe(true);
      }
    });

    it("should retrieve all tabs", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const tabs = await caller.tabs.getAll();
      expect(Array.isArray(tabs)).toBe(true);
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe("Team Members", () => {
    it("should create and retrieve team member", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const memberData = {
        name: "Test Member",
        title: "Test Title",
        bio: "Test bio",
        yearsExperience: 5,
        keySkills: "Testing, Development",
      };

      const createResult = await caller.team.create(memberData);
      expect(createResult.success).toBe(true);
      expect(createResult.member).toBeDefined();

      if (createResult.member) {
        const member = await caller.team.get({ id: createResult.member.id });
        expect(member).toBeDefined();
        if (member) {
          expect(member.name).toBe("Test Member");
          expect(member.title).toBe("Test Title");
          expect(member.yearsExperience).toBe(5);
        }
      }
    });

    it("should update team member", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const memberData = {
        name: "Update Test",
        title: "Original Title",
      };

      const createResult = await caller.team.create(memberData);
      expect(createResult.success).toBe(true);

      if (createResult.member) {
        const updateResult = await caller.team.update({
          id: createResult.member.id,
          title: "Updated Title",
        });
        expect(updateResult.success).toBe(true);

        const updated = await caller.team.get({ id: createResult.member.id });
        expect(updated?.title).toBe("Updated Title");
      }
    });

    it("should delete team member", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const memberData = {
        name: "Delete Test",
        title: "Test Title",
      };

      const createResult = await caller.team.create(memberData);
      expect(createResult.success).toBe(true);

      if (createResult.member) {
        const deleteResult = await caller.team.delete({ id: createResult.member.id });
        expect(deleteResult.success).toBe(true);

        const deleted = await caller.team.get({ id: createResult.member.id });
        expect(deleted).toBeNull();
      }
    });
  });

  describe("Projects", () => {
    it("should create and retrieve project", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const projectData = {
        projectName: "Test Project",
        entity: "TEST",
        client: "Test Client",
        location: "Test Location",
        country: "Test Country",
        projectValue: "$100K",
        projectYear: "2024",
      };

      const createResult = await caller.projects.create(projectData);
      expect(createResult.success).toBe(true);
      expect(createResult.project).toBeDefined();

      if (createResult.project) {
        const project = await caller.projects.get({ id: createResult.project.id });
        expect(project).toBeDefined();
        if (project) {
          expect(project.projectName).toBe("Test Project");
          expect(project.entity).toBe("TEST");
          expect(project.client).toBe("Test Client");
        }
      }
    });

    it("should update project", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const projectData = {
        projectName: "Update Test Project",
        entity: "TEST",
      };

      const createResult = await caller.projects.create(projectData);
      expect(createResult.success).toBe(true);

      if (createResult.project) {
        const updateResult = await caller.projects.update({
          id: createResult.project.id,
          projectValue: "$200K",
        });
        expect(updateResult.success).toBe(true);

        const updated = await caller.projects.get({ id: createResult.project.id });
        expect(updated?.projectValue).toBe("$200K");
      }
    });

    it("should delete project", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const projectData = {
        projectName: "Delete Test Project",
        entity: "TEST",
      };

      const createResult = await caller.projects.create(projectData);
      expect(createResult.success).toBe(true);

      if (createResult.project) {
        const deleteResult = await caller.projects.delete({ id: createResult.project.id });
        expect(deleteResult.success).toBe(true);

        const deleted = await caller.projects.get({ id: createResult.project.id });
        expect(deleted).toBeNull();
      }
    });
  });

  describe("Comments", () => {
    it("should add and retrieve comments", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const commentData = {
        tabNumber: 1,
        tabName: "Test Tab",
        authorName: "Test Author",
        authorEmail: "author@test.com",
        commentText: "This is a test comment",
      };

      const addResult = await caller.commentsRouter.add(commentData);
      expect(addResult.success).toBe(true);
      expect(addResult.comment).toBeDefined();

      const comments = await caller.commentsRouter.getByTab({ tabNumber: 1 });
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
    });

    it("should mark comment as read", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const commentData = {
        tabNumber: 2,
        tabName: "Test Tab 2",
        authorName: "Test Author",
        commentText: "Test comment for read status",
      };

      const addResult = await caller.commentsRouter.add(commentData);
      expect(addResult.success).toBe(true);

      if (addResult.comment) {
        expect(addResult.comment.isRead).toBe(false);

        const markResult = await caller.commentsRouter.markAsRead({ id: addResult.comment.id });
        expect(markResult.success).toBe(true);
      }
    });

    it("should delete comment", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const commentData = {
        tabNumber: 3,
        tabName: "Test Tab 3",
        authorName: "Test Author",
        commentText: "Comment to be deleted",
      };

      const addResult = await caller.commentsRouter.add(commentData);
      expect(addResult.success).toBe(true);

      if (addResult.comment) {
        const deleteResult = await caller.commentsRouter.delete({ id: addResult.comment.id });
        expect(deleteResult.success).toBe(true);
      }
    });

    it("should retrieve all comments", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const allComments = await caller.commentsRouter.getAll();
      expect(Array.isArray(allComments)).toBe(true);
    });
  });
});
