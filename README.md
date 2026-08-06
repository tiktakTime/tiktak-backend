# 🚀 Tiktak Backend — Backend Engine & Monorepo Starter

A high-performance, contract-first, domain-driven monorepo template built with **Node.js 24**, **pnpm**, **Hono.js**, **Turborepo**, **Prisma + Kysely**, **Redis**, **BullMQ**, **Socket.IO**, and **Zod-OpenAPI**.

---

## ⚡ Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime** | [Node.js](https://nodejs.org) 24 LTS |
| **Package Manager** | [pnpm](https://pnpm.io) |
| **Monorepo Engine** | [Turborepo 2.x](https://turbo.build) |
| **API Framework** | [Hono.js](https://hono.dev) + `@hono/zod-openapi` + [Scalar UI](https://scalar.com) |
| **Database & ORM** | PostgreSQL + [Prisma](https://www.prisma.io) (migrations) + [Kysely](https://kysely.dev) (type-safe SQL) |
| **Cache & Rate Limit** | Redis + ioredis + Redis-backed Rate Limiter |
| **Realtime & WebSockets** | Socket.IO + Node HTTP server + Event-driven Cache Invalidations |
| **Background Queues** | BullMQ + Redis |
| **Storage & Image Processing** | S3 / MinIO + Sharp |
| **Environment Validation** | Zod (`@tiktak/env`) |

---

## 🏗️ Monorepo Package Topology

```
.
├── apps/
│   └── api/                  # Hono API Server Assembly Layer
└── packages/
    ├── domains/              # Feature-First Vertical Slices (Core, Members, Roles, User)
    ├── auth/                 # Firebase JWT verification & Password Hashing
    ├── cache/                # Redis Cache Store & Query Key Invalidation Engine
    ├── storage/              # S3 Client & Sharp Image Processing
    ├── queue/                # BullMQ Job Queues
    ├── socket/               # Socket.IO & Realtime Invalidations
    ├── middlewares/          # HTTP Middlewares (Rate Limit, Auth, CORS, Guards)
    ├── database/             # Modular Prisma Schema & Kysely Query Builder
    ├── core/                 # OpenAPI Helpers, Router, Error Handlers, Paginate
    ├── constants/            # Global App Constants
    └── env/                  # Zod Environment Variable Validator
```

---

## 📦 Domain-Driven (Vertical Slice) Architecture

All business logic, database queries, contracts, and HTTP endpoints are co-located under `packages/domains/src/<domain>/<slice>/`:

- **`<slice>.types.ts`**: Zod validation schemas & DTO types.
- **`<slice>.contract.ts`**: OpenAPI route declarations created with `createStandardRoute`.
- **`<slice>.repo.ts`**: Kysely query repository class (e.g., `OrganizationRepository`).
- **`<slice>.routes.ts`**: Hono route handlers created with `createEndpoint`.

---

## 🚀 Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org) 24 LTS
- [pnpm](https://pnpm.io) (Corepack: `corepack enable`)
- Docker & Docker Compose

### 2. Environment & Infrastructure Setup

```bash
# Clone repository
cp .env.example .env

# Start PostgreSQL & Redis
docker compose up -d

# Install dependencies & generate database clients
pnpm install
pnpm --dir packages/database run db:generate

# Apply database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The API will run at `http://localhost:3000`. OpenAPI Scalar UI will be accessible at `http://localhost:3000/ui`.

---

## 🪄 Rename Template for New Projects

To initialize a new project from this template:

```bash
./scripts/setup.sh --name my-app --scope my-org --title "My App API"
```

This automatically updates package references, resets Git history, installs dependencies, and generates database clients.

---

## 🤖 AI Subagent Team (.agents)

This workspace comes pre-configured with specialized AI subagents in `.agents/`:
- **`Planner`**: Task analysis and decomposition.
- **`Backend API`**: Feature domain slices, Kysely queries, and Hono OpenAPI routes.
- **`Backend Cache`**: TTL policies, invalidations, and realtime Socket.IO broadcasts.

See [AGENTS.md](file://.agents/AGENTS.md) and [doc/architecture.md](file://doc/architecture.md) for details.
