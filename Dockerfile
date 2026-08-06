FROM node:24-bookworm-slim

WORKDIR /home/node/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY modules ./modules
COPY scripts ./scripts
COPY .env .env.local ./

RUN pnpm install --frozen-lockfile
# generated/ is gitignored — must build inside the image
RUN pnpm db:generate

ENV PORT=7036
EXPOSE 7036

CMD ["pnpm", "--filter", "api", "start"]
