FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

ENV DATABASE_URL=postgresql://mock:value@somewhere:5432/dbname
ENV PUBLIC_VERSION=MOCK_SHOULD_NOT_APPEAR_ON_PROD
ENV MUSIC_IMAGE_URL=http://mock:3000/value

RUN pnpm --filter=chuni-web build


FROM node:24-alpine AS runner

WORKDIR /app

USER node
COPY --from=base --chown=node:node /app/apps/chuni-web/build/ ./build/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "build/index.js"]
