# MobileHaat Dashboard — Architecture Review

Review date: 2026-09-08 · Based on direct inspection of the `dashboard/` package.

## Summary

`dashboard/` is a Next.js 16 + Redux Toolkit admin panel. Features are co-located under `app/(protected)/<feature>/` with a uniform CRUD convention (`page → PageHeader → Wrapper → TableHeader → Table → Modal → Form`, plus `*.api.ts / *.dto.ts / *.type.ts`). All RTK Query endpoints inject into one shared `configApi` (except the scraper AI API). Auth is next-auth Credentials gated at the **layout level** (server redirect) plus a client `withAuth` permission HOC per page; route protection is **not** in `proxy.ts`. Feature code quality is consistent; the smells are mostly dead template code, small cross-cutting inconsistencies, and a few correctness risks.

## Module Map

| Area | Location | Role |
|---|---|---|
| Routes (protected) | `app/(protected)/<feature>/` | All admin features: authors, brands, budget-phones, comparisons, contacts, media, newsletter, phone-categories, phone-comments, phones (+AI/price-history), post-categories, post-comments, posts, settings, users, dashboard |
| Routes (public) | `app/(public)/auth/` | Sign-in + sign-in error |
| Auth | `config/auth.ts`, `config/session.ts`, `app/api/auth/[...nextauth]/route.ts` | next-auth v4 Credentials, JWT strategy, 15-day maxAge |
| API layer | `config/reduxApiConfig.ts` (configApi), `config/scraperApiConfig.ts` (scraperApi) | RTK Query base; Bearer token from Redux store; 401 → `/auth/refresh` |
| State | `app/global.slice.ts`, `config/reduxStoreConfig.ts`, `config/reduxTags.ts` | Single `Global` slice (auth, permissions, siteSettings); 26 cache tags |
| UI | `components/ui/` (35 shadcn primitives), `components/common/` | radix-vega style, Tailwind v4, lucide icons |
| Shell | `components/app-sidebar.tsx`, `site-header.tsx`, `nav-*.tsx` | Sidebar + header |
| Shared helpers | `lib/` (fetcher, utils, select, date), `hooks/`, `config/permissions.ts` | Domain-agnostic tools + permission model |

## Dependency Flow

```
pages (app/(protected)/<feature>/)
  → Wrapper (withAuth + QueryAndModalWrapper)
  → hooks (use*Table, useCustomForm) ⟶ *.api.ts → configApi (RTK)
  → config/reduxApiConfig.ts  ──401──▶ /auth/refresh → dispatch login (Redux)

server:
  app/layout + (protected)/layout → getUserAuthSession (cookie JWT) → redirect if none
  generateMetadata / page data → lib/fetcher.ts (server fetch, x-api-key)

state:
  global.slice (auth, permissions, siteSettings)
    ⇠ RootLayout (session + siteSettings prop drill)
    ⇠ InitialDataProvider (permission queries, full-screen loader)
```

## Boundary Rules

- **Feature code stays in its route folder** — no monolith `components/features/`. API objects inject endpoints into the shared `configApi`.
- **Only the AI panels (`phones/ai`, `budget-phones/ai`) inject into `scraperApi`** — everything else uses `configApi`.
- **UI primitives** in `components/ui/`, reusable domain-agnostic pieces in `components/common/`, cross-cutting state in `config/` + `app/global.*`.
- **Auth boundary**: session gate is server-side (layout); permission gate is client-side (HOC, element `Permission`, `usePermission` hook).

## Findings

### High priority

1. **`API_KEY` may be sent as literal `"undefined"`** — `config/reduxApiConfig.ts:11` does `headers.set("x-api-key", process.env["API_KEY"] as string)`, but `.env.local` has `API_KEY` commented out. If unset, every request carries an `x-api-key: undefined` header. Server fetcher (`lib/fetcher.ts`) does the same via `config.headers`. Fix: only set the header when the key exists, or move the real key into `.env.local`.

2. **Two independent token-refresh loops** — `config/auth.ts` (next-auth JWT callback, cookie) and `config/reduxApiConfig.ts:21` (RTK baseQuery, Redux store) both call `/auth/refresh` and write to different stores. When one refreshes and the other does not, the session cookie and Redux auth diverge → unexpected 401s after expiry. Pick one owner: RTK should source its token from the session, or drop the RTK reauth loop.

3. **`generateMetadata` + `RootLayout` each call `getSiteSettings()`** — `app/layout.tsx:19` and `:37` hit `/web-settings/public` twice per page. Pass the fetched value through or cache briefly.

4. **`UserRole.user = "USER  "`** — `app/global.constants.ts:11` has trailing whitespace; any comparison with `"USER"` silently fails. Also `PERMISSIONS` uses the legacy `user.view` style while the real system is `resource:action:scope` (`config/permissions.ts`) — `global.constants.ts` is stale/dead.

### Medium priority

5. **Global state lives under `app/`** — `global.slice.ts`, `global.type.ts`, `global.api.tsx`, `global.constants.ts` sit beside route pages. They are app-wide infra, not routes. Recommend relocating to a `store/` or `features/core/` folder (near one-move with the `@/` alias).

6. **Sidebar is not permission-driven** — `components/app-sidebar.tsx` renders a static `data` object unfiltered; every user sees every link even if the page denies access. It also carries shadcn filler items ("Capture/Proposal/Prompts", `url: "#"`), a fake `data.user` ("shadcn"), and exports `menuItems` that is never imported. Filter nav by `usePermission`, drop filler, remove `menuItems`.

7. **`withAuth` session logic is dead code** — session/loader branches in `components/hoc/withAuth.tsx` are all commented out; only permission checks run. Acceptable because the layout gates sessions, but document the split or strip the dead branches.

8. **`export const {} = xApi` no-op inconsistency** — used at the end of `authors`, `brands`, `phone-categories`, `post-categories`, `newsletter` API files; other files destructure their hooks instead. Choose one pattern.

### Low priority

9. **Deletable cruft**: `components/data-table.tsx` (shadcn demo, imported nowhere — confirmed); empty `src/` directory; stray `testfile.txt` at dashboard root.

10. **Typos**: `app/(protected)/brands/From.tsx` and `app/(protected)/post-categories/From.tsx` (vs `Form.tsx` everywhere else).

11. **AGENTS.md drift**: root AGENTS.md says dashboard dev uses `next dev --turbopack`, but `package.json` script is plain `next dev`. `src/` is included in tsconfig yet empty.

## Strong Points

- Uniform per-feature 12-file convention — predictable for onboarding.
- Defense-in-depth auth (layout redirect + element-level `Permission` + `usePermission` hook) with a clean `SUPER_ADMIN` short-circuit.
- Single `configApi` + shared `reduxTags` keeps cache invalidation centralized and consistent.

## Suggested Next Steps (ordered)

1. Fix `x-api-key` header when unset (High #1).
2. Resolve the dual-refresh ownership (High #2).
3. Dedupe `getSiteSettings` in root layout (High #3).
4. Clean `global.constants.ts` and trailing-whitespace role (High #4).
5. Move `app/global.*` core state into `store/` (Medium #5).
6. Permission-filter the sidebar + remove filler/demo code (Medium #6, Low #9/#10).