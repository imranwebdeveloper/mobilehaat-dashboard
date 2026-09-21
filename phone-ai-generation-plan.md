# Dashboard — AI Phone Generation Integration Plan

## Goal

Integrate the scraper's API into the dashboard phone create flow so an admin can:

1. Open the **Create Phone** page and pick between two tabs: **Manual** and **AI Generate**.
2. In **AI Generate**: paste a spec-page URL → scraper fetches + Gemini generates the full structured spec.
3. Review the result (structure + editorial), **Approve** it.
4. Click **Fill Form** → the existing **Manual** form is populated with all generated values.
5. Review / fix anything (thumbnail, categories, brand) and submit through the normal backend flow.

No duplicate "AI phone" listing — the manual form stays the single source of truth for creating the catalog phone.

---

## Critical constraint discovered

```
backend/.env  DB=mongodb+srv://…/mobi-ghor          ← dashboard reads/writes here
scraper/.env  MONGODB_URI=mongodb+srv://…/mobile-scraper  ← scraper's own DB
```

The scraper's `POST /:id/approve` creates a `Phone` document in the **scraper's** DB (`mobile-scraper`), which the dashboard never reads. Therefore:

- **Do NOT rely on the scraper `/approve` result as the catalog phone.** It is only a tracking flag on the extraction.
- The real phone is created when the user submits the **Manual** form → backend `POST /api/phones` (DB `mobi-ghor`).
- The **Fill Form** step is the bridge: scraper `structuredData` → dashboard `PhoneFormValues`.

---

## Architecture

```
+------------------+          +------------------+          +------------------+
|  Dashboard UI    |  HTTP    |  Scraper API     |  HTTP    |  Backend API     |
|  (Next.js 3000)  | -------> |  (NestJS 5010)   | -------> |  (NestJS 5000)   |
|                  |          |                  |          |                  |
|  Manual tab      |          | POST /mobile-    |          | POST /phones     |
|  AI tab (new)    |          |   extractions    |          |   (mobi-ghor)    |
|  RTK Query       |          | GET /:id         |          |                  |
|  (new scraper    |          | POST /:id/       |          |                  |
|   slice, 5010)   |          |   regenerate     |          |                  |
+------------------+          |   generate-      |          +------------------+
                              |   editorial      |
                              |   approve        |
                              +------------------+
```

Two independent RTK Query APIs on the dashboard:

| Slice | baseUrl | Used for |
|---|---|---|
| `configApi` (existing) | `API_URL` = backend (5000) | phone CRUD, brands, media, categories |
| `scraperApi` (new) | `SCRAPER_API_URL` = scraper (5010) | extraction lifecycle + AI data |

The scraper has **no auth** and **open CORS** — OK for local dev. For production, add an API-key header (see "Security" below).

---

## Scraper API surface to integrate

All under `http://localhost:5010/api`, no auth, rate-limited (100 req/60s).

| Endpoint | Method | Purpose | Response |
|---|---|---|---|
| `/mobile-extractions` | POST | Create extraction from `{ url }`, runs pipeline synchronously (fetch → Gemini → validate) | `MobileExtractionDocument` (final status `completed`/`failed`) |
| `/mobile-extractions` | GET | List, `?status=&limit=&offset=` (cap 100, sort `updatedAt: -1`) | `MobileExtractionDocument[]` |
| `/mobile-extractions/:id` | GET | Fetch one | `MobileExtractionDocument` |
| `/mobile-extractions/:id/regenerate` | POST | Re-run structure generation, body `{ model? }` | `MobileExtractionDocument` |
| `/mobile-extractions/:id/generate-editorial` | POST | Generate SEO meta + pros/cons (English), body `{ model? }` | `MobileExtractionDocument` (status stays `completed`) |
| `/mobile-extractions/:id/approve` | POST | Mark approved + creates a Phone in the **scraper** DB (tracking only) | `{ extraction, phone }` |

### Status lifecycle
`pending → fetching → extracted → generating → completed | failed`, plus `regenerate`/`generate-editorial` re-entering `generating`.

