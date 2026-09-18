import { createRouter } from "@/core/router";
import { authMiddleware } from "@/middlewares";

import { accessRouter } from "./access/access.routes";
import { employeeRouter } from "./employee/employee.routes";
import { inviteRouter } from "./invite/invite.routes";
import { permissionRouter } from "./permission/permission.routes";
import { personRouter } from "./person/person.routes";
import { roleRouter } from "./role/role.routes";

/**
 * Web yüzeyi — requirePermission (yönetim) uçları.
 * Auth zorunlu; org/permission handler içinde assert edilir.
 */
export const webRouter = createRouter();
webRouter.use("*", authMiddleware);
webRouter
  .route("/", personRouter)
  .route("/", employeeRouter)
  .route("/", accessRouter)
  .route("/", roleRouter)
  .route("/", permissionRouter)
  .route("/", inviteRouter);
