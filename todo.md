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
- [x] Save final checkpoint

## Phase 12: Final Requirements Implementation
- [x] Add delete button for comments in Admin → Comments tab (already implemented)
- [x] Verify Google Maps API key integration works with Experience Map (properly integrated)
- [x] Verify all content is editable via Admin interface (no hard-coded content)
- [x] Design multi-tenancy database schema with bid isolation
- [x] Add bids table (id, name, slug, password, createdAt, updatedAt)
- [x] Add bidId foreign key to all content tables (settings, hero, tabs, team, projects, comments)
- [x] Update all database queries to filter by bidId
- [ ] Add bids router to server/routers.ts
- [x] Add bids router to server/routers.ts
- [ ] Update Admin interface to pass bidId to all API calls
- [ ] Update Proposal page to determine bidId and pass to all queries
- [ ] Create bid management UI in Admin (create, list, switch, delete bids)
- [ ] Add bid selection/switching in Admin interface
- [ ] Test creating multiple bids with independent content
- [ ] Test switching between bids in Admin
- [ ] Test accessing different bids via unique URLs
- [ ] Save final checkpoint with complete multi-tenant system

## Phase 13: Logo Display Fix
- [x] Update header logo display to hide empty logo slots
- [x] Ensure no placeholders or gaps when logos are not provided
- [x] Test with 1, 2, 3, and 4 logos to verify graceful layout

## Phase 14: Critical Bug Fixes (Mobile & Print Issues)
- [x] Fix Print All button - currently only prints current page instead of all tabs
- [x] Fix Print Comments button - displays comments but doesn't trigger print dialog
- [x] Fix tab navigation buttons - must scroll to beginning of section content
- [x] Fix Experience Map - showing blank map instead of project markers

## Phase 15: Header Layout and Map Fixes
- [x] Center 3 print buttons horizontally in header
- [x] Move language toggle to far right in header
- [x] Fix tab button scroll - not jumping to section start
- [x] Enable Google Maps API immediately with dummy coordinates
- [x] Make map markers visible with test data

## Phase 16: Google Maps API Key from Environment
- [x] Add GOOGLE_MAPS_API_KEY to server environment configuration
- [x] Create backend endpoint to expose API key from environment
- [x] Update frontend to fetch API key from environment endpoint
- [x] Write and pass test for API key endpoint