### Key response shapes
- `structuredData` — matches `GeneratedPhoneStructureSchema` (scraper) / `CreatePhoneDto` (backend) field-for-field.
- `editorialData` — `{ meta_title, meta_description, meta_keywords, pros[], cons[] }`.

---

## New files (dashboard)

```
app/(protected)/phones/
  ai/
    ai.api.ts                # scraperApi endpoints (create, list, get, regenerate, editorial, approve)
    ai.types.ts              # MobileExtraction, ExtractionStatus, AiStructure, AiEditorial types
    mapToFormValues.ts       # structuredData + editorial → PhoneFormValues (the bridge)
    AiGeneratePanel.tsx      # AI tab UI (URL form, status, preview, actions)
  create/
    Wrapper.tsx              # (edited) tabs: Manual / AI Generate, shared draft state
    page.tsx                 # (unchanged metadata; Wrapper handles tabs)

config/
  scraperApiConfig.ts        # second createApi with baseUrl = SCRAPER_API_URL
```

`usePhoneForm.ts` — add optional `aiDraft` handling: when a draft is present, `form.reset(mappedValues)` then clear it.

---

## Data mapping: `mapToFormValues.ts`

Pure function:

```ts
mapAiToFormValues(
  structure: AiStructure,
  editorial?: AiEditorial | null,
): PhoneFormValues
```

| Scraper field | Dashboard form field | Notes |
|---|---|---|
| `title` | `title` | direct |
| `brand` (string) | `brand` (brand `_id`) | **resolved async** via `/brands?name=…`; if not found → leave empty + toast "Brand not found, pick manually" |
| `model` | `model` | direct |
| `slug` | `slug` | direct, or auto-generate |
| `announced` / `released` (`YYYY-MM-DD`) | same | direct — already matches `<Input type="date" />` |
| `bd_status` | `bd_status` | enum matches |
| `expert_rating` | `expert_rating` | number |
| `approximate_price_bd` | `approximate_price_bd` | number |
| `phone_type` | `phone_type` | array, enum matches |
| `variants[]` | `variants[]` | map `ram/storage/official_price/unofficial_price/currency` (prices already default `0`) |
| `os` / `platform` / `memory` / `display` / `battery` / `network` / `connectivity` / `body` / `sound` / `features` | same group | shapes match; `others` (KeyValue) mapped as `{name,value,value_type,group}` |
| `front_camera` / `back_camera` | same | `cameras[]` + features + videos + others |
| `pros` / `cons` | `pros` / `cons` | prefer `editorial.pros/cons`, else `structure.pros/cons` |
| `meta_title/description/keywords` | `meta_title/meta_description/meta_keywords` | from `editorialData` |
| `sources[]` | `sources[]` | `{label, url}` direct |
| — | `thumbnail` | **not generated** — leave empty; user picks via MediaPicker (required by form) |
| — | `categories` | leave empty; user picks |
| — | `status` | default `DRAFT` |

### Brand resolution
`AiGeneratePanel` → on "Fill Form": call `GET /brands?name=<structure.brand>` (via existing `getData`/`getAllBrand`), take first match → `{ label, value: _id }`; set as the form's brand option. Not found → warn + leave empty.

---

## Tab UI design

`create/Wrapper.tsx` (client, `withAuth` PHONE_CREATE):

```tsx
const [tab, setTab] = useState<"manual" | "ai">("manual")
const [aiDraft, setAiDraft] = useState<PhoneFormValues | null>(null)

<Tabs value={tab} onValueChange={(v) => setTab(v as ...)} forceMount>
  <TabsList>
    <TabsTrigger value="manual">Manual</TabsTrigger>
    <TabsTrigger value="ai">AI Generate</TabsTrigger>
  </TabsList>
  <TabsContent value="manual" forceMount hidden={tab !== "manual"}>
    <PhoneForm aiDraft={aiDraft} onDraftConsumed={() => setAiDraft(null)} />
  </TabsContent>
  <TabsContent value="ai" forceMount hidden={tab !== "ai"}>
    <AiGeneratePanel onFillForm={(values) => { setAiDraft(values); setTab("manual") }} />
  </TabsContent>
</Tabs>
```

