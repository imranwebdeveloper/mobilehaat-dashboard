# Dashboard Production Readiness Report

**Date:** 2026-09-19  
**Package:** dashboard (Next.js 16.3.1, React 19)  
**Port:** 3000  
**Status:** Build passes, TypeScript passes, ESLint fails (6 errors, 66 warnings)

---

## Verification Summary

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run lint` | Failed — 6 errors, 66 warnings |
| Docker multi-stage build | Passed |
| Security headers (proxy) | Partial — missing CSP |

---

## Critical — Must Fix Before Production

### 1. Hardcoded JWT API key in `.env.local`
`.env.local:9` — uncommented `API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` is a live JWT token stored in plaintext. The `.env` file comments this out, but `.env.local` does not. Even though `.env.local` is gitignored, this is a production credential risk. **Rotate this key immediately** and move it to your deployment platform's secret manager.

### 2. Image optimization disabled
`next.config.mjs:6` — `images: { unoptimized: true }` disables Next.js Image Optimization. Same issue as frontend. Remove or configure a CDN loader.

### 3. Missing Content Security Policy (CSP)
`proxy.ts` — unlike the frontend, the dashboard proxy has no CSP header. Add a restrictive CSP for the admin panel, especially since it uses rich text editors (`jodit-react`) and third-party UI libraries.

### 4. Production URLs still set to localhost
- `.env:3` — `NEXTAUTH_URL=http://localhost:3000`
- `.env:5` — `API_URL=http://localhost:5000/api`
- `.env:8` — `SCRAPER_API_URL=http://localhost:5010/api`
- `.env.local:3-5,8` — same localhost values

These must be updated to production URLs before deployment.

### 5. Localhost fallback in code
`useComparisonTable.tsx:138` — hardcoded `http://localhost:3001` fallback when `NEXT_PUBLIC_FRONTEND_URL` is missing.

---

## Should Fix

### 6. ESLint: 6 errors
- **`no-explicit-any`** (3 instances): `comparisons/Form.tsx:43/233/276`
- **`no-explicit-any`** (1 instance): `sellers/[id]/Wrapper.tsx:463`
- **`no-explicit-any`** (2 instances): `sellers/useSellerForm.ts:26/31`

### 7. TanStack Table + React Hook Form React Compiler warnings (many)
Multiple `incompatible-library` warnings across table hooks (`useReactTable`) and form hooks (`form.watch()`). These are safe to ignore if you're not enabling React Compiler, but will become errors if you enable it. Consider adding `"use memo"` pragmas or disabling React Compiler for these files.

### 8. Unused imports/variables (many warnings)
Examples: `authors/useAuthorTable.tsx:55`, `brands/useBrandTable.tsx`, `budget-phones/TableHeader.tsx:22`, `contacts/contacts.dto.ts:4`, `pending-comments.tsx:3/61`, `recent-contacts.tsx:3/62`, `recent-phones-table.tsx:3`, `user-media/UserMediaTable.tsx:89`

### 9. `<img>` elements instead of `next/image`
`signin-form.tsx:65`, `apple-icon.tsx:28`, `icon.tsx:29` — replace with `<Image />` for better performance.

### 10. Console.error statements
`config/auth.ts:71`, `notification/NotificationBell.tsx:46/54`, `comparisons/Form.tsx:373` — consider routing to a logging service in production.

---

## Good Practices Already In Place

- Protected routes with server-side auth guard (`app/(protected)/layout.tsx`)
- Server component metadata fetching from backend (`layout.tsx:18-29`)
- Security headers in proxy: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS` with `preload`, `Permissions-Policy`
- Docker multi-stage build + non-root `nextjs` user
- `poweredByHeader: false`
- `.env` and `.env.local` are gitignored

---

## Recommended Next Steps

1. **Rotate the leaked API key** in `.env.local:9` immediately and remove it from the file
2. Update `.env` and `.env.local` with production URLs (`NEXTAUTH_URL`, `API_URL`, `SCRAPER_API_URL`, `NEXT_PUBLIC_FRONTEND_URL`)
3. Add CSP headers to `proxy.ts`
4. Fix 6 ESLint `no-explicit-any` errors
5. Remove `unoptimized: true` from `next.config.mjs` or configure image loader
6. Replace localhost fallback in `useComparisonTable.tsx:138`
7. Clean up unused imports
8. Replace `<img>` with `<Image />` in auth form and icon files
9. Add error tracking for production visibility
