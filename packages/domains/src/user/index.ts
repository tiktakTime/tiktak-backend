import { createRouter } from "@tiktak/core";
import { db } from "@tiktak/database";

import { invalidator } from "../invalidator/invalidator.repo";
import OrganizationRepository from "../organization/core/core.repo";
import * as userContracts from "./user.contract";
import UserRepository from "./user.repo";
import { createUserRoutes } from "./user.routes";

export const userRepo = new UserRepository(db);
export const organizationRepo = new OrganizationRepository(db);

const repos = {
  user: userRepo,
  organization: organizationRepo,
};

const router = createRouter();

const userRoutes = createUserRoutes(repos, invalidator);

router.openapi(userRoutes.getRoute.route, userRoutes.getRoute.handle);
router.openapi(userRoutes.updateRoute.route, userRoutes.updateRoute.handle);
router.openapi(userRoutes.invitationsRoute.route, userRoutes.invitationsRoute.handle);
router.openapi(userRoutes.acceptInvitationRoute.route, userRoutes.acceptInvitationRoute.handle);

export const userRouter = router;

export { userContracts, UserRepository };
