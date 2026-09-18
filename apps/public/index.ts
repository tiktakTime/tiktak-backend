import { createRouter } from "@/core/router";

import { invitePublicRouter } from "./invite/invite-public.routes";

/**
 * Public yüzey — authMiddleware yok.
 * Token / credential ile gelen authsuz uçlar (invite accept, …).
 *
 * Not: `apps/auth` melez (authlı + authsuz) olduğu için üst seviyede kalır;
 * `server/` onu surfaces döngüsü dışında mount eder.
 */
export const publicRouter = createRouter();
publicRouter.route("/", invitePublicRouter);
