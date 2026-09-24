# Dashboard Deployment Guide

Admin panel (`dash.mobilehaat.com`). Same pipeline shape as the storefront:
push to `main` → CI → GHCR → SSH deploy with health check and auto-rollback.

## Architecture

```
Developer -> git push main -> CI (lint, typecheck, build)
  -> Docker Build (linux/amd64, SHA + latest) -> GHCR
  -> CD (SSH to VPS, pull SHA image, deploy, health check, auto-rollback)
  -> Caddy (backend stack) -> https://dash.mobilehaat.com
```

| Step | What happens |
|------|-------------|
| git push main | Triggers CI + Docker pipeline |
| CI | Lint, typecheck, build (via reusable `ci.yml`) |
| Docker | Build image, push SHA + latest to GHCR |
| CD | SSH into VPS, pull SHA image, deploy, health check, auto-rollback if unhealthy |
| Cleanup | Weekly, keeps last 10 SHA images, deletes old ones |
| Serve | Caddy (from the **backend** stack) reverse-proxies `dash.mobilehaat.com` to this container on the shared `mobilehaat-network` |

> There is no staging environment for the dashboard — every push to `main`
> deploys straight to production. Keep `main` green.

---

## 1. Environment variables

`config/*` is imported by client components (RTK Query runs in the browser),
so `API_URL`, `SCRAPER_API_URL` and `API_KEY` are **build-time** values baked
into the image and the client bundle. Only next-auth values are runtime.

| Variable | Build-time | Runtime | Where to set (prod) |
|----------|-----------|---------|---------------------|
| `API_URL` | Yes (server + client) | — | GitHub Actions Variable |
| `SCRAPER_API_URL` | Yes (server + client) | — | GitHub Actions Variable |
| `API_KEY` | Yes (sent as `x-api-key`, reaches client bundle) | — | GitHub Actions **Secret** |
| `NEXT_PUBLIC_FRONTEND_URL` | Yes (client) | — | GitHub Actions Variable |
| `NEXTAUTH_URL` | No | Yes (next-auth callbacks) | VPS `.env.production` |
| `NEXTAUTH_SECRET` | No (never — secret) | Yes | VPS `.env.production` |

Template: `.env.example` (tracked in git — real values never are).

> `API_KEY` should equal the backend's `INTERNAL_API_KEY`. Because it ships in
> the client bundle by design (RTK Query calls the API from the browser),
> treat it as a public-but-rotatable credential: it authorizes admin API
> calls, so rotate it if it leaks outside the admin team, and know that
> rotating it requires a dashboard rebuild + redeploy (build-time value).

---

## 2. GitHub repository setup

### Secrets (Settings -> Secrets and variables -> Actions -> Secrets)

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP (e.g., 203.0.113.50) |
| `VPS_USER` | SSH username (e.g., root) |
| `VPS_SSH_KEY` | Private SSH key content |
| `API_KEY` | Server-to-server key (must match backend `INTERNAL_API_KEY`) |

`NEXTAUTH_SECRET` lives only in the VPS `.env.production` file — never in GitHub.

### Variables (Settings -> Secrets and variables -> Actions -> Variables)

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend API URL (e.g., `https://api.mobilehaat.com/api`) |
| `SCRAPER_API_URL` | Scraper API URL (e.g., `https://scraper.mobilehaat.com/api`) |
| `NEXT_PUBLIC_FRONTEND_URL` | Storefront URL (e.g., `https://mobilehaat.com`) |

The Docker build fails fast if any of these (or `API_KEY`) is empty, so a
missing variable can never bake `undefined` into a production image.

### Environment (Settings -> Environments -> New environment)

- Name: `production`
- Protection rules: **strongly recommended** — require approval before deploy
  (the dashboard is admin-only; every merge deploys without one otherwise)

---

## 3. VPS initial setup

### 3.1 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 3.2 Create deployment directory and network

```bash
mkdir -p /opt/mobilehaat/dashboard
cd /opt/mobilehaat/dashboard

# Shared with the backend stack — Caddy reaches this container as
# `dashboard:3000` through it. The backend setup creates it too; this is a
# no-op if it already exists.
docker network create mobilehaat-network
```

### 3.3 Log in to GHCR (one time)

The image is private by default, so the VPS must authenticate before it can
pull. Create a Classic PAT with **`read:packages`** scope, then:

```bash
echo <PAT> | docker login ghcr.io -u <github-username> --stdin
```

Credentials persist in `~/.docker/config.json`. Without this step every deploy
fails with `pull access denied`.

### 3.4 Get the compose file and scripts

```bash
cd /opt/mobilehaat/dashboard
# Either clone the repo (also gives you scripts/deploy.sh + rollback.sh):
git clone --no-checkout <dashboard-repo-url> repo-tmp
cd repo-tmp && git sparse-checkout set docker-compose.yml scripts && git checkout main
mv docker-compose.yml scripts /opt/mobilehaat/dashboard/
cd /opt/mobilehaat/dashboard && rm -rf repo-tmp
# ...or copy docker-compose.yml manually. Manual deploys then use
# `export IMAGE_TAG=<sha> && docker compose pull && docker compose up -d`,
# and rollback.sh is unavailable (use IMAGE_TAG with an older SHA instead).
```

### 3.5 Create environment file

Only runtime values live here — everything else is baked at build time (§1).

