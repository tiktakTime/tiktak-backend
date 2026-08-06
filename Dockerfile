FROM node:24-bookworm-slim

WORKDIR /home/node/app

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY modules ./modules
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

ENV PORT=7036
EXPOSE 7036

CMD ["pnpm", "--filter", "api", "start"]
