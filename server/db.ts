import { eq, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  documents,
  Document,
  InsertDocument,
  proposalSettings,
  ProposalSetting,
  InsertProposalSetting,
  heroSection,
  HeroSection,
  InsertHeroSection,
  tabsContent,
  TabContent,
  InsertTabContent,
  teamMembers,
  TeamMember,
  InsertTeamMember,
  projects,
  Project,
  InsertProject,
  comments,
  Comment,
  InsertComment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= Settings Functions =============

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(proposalSettings).where(eq(proposalSettings.settingKey, key)).limit(1);
    return result.length > 0 ? result[0].settingValue : null;
  } catch (error) {
    console.error("[Database] Failed to get setting:", error);
    return null;
  }
}

export async function getAllSettings(): Promise<ProposalSetting[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(proposalSettings);
  } catch (error) {
    console.error("[Database] Failed to get all settings:", error);
    return [];
  }
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(proposalSettings)
      .values({ settingKey: key, settingValue: value })
      .onDuplicateKeyUpdate({ set: { settingValue: value } });
  } catch (error) {
    console.error("[Database] Failed to upsert setting:", error);
  }
}

// ============= Hero Section Functions =============

export async function getHeroSection(): Promise<HeroSection | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(heroSection).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get hero section:", error);
    return null;
  }
}

export async function upsertHeroSection(data: Omit<InsertHeroSection, 'id'>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    const existing = await db.select().from(heroSection).limit(1);
    if (existing.length > 0) {
      await db.update(heroSection).set(data).where(eq(heroSection.id, existing[0].id));
    } else {
      await db.insert(heroSection).values(data);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert hero section:", error);
  }
}

// ============= Tabs Content Functions =============

export async function getAllTabs(): Promise<TabContent[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tabsContent).orderBy(asc(tabsContent.tabNumber));
  } catch (error) {
    console.error("[Database] Failed to get all tabs:", error);
    return [];
  }
}

export async function getTabByNumber(tabNumber: number): Promise<TabContent | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(tabsContent).where(eq(tabsContent.tabNumber, tabNumber)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get tab:", error);
    return null;
  }
}

export async function upsertTab(data: Omit<InsertTabContent, 'id'>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(tabsContent)
      .values(data)
      .onDuplicateKeyUpdate({ 
        set: { 
          tabTitle: data.tabTitle, 
          htmlContent: data.htmlContent,
          isVisible: data.isVisible ?? true
        } 
      });
  } catch (error) {
    console.error("[Database] Failed to upsert tab:", error);
  }
}

// ============= Team Members Functions =============

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  } catch (error) {
    console.error("[Database] Failed to get team members:", error);
    return [];
  }
}

export async function getTeamMember(id: number): Promise<TeamMember | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get team member:", error);
    return null;
  }
}

export async function createTeamMember(data: Omit<InsertTeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(teamMembers).values(data);
    const insertId = Number(result[0].insertId);
    return await getTeamMember(insertId);
  } catch (error) {
    console.error("[Database] Failed to create team member:", error);
    return null;
  }
}

export async function updateTeamMember(id: number, data: Partial<Omit<InsertTeamMember, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
  } catch (error) {
    console.error("[Database] Failed to update team member:", error);
  }
}

export async function deleteTeamMember(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete team member:", error);
  }
}

// ============= Projects Functions =============

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(projects).orderBy(asc(projects.sortOrder));
  } catch (error) {
    console.error("[Database] Failed to get projects:", error);
    return [];
  }
}

export async function getProject(id: number): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get project:", error);
    return null;
  }
}

export async function createProject(data: Omit<InsertProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(projects).values(data);
    const insertId = Number(result[0].insertId);
    return await getProject(insertId);
  } catch (error) {
    console.error("[Database] Failed to create project:", error);
    return null;
  }
}

export async function updateProject(id: number, data: Partial<Omit<InsertProject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(projects).set(data).where(eq(projects.id, id));
  } catch (error) {
    console.error("[Database] Failed to update project:", error);
  }
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(projects).where(eq(projects.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
  }
}

// ============= Comments Functions =============

export async function addComment(data: Omit<InsertComment, 'id' | 'createdAt'>): Promise<Comment | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(comments).values(data);
    const insertId = Number(result[0].insertId);
    const comment = await db.select().from(comments).where(eq(comments.id, insertId)).limit(1);
    return comment.length > 0 ? comment[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add comment:", error);
    return null;
  }
}

export async function getCommentsByTab(tabNumber: number): Promise<Comment[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(comments).where(eq(comments.tabNumber, tabNumber)).orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get comments by tab:", error);
    return [];
  }
}

export async function getAllComments(): Promise<Comment[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all comments:", error);
    return [];
  }
}

export async function markCommentAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(comments).set({ isRead: true }).where(eq(comments.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark comment as read:", error);
  }
}

export async function deleteComment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(comments).where(eq(comments.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete comment:", error);
  }
}

// ============================================================================
// Document Functions
// ============================================================================

export async function createDocument(doc: InsertDocument): Promise<Document> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(documents).values(doc);
  const [created] = await db.select().from(documents).where(eq(documents.id, result.insertId));
  return created;
}

export async function getDocumentBySlug(slug: string): Promise<Document | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [doc] = await db.select().from(documents).where(eq(documents.slug, slug));
  return doc;
}

export async function getDocumentById(id: number): Promise<Document | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  return doc;
}

export async function getAllDocuments(): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(documents).set(updates).where(eq(documents.id, id));
  return await getDocumentById(id);
}

export async function deleteDocument(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(documents).where(eq(documents.id, id));
  return true;
}
