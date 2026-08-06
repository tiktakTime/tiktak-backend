# Architecture Overview

This project is built using **Node.js 24**, **pnpm**, **Turborepo**, **Hono.js**, **Kysely**, **Prisma**, **Redis**, **BullMQ**, and **Socket.IO**.

## Monorepo Package Layout

```
.
├── apps/
│   └── api/                  # Hono API Server Assembly Layer
└── packages/
    ├── auth/                 # JWT verification & Password Hashing
    ├── cache/                # Redis Cache Store & Query Key Invalidation
    ├── constants/            # Global Constants
    ├── core/                 # OpenAPI Route Helpers, Router, Error Handlers, Paginate
    ├── database/             # Prisma Schema & Kysely Query Builder
    ├── domains/              # Feature-First Vertical Slices (Contracts, Repos, Routes)
    ├── env/                  # Environment Variable Validation
    ├── middlewares/          # HTTP Middlewares (Rate Limit, Auth, CORS, Guards)
    ├── queue/                # BullMQ Queues
    ├── socket/               # Socket.IO & Realtime Invalidations
    └── storage/              # S3 Client & Sharp Image Processing
```

## Setup Script

Run `./scripts/setup.sh` to automatically rename package scopes, reset git, install dependencies, and generate database clients.
