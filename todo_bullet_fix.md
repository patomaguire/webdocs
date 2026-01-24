# Bullet List Fix Investigation

## Task: Fix bullet rendering in "Who We Are" tab

### Steps:
- [ ] Query database to see exact htmlContent stored
- [ ] Check if content is markdown or HTML
- [ ] Trace rendering flow: DB → Proposal.tsx → renderContent() → Display
- [ ] Identify where bullets are lost
- [ ] Apply ONE targeted fix
- [ ] Test in Admin preview
- [ ] Test on website
- [ ] Save checkpoint only after full verification