```bash
cat > .env.production << 'EOF'
NEXTAUTH_URL=https://dash.mobilehaat.com
NEXTAUTH_SECRET=<secure-random-32+-chars>
EOF
chmod 600 .env.production
```

### 3.6 First deploy

```bash
docker compose pull
docker compose up -d
curl -sf http://127.0.0.1:3000/api/health
```

### 3.7 Caddy (backend stack)

Public traffic enters through Caddy, which lives in the **backend** repo
(`backend/caddy/Caddyfile`): `dash.mobilehaat.com -> dashboard:3000` with
automatic Let's Encrypt TLS and a restrictive CSP. That hostname resolves only
because this container joins the external `mobilehaat-network` (§3.2) — if the
site is unreachable but the container is healthy, check the network first.

---

## 4. How deployment works

### Automatic (every push to main)

1. CI runs: lint, typecheck, build
2. Docker image builds (`linux/amd64`) with full commit SHA tag + `latest`
3. Both tags push to GHCR
4. CD SSHs into the VPS, pulls the SHA image, deploys
5. Health check polls `/api/health` inside the container (6 retries x 5s)
6. If healthy -> deployment succeeds
7. If unhealthy -> auto-rollback to previous SHA, verify health

### Manual deploy

```bash
# On VPS (needs scripts/ from §3.4)
cd /opt/mobilehaat/dashboard
./deploy.sh <sha>

# Without scripts:
export IMAGE_TAG=<sha>
docker compose pull
docker compose up -d --force-recreate
```

---

## 5. Rollback

### Automatic rollback

The CD pipeline auto-rollbacks if the health check fails after deploy.

### Manual rollback

```bash
# On VPS, rollback to previous version (needs scripts/ from §3.4)
cd /opt/mobilehaat/dashboard
./rollback.sh

# Rollback to specific SHA
./rollback.sh <sha>

# Without scripts: any older SHA tag works the same way
export IMAGE_TAG=<sha>
docker compose pull
docker compose up -d --force-recreate
```

---

## 6. Docker cleanup

- Runs automatically every Sunday at 3 AM UTC
- Keeps the last 10 stable SHA-tagged image versions
- `latest` tag is never deleted
- Manual trigger available from GitHub Actions

---

## 7. Verify a deploy

```bash
# Container health (inside Docker)
docker exec mobilehaat-dashboard wget --no-verbose --tries=1 --spider http://localhost:3000/api/health

# Public site + TLS (through Caddy)
curl -sf https://dash.mobilehaat.com/api/health

# Sign-in flow (Credentials -> backend /auth)
# Open https://dash.mobilehaat.com/auth/signin and log in with an admin account
```

---

## 8. Useful commands

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Check which image is running
docker inspect --format='{{.Config.Image}}' mobilehaat-dashboard

# List available images
docker images ghcr.io/imranwebdeveloper/mobilehaat-dashboard

# Restart
docker compose restart

# Stop
docker compose down
```

---

## 9. Troubleshooting

| Issue | Fix |
|-------|-----|
| CD fails with SSH error | Check `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` secrets |
| Build fails on missing vars | Set `API_URL`, `SCRAPER_API_URL`, `NEXT_PUBLIC_FRONTEND_URL` Variables and `API_KEY` Secret |
| `pull access denied` from GHCR | Re-run the §3.3 `docker login`; PAT needs `read:packages` |
| Health check fails | `docker compose logs`; check `.env.production` (`NEXTAUTH_SECRET` set?) |
| Site unreachable but container healthy | `docker network inspect mobilehaat-network` — container must be attached, and backend Caddy must be up |
| API calls fail / 401s from dashboard | `API_KEY` baked at build must match backend `INTERNAL_API_KEY`; rotating it needs a rebuild + redeploy |
| "View on site" links wrong | `NEXT_PUBLIC_FRONTEND_URL` Variable was wrong at build; fix and push again |
| Image not found | Verify GHCR package visibility (public/private) |
| Port conflict | `lsof -i :3000`, kill conflicting process |
| Rollback fails | `docker images`, check if old image exists locally |

---

## 10. Image tags

| Tag | When | Example |
|-----|------|---------|
| `latest` | Every push to main | `ghcr.io/imranwebdeveloper/mobilehaat-dashboard:latest` |
| SHA | Every push to main | `ghcr.io/imranwebdeveloper/mobilehaat-dashboard:abc1234` |

Production always uses the SHA tag. `latest` is for convenience only.

---

## 11. Repo files involved

```
dashboard/
├── .github/workflows/
│   ├── ci.yml             # Lint, typecheck, build (also reused by docker.yml)
│   ├── docker.yml         # Build & push to GHCR, deploy to VPS via SSH
│   └── docker-cleanup.yml # Weekly prune (keeps last 10 SHA images)
├── Dockerfile             # Multi-stage build -> standalone server.js (non-root nextjs user)
├── docker-compose.yml     # Production (GHCR image, read-only FS, shared network)
├── docker-compose.local.yml # Local prod-like test (builds from source)
├── scripts/
│   ├── deploy.sh          # VPS manual deploy with health check + rollback
│   ├── rollback.sh        # VPS manual rollback
│   └── healthcheck.sh     # Shared health-check helper
├── .env.example           # Variable template (tracked; real values never are)
└── app/api/health/route.ts # Health endpoint used by CD + Docker HEALTHCHECK
```
