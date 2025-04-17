FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter=chuni-web build


FROM node:22-alpine AS runner

WORKDIR /app

USER node
COPY --from=base --chown=node:node /app/apps/chuni-web/build/ ./build/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "build/index.js"]
