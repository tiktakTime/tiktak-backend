export * as KyselyTypes from "./kysely/index.js";
export * from "./generated/zod/index.js";
export * from "./kysely/enums.js";
export { db } from "./db.js";
export type { DB } from "./kysely/index.js";

// Zod generator still emits Org* names for some models; alias to Prisma model names.
export {
  OrgCompanySchema as CompanySchema,
  OrgPermissionSchema as PermissionSchema,
  OrgPersonSchema as PersonSchema,
  OrgRolePermissionSchema as RolePermissionSchema,
  OrgRoleSchema as RoleSchema,
} from "./generated/zod/index.js";
