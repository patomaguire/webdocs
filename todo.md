# Bid Template System - TODO

## Phase 1: Database Schema
- [x] Update drizzle/schema.ts with all tables (proposal_settings, hero_section, tabs_content, team_members, projects, comments)
- [x] Run database migration with pnpm db:push

## Phase 2: Database Functions & API
- [x] Add database helper functions in server/db.ts for all entities
- [x] Create tRPC routers in server/routers.ts for settings, hero, tabs, team, projects, comments

## Phase 3: Admin Interface
- [x] Create Admin page with 6 tabs layout
- [x] Build Settings tab (password, email, colors, 4 logo URLs)
- [x] Build Hero Section tab (main title, subtitle, stamp text)
- [x] Build Tab Content tab (edit 12 tabs with HTML content and visibility)
- [x] Build Team Members tab (CRUD with photo, bio, skills, sort order)
- [x] Build Projects tab (CRUD with entity, location, coordinates, services)
- [x] Build Comments tab (view and delete comments)

## Phase 4: Proposal Viewing Page
- [x] Create password protection screen with database validation
- [x] Build 4-logo header (2 left, 2 right, center navigation)
- [x] Build hero section with title, subtitle, stamp badge
- [x] Build tab navigation for 12 tabs
- [x] Render tab content with HTML support
- [x] Build Team section (Tab 8) with member cards
- [x] Build Experience Map (Tab 11) with Entity and Service filters
- [x] Build comment form and display for each tab

## Phase 5: Seed Data
- [x] Create seed script with default password, email, colors, logos
- [x] Add 12 default tab templates
- [x] Add sample team members
- [x] Add sample projects with coordinates
- [x] Run seed script

## Phase 6: Testing & Deployment
- [x] Test password protection
- [x] Test all admin CRUD operations
- [x] Test proposal page rendering
- [x] Test filters on Experience Map
- [x] Test comment submission
- [x] Save checkpoint for publishing

## Phase 7: Fix Missing Features
- [x] Review BID_TEMPLATE_INSTRUCTIONS.md for all requirements
- [x] Add 4-logo header layout (2 left, 2 right) with proper display
- [x] Add Print button to header
- [x] Add Language selector to header
- [x] Fix tab layout - vertical side navigation instead of horizontal
- [x] Implement interactive Google Maps for Experience Map section
- [x] Test all corrections
- [x] Save updated checkpoint

## Phase 8: Fix User-Reported Issues
- [x] Remove duplicate "Experience map" button from header (keep only in sidebar)
- [x] Fix language flag logic - show Spanish flag when in English mode, UK flag when in Spanish mode
- [x] Change Entity and Service filters from dropdowns to buttons
- [x] Add Client filter alongside Entity and Service filters
- [x] Test all fixes
- [x] Save final checkpoint

## Phase 9: Additional User-Reported Issues
- [x] Fix "Print All" button to print entire document (all tabs), not just current section
- [x] Reduce all button sizes to 70% by default
- [x] Move tab buttons horizontally under hero section (tabs 0-11 in 2 rows)
- [x] Add horizontal scrolling for tabs on mobile view
- [x] Test all fixes
- [x] Save final checkpoint

## Phase 10: UI Improvements and Customization
- [x] Move "Who we are" and "Experience map" buttons to hero section (below stamp)
- [x] Simplify top banner to show only Print and Language buttons
- [x] Fix Union Jack flag to show proper design (not horizontal stripes)
- [x] Limit tab navigation to show only tabs 1-10
- [x] Add "Back to Top" button before comments section on each tab
- [x] Add background customization option (flat color or soft moving image)
- [x] Add Google Maps API key field to Admin → Settings
- [x] Test all changes
- [x] Save final checkpoint

## Phase 11: Fix Comments Functionality
- [x] Display submitted comments below the comment form
- [x] Ensure comments are properly saved to database
- [x] Fix Print Comments to show all submitted comments with proper formatting
- [x] Test comment submission and display
- [ ] Save final checkpoint
