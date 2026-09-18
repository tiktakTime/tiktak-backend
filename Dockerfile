FROM node:24-bookworm-slim

WORKDIR /home/node/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

COPY package.json pnpm-lock.yaml tsconfig.json prisma.config.ts ./
COPY index.ts app.config.ts ./
COPY apps ./apps
COPY core ./core
COPY middlewares ./middlewares
COPY modules ./modules
COPY platform ./platform
COPY server ./server
# Yalnız prod env; .env.local dev içindir ve image'a girmez.
COPY .env ./

RUN pnpm install --frozen-lockfile
# core/database/generated is gitignored — must be built inside the image.
# `db:generate` dev script'i `.env.local` ister; image'da yok → env'siz varyant.
RUN pnpm db:generate:ci

ENV PORT=7036
EXPOSE 7036

CMD ["pnpm", "start"]
