# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time values (inlined into server + client bundles via next.config `env`
# and NEXT_PUBLIC_*). Runtime-only secrets (NEXTAUTH_URL, NEXTAUTH_SECRET) are
# NOT baked in — provide them via env_file / environment.
ARG API_URL
ARG SCRAPER_API_URL
ARG API_KEY
ARG NEXT_PUBLIC_FRONTEND_URL

ENV API_URL=$API_URL
ENV SCRAPER_API_URL=$SCRAPER_API_URL
ENV API_KEY=$API_KEY
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./

RUN chown -R nextjs:nodejs /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime-only values (next-auth, etc.) come from env_file / environment —
# never baked into the image.

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
