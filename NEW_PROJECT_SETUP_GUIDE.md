# Complete New Project Setup Guide

## 🎯 Goal
Set up a new Manus webdev project named "webdocs" with proper folder naming and restore all data from the "default" document.

---

## 📋 Prerequisites

- Access to Manus platform
- GitHub account with access to `patomaguire/webdocs` repository
- The repository is now updated with database backup in the `database-backup/` folder

---

## 🚀 Step-by-Step Setup

### **Step 1: Create New Manus Webdev Project**

1. **In Manus, start a new webdev project:**
   - Click "New Project" or use the webdev initialization
   - **Project Name:** `webdocs` (this will create folder `/home/ubuntu/webdocs`)
   - **Template:** Choose the same template used originally (tRPC + Manus Auth + Database)

2. **Connect to GitHub:**
   - When prompted, connect to existing repository
   - **Repository:** `patomaguire/webdocs`
   - **Branch:** `main`
   - This will pull all code including the `database-backup/` folder

**Expected Result:**
```
Project "webdocs" created successfully
path: /home/ubuntu/webdocs
GitHub: Connected to patomaguire/webdocs
```

---

### **Step 2: Verify Repository Contents**

```bash
cd /home/ubuntu/webdocs
ls -la database-backup/
```

**You should see:**
```
database-backup/
├── RESTORATION_GUIDE.md
├── database-export.json (186 KB)
├── import-database.mjs
└── export-database.mjs
```

✅ If these files are present, the GitHub sync worked correctly.

---

### **Step 3: Install Dependencies**

```bash
cd /home/ubuntu/webdocs
pnpm install
```

**Expected output:**
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded 0, added XXX
Done in Xs
```

---

### **Step 4: Push Database Schema**

This creates all required tables in the new database:

```bash
cd /home/ubuntu/webdocs
pnpm db:push
```

**Expected output:**
```
✓ Pushing schema changes to database
✓ Schema pushed successfully
```

**What this creates:**
- `documents` table
- `hero_section` table
- `tabs_content` table
- `team_members` table
- `projects` table
- `comments` table
- `tab_documents` table
- `proposal_settings` table
- `user` table

---

### **Step 5: Import Database Data**

Now restore all the "default" document data:

```bash
cd /home/ubuntu/webdocs
npx tsx database-backup/import-database.mjs
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
📅 Original export date: 2026-01-27T...
🔖 Original version: 938e0407
```

---

### **Step 6: Start Development Server**

```bash
cd /home/ubuntu/webdocs
pnpm dev
```

**Expected output:**
```
Server running on http://localhost:3000/
```

---

### **Step 7: Verify Restoration**

#### **7.1 Check Admin Interface**

1. Open the preview URL (provided by Manus)
2. Navigate to `/admin`
3. Login with your Manus account

**Verify:**
- ✅ **Documents tab:** Shows "default" document
- ✅ **Hero tab:** Shows title "Test Title", subtitle, logos
- ✅ **Tabs tab:** Shows all 43 tabs
- ✅ **Team tab:** Shows 83 team members with photos
- ✅ **Projects tab:** Shows 149 projects

#### **7.2 Check External View**

1. Navigate to `/doc/default`
2. **Password:** `Default` (case-sensitive)
3. Click "Access Document"

**Verify:**
- ✅ Hero section displays with title, subtitle, stamp, logos
- ✅ All tabs are visible in navigation
- ✅ **Experience Map tab:** Shows interactive map with 149 projects, filters work
- ✅ **Teams tab:** Shows 83 team members in grid with circular photos
- ✅ All tab content displays correctly
- ✅ Colors match original design (primary: #207db6, secondary: #f5f5dc)

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Project folder is `/home/ubuntu/webdocs` (correct naming)
- [ ] GitHub connected to `patomaguire/webdocs`
- [ ] All dependencies installed (`node_modules` exists)
- [ ] Database schema pushed (9 tables created)
- [ ] Data imported successfully (1 doc, 43 tabs, 83 members, 149 projects)
- [ ] Dev server running on port 3000
- [ ] Admin interface loads and shows all data
- [ ] External view `/doc/default` works with password "Default"
- [ ] Experience Map displays all 149 projects on map
- [ ] Teams section shows all 83 members with photos
- [ ] All colors, logos, and styling match original

---

## 🔧 Troubleshooting

### **Issue 1: Folder name is still `client_name_proposal`**

**Cause:** You connected to an existing Manus project instead of creating a new one.

**Solution:** 
1. Create a completely NEW webdev project in Manus
2. When naming it, use "webdocs"
3. Then connect to the GitHub repository

---

### **Issue 2: `database-backup/` folder not found**

**Cause:** GitHub sync didn't pull the latest commit.

**Solution:**
```bash
cd /home/ubuntu/webdocs
git pull origin main
ls -la database-backup/
```

---

### **Issue 3: Import fails with "duplicate entry" error**

**Cause:** Database already has data (maybe from previous attempt).

**Solution:** Clear database first:
```bash
cd /home/ubuntu/webdocs
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

