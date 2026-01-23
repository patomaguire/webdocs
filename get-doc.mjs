import { db } from "./server/db.ts";
import { documents } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const doc = await db.select().from(documents).where(eq(documents.slug, "busplan_2026_01")).limit(1);
console.log(JSON.stringify(doc, null, 2));
