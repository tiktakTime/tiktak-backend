import { createRouter } from "@/core/router";
import { authMiddleware, rate_limit } from "@/middlewares";

import { authPrivateRouter, authPublicRouter } from "./auth.routes";

/**
 * Oturum uçları tüm cihazlarda aynıdır. Açık uçlar bearer istemez.
 */
export const authRouter = createRouter();
authRouter.use("/auth/sign-in", rate_limit.auth);
authRouter.route("/", authPublicRouter);
authRouter.use("*", authMiddleware);
authRouter.route("/", authPrivateRouter);
