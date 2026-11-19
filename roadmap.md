# Roadmap

## Open

- [ ] Push the project to GitHub `mokestyle01/Jay-cars` (user's new target) — blocked: connect/sync is a UI-only action (Project settings → Git); no tool or command exposes it.
- [ ] Put the premium version on branch `version-1` and the sporty version on branch `version-2` — blocked: Lovable's Git sync carries one branch at a time, so the other two need a branch switch or a push from the user's machine.
- [ ] Move the backend from Lovable Cloud to the user's own Supabase project — blocked: the backend switch is a UI setting, and `.env` is auto-generated and must not be hand-edited.

## Done

- [x] Created the missing database tables, storage buckets and policies; fixed the crash that stopped the enquiry, vehicle and profile pages from loading.
