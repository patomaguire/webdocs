# Database Restoration Guide

## 📦 What Was Exported

**Export Date:** January 27, 2026  
**Version:** 938e0407  
**Export File:** `database-export.json` (186 KB)

### Exported Data:
- ✅ **1 document** ("default" document with all configurations)
- ✅ **43 tabs** (all tab content, settings, backgrounds, Notion URLs)
- ✅ **83 team members** (with photos, bios, certifications, industries, skills)
- ✅ **149 projects** (Experience Map data with coordinates, clients, services)
- ✅ **All comments** submitted by users
- ✅ **Hero section** (title, subtitle, logos, background)
- ✅ **Document settings** (colors, password, notification emails)

---

## 🚀 Step-by-Step Restoration in New Project

### **Step 1: Clone Repository**
The repository is already cloned in your new Manus project.

**Repository:** https://github.com/patomaguire/webdocs  
**Branch:** main  
**Commit:** 938e0407

---

### **Step 2: Push Database Schema**

In the new project terminal, run:

```bash
cd /home/ubuntu/client_name_proposal
pnpm db:push
```

**What this does:**
- Creates all 9 required tables in the new database
- Tables: documents, hero_section, tabs_content, team_members, projects, comments, tab_documents, proposal_settings, user

**Expected output:**
```
✓ Pushing schema changes to database
✓ Schema pushed successfully
```

---

### **Step 3: Copy Export File**

You have two options:

#### **Option A: Upload via Manus UI**
1. Download `database-export.json` from this session
2. In the new project, upload it to `/home/ubuntu/client_name_proposal/`

#### **Option B: Copy from this session**
If both sessions are active, copy the file:
```bash
# In this session, the file is at:
/home/ubuntu/client_name_proposal/database-export.json
```

---

### **Step 4: Run Import Script**

In the new project terminal:

```bash
cd /home/ubuntu/client_name_proposal
npx tsx import-database.mjs
```

**Expected output:**
```
📥 Starting database import...
📊 Found: 1 documents, 43 tabs, 83 team members, 149 projects
✅ Imported 1 documents
✅ Imported 1 hero sections
✅ Imported 43 tabs
✅ Imported 83 team members
✅ Imported 149 projects
✅ Imported X comments

✅ Database import completed successfully!
📅 Original export date: 2026-01-27...
🔖 Original version: 938e0407
```

---

### **Step 5: Verify Restoration**

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Open Admin interface:**
   - Navigate to `/admin` in the preview URL
   - Login with your Manus account

3. **Verify data:**
   - ✅ Documents tab: Should show "default" document
   - ✅ Hero tab: Should show title, subtitle, logos
   - ✅ Tabs tab: Should show all 43 tabs
   - ✅ Team tab: Should show 83 team members with photos
   - ✅ Projects tab: Should show 149 projects

4. **Open external view:**
   - Navigate to `/doc/default`
   - Password: `Default`
   - Verify all tabs, Experience Map, Teams section

---

## 🔧 Troubleshooting

### **Issue: Import fails with "duplicate entry" error**

**Solution:** The database already has data. Clear it first:

```bash
cd /home/ubuntu/client_name_proposal
npx tsx << 'EOF'
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { documents, heroSection, tabsContent, teamMembers, projects, comments } from './drizzle/schema.ts';
import { sql } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
await db.delete(comments);
await db.delete(projects);
await db.delete(teamMembers);
await db.delete(tabsContent);
await db.delete(heroSection);
await db.delete(documents);
await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

console.log('✅ Database cleared');
await connection.end();
EOF
```

Then re-run the import script.

---

### **Issue: Tables don't exist**

**Solution:** Run `pnpm db:push` first (Step 2).

---

### **Issue: Import script not found**

**Solution:** The import script is in the repository. If missing, create it:

```bash
cd /home/ubuntu/client_name_proposal
# The import-database.mjs file should be in the repo
# If not, copy it from the export package
```

---

## 📋 What's Included in Export

### **Documents Table:**
```json
{
  "id": "default",
  "title": "Test Title",
  "subtitle": "Test Subtitle",
  "stampText": "TEST STAMP",
  "password": "Default",
  "primaryColor": "#207db6",
  "secondaryColor": "#f5f5dc",
  "contrastColor": "#ffffff",
  "backgroundColor": "#f9f9f9",
  "logo1Url": "...",
  "logo2Url": "...",
  "logo3Url": "...",
  "logo4Url": "...",
  "notificationEmail": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### **Tabs Content (43 tabs):**
- Tab numbers: 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, etc.
- Each tab includes:
  - Tab title (English & Spanish)
  - HTML content
  - Background type & value
  - Notion database URLs (up to 3)
  - Introductory text (for Experience Map & Teams)
  - Visibility settings

### **Team Members (83 members):**
- All fields: name, title, bio, photoUrl, yearsExperience, keySkills, industry, certifications, sortOrder, isVisible

### **Projects (149 projects):**
- All fields: projectName, client, location, country, projectYear, projectValue, services, description, latitude, longitude, entity, isVisible

---

## ⚠️ Important Notes

1. **Photos are S3 URLs:** Team member photos and document logos are stored as S3 URLs. They will continue to work in the new project as long as the S3 bucket is accessible.

2. **Notion Integration:** If tabs have Notion database URLs, you'll need to ensure the Notion MCP server is configured in the new project.

3. **Password:** The "default" document password is `Default` (case-sensitive).

4. **Owner Information:** The owner email and notification settings are preserved in the export.

5. **Comments:** All user-submitted comments are included in the export.

---

## 📞 Support

If you encounter any issues during restoration:

1. Check that `pnpm db:push` completed successfully
2. Verify the export file is in the correct location
3. Check the import script output for specific error messages
4. Ensure the database connection string is correct in environment variables

---

## ✅ Success Checklist

After restoration, verify:

- [ ] Admin interface loads and shows all documents
- [ ] All 43 tabs are visible in Tabs tab
- [ ] 83 team members appear in Team tab with photos
- [ ] 149 projects appear in Projects tab
- [ ] External view (`/doc/default`) loads correctly
- [ ] Experience Map shows all projects on the map
- [ ] Teams section shows all team members with photos
- [ ] All tab content displays correctly
- [ ] Colors and logos match the original design

---

**End of Restoration Guide**
