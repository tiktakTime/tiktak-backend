import { createRouter } from "@/core/router";
import { authMiddleware } from "@/middlewares";

import { organizationRouter } from "./organization/organization.routes";
import { userRouter } from "./user/user.routes";

/**
 * Ortak yüzey — web/mobile/admin aynı contract + aynı yanıt.
 * Mutations + search auth zorunlu; permission handler içinde.
 */
export const commonRouter = createRouter();
commonRouter.use("*", authMiddleware);
commonRouter.route("/", userRouter).route("/", organizationRouter);
