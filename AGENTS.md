<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Two site versions share one codebase: `src/components/v1/*` (premium dark) and `src/components/v2/*` (sporty light), rendered by `src/routes/_authenticated/v1.tsx` and `v2.tsx`. Shared data/components live in `src/data/` and `src/components/shared/` so either branch can drop the other version's folder.
- Version styling is token-only: the `.theme-v1` / `.theme-v2` scopes in `src/styles.css` override semantic tokens, so components never hardcode colors and stay mergeable between branches.
- Auth is email/password only via `src/hooks/useAuth.tsx` — no social, phone or OTP providers; protected pages live under `src/routes/_authenticated/` so the gate is declared once.
- Customer vehicle submissions and order/consultation requests are stored in Supabase; keep customer-owned records and media behind row-level and storage policies.
- `user.user_metadata` can be null at runtime: read it through a defaulted local object, never index it directly off the user.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
