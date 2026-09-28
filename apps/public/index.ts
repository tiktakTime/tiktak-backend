import { createRouter } from "@/core/router";
import { rate_limit } from "@/middlewares";

import { publicInviteRouter } from "./invite/invite.routes";

/** Oturumsuz uçlar. Önek `/`. */
export const publicRouter = createRouter();
publicRouter.use("/invite/by-token", rate_limit.invite);
publicRouter.use("/invite/accept", rate_limit.invite);
publicRouter.route("/", publicInviteRouter);