- `forceMount` keeps the Manual form mounted so typed work isn't lost when switching tabs (Radix default unmounts).
- `usePhoneForm` gets optional `aiDraft` prop → `useEffect` calls `form.reset(aiDraft)` + `onDraftConsumed()`.
- **Edit page** (`[id]/edit`) stays Manual-only — AI generate is a create-time feature.

---

## AI tab UI (`AiGeneratePanel.tsx`)

1. **URL input** + **Generate** button
   - Calls `POST /mobile-extractions` (synchronous; can take 15–60s). Show loading state + note.
2. **Status card** — extraction status, source URL, timestamps, last error.
3. **Generated structure preview** — collapsible summary: title, brand/model, bd_status, price, rating, variants count, per-group specs, `others` count.
4. **Editorial preview** — meta title/description/keywords, pros/cons (after "Generate Editorial").
5. **Actions** (gated by status):
   - `Regenerate` → `POST /:id/regenerate`
   - `Generate Editorial` → `POST /:id/generate-editorial`
   - `Approve` → `POST /:id/approve` (marks extraction approved; also creates a phone in scraper DB as a side effect — ignored)
   - `Fill Form` (enabled after structure `completed`) → `mapAiToFormValues` → `onFillForm(values)`
6. **Recent extractions** table (optional, nice-to-have): `GET /mobile-extractions?limit=10&status=` → list, click to load into preview.

---

## RTK Query setup

```ts
// config/scraperApiConfig.ts
export const scraperApi = createApi({
  reducerPath: "scraper",
  baseQuery: fetchBaseQuery({ baseUrl: process.env["SCRAPER_API_URL"] }),
  endpoints: () => ({}),
})
```

- Register in `reduxStoreConfig.ts` reducers + middleware.
- `ai.api.ts` uses `scraperApi.injectEndpoints({...})` with tag `"MobileExtraction"`.
- Add `SCRAPER_API_URL=http://localhost:5010/api` to `dashboard/.env.local` and `next.config.mjs` `env` block (mirror existing `API_URL` pattern).

---

## Implementation checklist

1. **Backend/scraper (no changes needed)** — all required endpoints already exist.
2. `config/scraperApiConfig.ts` + register in store.
3. `app/(protected)/phones/ai/ai.types.ts` — TypeScript mirrors of scraper types.
4. `app/(protected)/phones/ai/ai.api.ts` — 6 endpoints.
5. `app/(protected)/phones/ai/mapToFormValues.ts` — bridge function (+ unit-testable).
6. `app/(protected)/phones/ai/AiGeneratePanel.tsx` — tab UI.
7. `usePhoneForm.ts` — `aiDraft` prop → `form.reset`.
8. `Form.tsx` — accept + forward `aiDraft`/`onDraftConsumed`.
9. `create/Wrapper.tsx` — tabs shell.
10. Env: `SCRAPER_API_URL` in `.env.local` + `next.config.mjs`.
11. Test: build, typecheck, lint; manual run of the full flow.

---

## Suggested improvements (recommended, later)

- **Scraper API key** — add `x-api-key` middleware to the scraper (currently fully open) and send it from `scraperApiConfig`. Prevents unauthorized Gemini usage.
- **Background pipeline** — scraper `POST /mobile-extractions` blocks for the whole Gemini call; return immediately + poll `GET /:id` for status (better UX, no timeout issues).
- **Shared DB / direct import** — a new backend endpoint `POST /api/phones/from-extraction` that accepts `structuredData` and creates the phone directly, so "Approve" in the AI tab = instant catalog entry (no manual submit).
- **Duplicate detection** — check existing phone by `brand+model` before creating.
- **Admin-side editorial override** — allow editing meta/pros/cons in the AI tab before filling the form.

---

## Open questions

1. Should **Approve** also create the phone immediately (requires new backend endpoint, see suggestion #3) or keep the current flow (approve → fill form → manual submit)?
2. Show the **recent extractions list** in the AI tab now, or defer?
