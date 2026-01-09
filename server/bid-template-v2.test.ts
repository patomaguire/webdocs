import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
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

  return ctx;
}

describe("Bid Template V2 Features", () => {
  it("should retrieve all settings including logo URLs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.settings.getAll();
    
    expect(settings).toBeDefined();
    expect(Array.isArray(settings)).toBe(true);
    
    // Check that settings can be retrieved
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      if (s.settingKey && s.settingValue) {
        settingsMap[s.settingKey] = s.settingValue;
      }
    });
    
    // Should have primary settings configured
    expect(settingsMap).toHaveProperty("password");
    expect(settingsMap).toHaveProperty("primary_color");
    // Logo URLs may or may not be set initially
  });

  it("should retrieve tabs with Spanish translation fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const tabs = await caller.tabs.getAll();
    
    expect(tabs).toBeDefined();
    expect(Array.isArray(tabs)).toBe(true);
    expect(tabs.length).toBeGreaterThan(0);
    
    // Check that tabs have both English and Spanish content fields
    const firstTab = tabs[0];
    expect(firstTab).toHaveProperty("htmlContent");
    expect(firstTab).toHaveProperty("htmlContentEs");
  });

  it("should retrieve team members with Spanish bio field", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const teamMembers = await caller.team.getAll();
    
    expect(teamMembers).toBeDefined();
    expect(Array.isArray(teamMembers)).toBe(true);
    
    if (teamMembers.length > 0) {
      const firstMember = teamMembers[0];
      expect(firstMember).toHaveProperty("bio");
      expect(firstMember).toHaveProperty("bioEs");
    }
  });

  it("should retrieve projects with coordinates for map display", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.getAll();
    
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    
    // Check that projects have coordinate fields
    const projectsWithCoords = projects.filter(p => p.latitude && p.longitude);
    expect(projectsWithCoords.length).toBeGreaterThan(0);
    
    // Verify coordinate format
    const firstProject = projectsWithCoords[0];
    expect(firstProject.latitude).toBeDefined();
    expect(firstProject.longitude).toBeDefined();
    expect(typeof firstProject.latitude).toBe("string");
    expect(typeof firstProject.longitude).toBe("string");
  });

  it("should add and retrieve comments by tab", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Add a test comment
    const result = await caller.comments.add({
      tabNumber: 1,
      tabName: "Test Tab",
      authorName: "Test Author",
      authorEmail: "test@example.com",
      commentText: "This is a test comment for V2 features",
    });

    expect(result).toBeDefined();
    // Comment was added successfully

    // Retrieve comments for the tab
    const comments = await caller.comments.getByTab({ tabNumber: 1 });
    
    expect(comments).toBeDefined();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    
    // Find our test comment
    const testComment = comments.find(c => c.commentText === "This is a test comment for V2 features");
    expect(testComment).toBeDefined();
    expect(testComment?.authorName).toBe("Test Author");
  });

  it("should filter projects by entity", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.getAll();
    
    // Get unique entities
    const entities = Array.from(new Set(projects.map(p => p.entity).filter(Boolean)));
    expect(entities.length).toBeGreaterThan(0);
    
    // Verify we can filter by entity
    const firstEntity = entities[0];
    const filteredProjects = projects.filter(p => p.entity === firstEntity);
    expect(filteredProjects.length).toBeGreaterThan(0);
    expect(filteredProjects.every(p => p.entity === firstEntity)).toBe(true);
  });

  it("should filter projects by service", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.getAll();
    
    // Get all services from all projects
    const allServices = projects.flatMap(p => {
      try {
        return JSON.parse(p.services || "[]");
      } catch {
        return [];
      }
    });
    
    const uniqueServices = Array.from(new Set(allServices));
    expect(uniqueServices.length).toBeGreaterThan(0);
    
    // Verify we can filter by service
    const firstService = uniqueServices[0];
    const filteredProjects = projects.filter(p => {
      try {
        const services = JSON.parse(p.services || "[]");
        return services.includes(firstService);
      } catch {
        return false;
      }
    });
    
    expect(filteredProjects.length).toBeGreaterThan(0);
  });

  it("should have hero section with stamp text", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const hero = await caller.hero.get();
    
    expect(hero).toBeDefined();
    expect(hero.mainTitle).toBeDefined();
    expect(hero.stampText).toBeDefined();
    expect(typeof hero.stampText).toBe("string");
  });

  it("should verify password setting exists for authentication", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const password = await caller.settings.get({ key: "password" });
    
    expect(password).toBeDefined();
    expect(typeof password).toBe("string");
    expect(password.length).toBeGreaterThan(0);
  });

  it("should have visible tabs for navigation", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const tabs = await caller.tabs.getAll();
    const visibleTabs = tabs.filter(t => t.isVisible);
    
    expect(visibleTabs.length).toBeGreaterThan(0);
    expect(visibleTabs.length).toBeGreaterThanOrEqual(12); // Should have at least 12 tabs
    
    // Verify tab numbers start from 0
    const tabNumbers = visibleTabs.map(t => t.tabNumber).sort((a, b) => a - b);
    expect(tabNumbers[0]).toBe(0);
    // Tab numbers should be present and sorted
    expect(tabNumbers.length).toBeGreaterThanOrEqual(12);
  });
});
