# Multi-Tenancy Implementation - Batch Tracking

## Batch 1: Database Schema
- [ ] Add bids table to drizzle/schema.ts
- [ ] Add bidId column to proposal_settings table
- [ ] Add bidId column to hero_section table
- [ ] Add bidId column to tabs_content table
- [ ] Add bidId column to team_members table
- [ ] Add bidId column to projects table
- [ ] Add bidId column to comments table
- [ ] Run database migration (pnpm db:push)
- [ ] Verify all tables have correct structure
- [ ] Save Batch 1 checkpoint

## Batch 2: Database Functions
- [ ] Add bid management functions (getAllBids, getBidById, getBidBySlug, createBid, updateBid, deleteBid)
- [ ] Update getSetting to accept bidId
- [ ] Update getAllSettings to accept bidId
- [ ] Update upsertSetting to accept bidId
- [ ] Update getHeroSection to accept bidId
- [ ] Update upsertHeroSection to accept bidId
- [ ] Update getAllTabs to accept bidId
- [ ] Update getTabByNumber to accept bidId
- [ ] Update upsertTab to accept bidId
- [ ] Update getAllTeamMembers to accept bidId
- [ ] Update createTeamMember to accept bidId
- [ ] Update getAllProjects to accept bidId
- [ ] Update createProject to accept bidId
- [ ] Update addComment to accept bidId
- [ ] Update getCommentsByTab to accept bidId
- [ ] Update getAllComments to accept bidId
- [ ] Test database functions with manual queries
- [ ] Save Batch 2 checkpoint

## Batch 3: API Routers
- [ ] Add bids router (getAll, getById, getBySlug, create, update, delete)
- [ ] Update settings router to require bidId
- [ ] Update hero router to require bidId
- [ ] Update tabs router to require bidId
- [ ] Update team router to require bidId
- [ ] Update projects router to require bidId
- [ ] Update comments router to require bidId
- [ ] Test API endpoints manually
- [ ] Save Batch 3 checkpoint

## Batch 4: Data Migration
- [ ] Create seed script to create default bid
- [ ] Migrate existing proposal_settings to default bid
- [ ] Migrate existing hero_section to default bid
- [ ] Migrate existing tabs_content to default bid
- [ ] Migrate existing team_members to default bid
- [ ] Migrate existing projects to default bid
- [ ] Migrate existing comments to default bid
- [ ] Verify all data migrated correctly
- [ ] Save Batch 4 checkpoint

## Batch 5: Bid Management UI
- [ ] Add "Bids" tab to Admin interface
- [ ] Add bid list view
- [ ] Add create new bid form
- [ ] Add bid selection dropdown
- [ ] Add edit bid functionality
- [ ] Add delete bid functionality
- [ ] Test bid CRUD operations
- [ ] Save Batch 5 checkpoint

## Batch 6: Admin Interface Updates
- [ ] Update Settings tab to use selected bidId
- [ ] Update Hero Section tab to use selected bidId
- [ ] Update Tab Content tab to use selected bidId
- [ ] Update Team Members tab to use selected bidId
- [ ] Update Projects tab to use selected bidId
- [ ] Update Comments tab to use selected bidId
- [ ] Test all Admin tabs with multiple bids
- [ ] Save Batch 6 checkpoint

## Batch 7: Proposal Page Updates
- [ ] Update Proposal page to get bidSlug from URL
- [ ] Add bidSlug to password verification
- [ ] Update all queries to pass bidId
- [ ] Update comments submission to use bidId
- [ ] Test proposal viewing with multiple bids
- [ ] Save Batch 7 checkpoint

## Batch 8: Final Testing
- [ ] Create 3 test bids with different content
- [ ] Verify each bid has independent content
- [ ] Test switching between bids in Admin
- [ ] Test accessing different bids via URL
- [ ] Test password protection per bid
- [ ] Test all features work correctly
- [ ] Save final checkpoint