Then re-run import: `npx tsx database-backup/import-database.mjs`

---

### **Issue 4: Tables don't exist error**

**Cause:** Schema wasn't pushed.

**Solution:**
```bash
cd /home/ubuntu/webdocs
pnpm db:push
```

---

### **Issue 5: Photos not displaying**

**Cause:** S3 URLs should still work, but if not:

**Check:**
1. In Admin → Team tab, verify photoUrl fields have S3 URLs
2. S3 URLs should start with `https://...amazonaws.com/...`
3. If missing, you'll need to re-upload photos using the image picker

---

### **Issue 6: Colors/styling don't match**

**Cause:** Document settings might not have imported correctly.

**Solution:**
1. Go to Admin → Documents tab
2. Check "default" document settings:
   - Primary Color: `#207db6`
   - Secondary Color: `#f5f5dc`
   - Contrast Color: `#ffffff`
   - Background Color: `#f9f9f9`
3. If wrong, manually update and save

---

## 📊 What Gets Restored

### **Complete "default" Document:**
- Document ID: `default`
- Title: "Test Title"
- Subtitle: "Test Subtitle"
- Stamp: "TEST STAMP"
- Password: "Default"
- Colors: Primary (#207db6), Secondary (#f5f5dc), Contrast (#ffffff), Background (#f9f9f9)
- 4 logos (S3 URLs preserved)
- Notification email settings

### **43 Tabs:**
All tabs with their content, including:
- Tab 1: Who We Are
- Tab 800: Team
- Tab 1200: Experience Map
- Tab 100-1100: Various content tabs
- All HTML content, backgrounds, Notion URLs
- Introductory text for Experience Map and Teams

### **83 Team Members:**
All fields including:
- Name, Title, Bio (English & Spanish)
- Photo URLs (S3)
- Years of Experience
- Industries (semicolon-separated)
- Certifications (semicolon-separated)
- Key Skills (semicolon-separated)
- Sort order and visibility settings

### **149 Projects:**
All fields including:
- Project Name, Client, Location, Country
- Project Year, Project Value
- Services (semicolon-separated)
- Description
- Latitude/Longitude coordinates
- Entity (for marker colors)
- Visibility settings

### **All Comments:**
User-submitted comments with names, emails, and content

---

## 🎉 You're Done!

Once all verification steps pass, you have successfully:
- ✅ Created a new Manus project with proper naming (`webdocs`)
- ✅ Connected to GitHub repository
- ✅ Restored complete "default" document with all 90% completed design work
- ✅ Ready to continue development from exactly where you left off

**No data was lost. Everything is restored exactly as it was.**

---

## 📞 Need Help?

If you encounter issues not covered in troubleshooting:

1. Check the `database-backup/RESTORATION_GUIDE.md` for additional details
2. Verify environment variables are set correctly
3. Check dev server logs for specific error messages
4. Ensure database connection string is valid

---

**Repository:** https://github.com/patomaguire/webdocs  
**Latest Commit:** 5b33844 (includes database backup)  
**Export Date:** January 27, 2026  
**Version:** 938e0407
