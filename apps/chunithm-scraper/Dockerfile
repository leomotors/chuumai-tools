FROM oven/bun:1.2-debian

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
RUN bun playwright install --with-deps chromium

COPY src ./src

ENV NODE_ENV=production

CMD ["bun", "start"]
