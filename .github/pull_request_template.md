## Summary

- What problem does this PR solve?
- Which rendering/architecture layers are touched?

## Architecture Contract Impact

- [ ] `layouts/partials/extend-footer.html` remains a thin loader
- [ ] Calendar logic changes are confined to `static/js/calendar/*` (or none)
- [ ] No new inline `<script>/<style>` added under `layouts/`
- [ ] Data semantics unchanged (`content/posts/*`, `static/data/*`)

## Validation

- [ ] `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings`
- [ ] `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314` (if UI/calendar touched)
- [ ] Manual check on `/posts/pre-market-YYYY-MM-DD/` for transformed UI blocks

## Risk / Rollback

- Potential regression points:
- Rollback path:

## Notes for Reviewers

- Required focus areas:
- Follow-up tasks (if any):
