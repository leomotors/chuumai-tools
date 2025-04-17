FROM node:22-bookworm AS base

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter=chunithm-scraper build


FROM node:22-bookworm AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY tools/ ./tools/
COPY apps/chunithm-scraper/package.json ./
RUN node tools/patch-pkg.js
RUN pnpm install --production
RUN pnpm playwright install --with-deps chromium

COPY --from=base --chown=node:node /app/apps/chunithm-scraper/dist/ ./dist/

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
