import type { Context } from "hono";

import { invalidateKeys } from "@tiktak/cache";
import type { AppBindings } from "@tiktak/core";
import { db } from "@tiktak/database";

import * as orgCoreContracts from "../organization/core/core.contract";
import * as orgMembersContracts from "../organization/members/members.contract";
import * as userContracts from "../user/user.contract";

export class CacheInvalidator {
  private userId?: string;

  constructor(private readonly c: Context<AppBindings>) {
    this.userId = c.get("user")?.id;
  }

  user(userId: string) {
    invalidateKeys([userContracts.get], {
      c: this.c,
      prefixOverride: "user:" + userId,
    }).catch(console.error);
  }

  organizationList(userId: string | undefined) {
    if (!userId) return;
    invalidateKeys([orgCoreContracts.list], {
      c: this.c,
      prefixOverride: "user:" + userId,
    }).catch(console.error);
  }

  organization(orgId: string | null | undefined) {
    if (!orgId) return;
    this.organizationList(this.userId);
    this.organizationBySlugFromOrgId(orgId);
  }

  private async organizationBySlugFromOrgId(orgId: string) {
    try {
      const org = await db
        .selectFrom("Organization")
        .select("slug")
        .where("id", "=", orgId)
        .executeTakeFirst();

      const keys = [
        orgCoreContracts.get,
        ...(org?.slug ? [orgCoreContracts.getBySlug] : []),
      ];

      invalidateKeys(keys, {
        c: this.c,
        mergeParams: { orgId, ...(org?.slug ? { slug: org.slug } : {}) },
      }).catch(console.error);
    } catch {
      invalidateKeys([orgCoreContracts.get], {
        c: this.c,
        mergeParams: { orgId },
      }).catch(console.error);
    }
  }

  organizationListForUsers(userIds: string[]) {
    Promise.all(userIds.map((uid) => this.organizationList(uid))).catch(
      console.error,
    );
  }

  organizationMembers(orgId: string | undefined) {
    if (!orgId) return;
    invalidateKeys([orgMembersContracts.membersList], {
      c: this.c,
      mergeParams: { orgId },
    }).catch(console.error);
  }
}

export const invalidator = (c: Context<AppBindings>) => new CacheInvalidator(c);
