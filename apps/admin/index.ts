import { createRouter } from "@/core/router";
import { authMiddleware } from "@/middlewares";

import { adminSuperadminDashboardRouter } from "./superadmin-dashboard/superadmin-dashboard.routes";
import { adminSuperadminInviteRouter } from "./superadmin-invite/superadmin-invite.routes";
import { adminSuperadminOrganizationRouter } from "./superadmin-organization/superadmin-organization.routes";
import { adminSuperadminUserRouter } from "./superadmin-user/superadmin-user.routes";
import { adminSuperadminVehicleRouter } from "./superadmin-vehicle/superadmin-vehicle.routes";

export const adminRouter = createRouter();

adminRouter.use("*", authMiddleware);
adminRouter.route("/", adminSuperadminDashboardRouter);
adminRouter.route("/", adminSuperadminInviteRouter);
adminRouter.route("/", adminSuperadminOrganizationRouter);
adminRouter.route("/", adminSuperadminUserRouter);
adminRouter.route("/", adminSuperadminVehicleRouter);
