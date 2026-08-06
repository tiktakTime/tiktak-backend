import { createRouter } from "@tiktak/core";
import { db } from "@tiktak/database";

import { invalidator } from "../invalidator/invalidator.repo";
import * as coreContracts from "./core/core.contract";
import OrganizationRepository from "./core/core.repo";
import { createOrganizationCoreRoutes } from "./core/core.routes";
import * as invitationsContracts from "./invitations/invitations.contract";
import InvitationRepository from "./invitations/invitations.repo";
import { createOrganizationInvitationsRoutes } from "./invitations/invitations.routes";
import * as membersContracts from "./members/members.contract";
import MembershipRepository from "./members/members.repo";
import { createOrganizationMembersRoutes } from "./members/members.routes";
import * as rolesContracts from "./roles/roles.contract";
import RoleRepository from "./roles/roles.repo";
import { createOrganizationRolesRoutes } from "./roles/roles.routes";

export const organizationRepo = new OrganizationRepository(db);
export const membershipRepo = new MembershipRepository(db);
export const invitationRepo = new InvitationRepository(db);
export const roleRepo = new RoleRepository(db);

const repos = {
  organization: organizationRepo,
  membership: membershipRepo,
  invitation: invitationRepo,
  role: roleRepo,
};

const router = createRouter();

const coreRoutes = createOrganizationCoreRoutes(repos, invalidator);
router.openapi(coreRoutes.createRoute.route, coreRoutes.createRoute.handle);
router.openapi(coreRoutes.getRoute.route, coreRoutes.getRoute.handle);
router.openapi(coreRoutes.getBySlugRoute.route, coreRoutes.getBySlugRoute.handle);
router.openapi(coreRoutes.updateRoute.route, coreRoutes.updateRoute.handle);
router.openapi(coreRoutes.deleteRoute.route, coreRoutes.deleteRoute.handle);
router.openapi(coreRoutes.transferOwnershipRoute.route, coreRoutes.transferOwnershipRoute.handle);

const membersRoutes = createOrganizationMembersRoutes(repos, invalidator);
router.openapi(membersRoutes.listRoute.route, membersRoutes.listRoute.handle);
router.openapi(membersRoutes.updateRoute.route, membersRoutes.updateRoute.handle);
router.openapi(membersRoutes.deleteRoute.route, membersRoutes.deleteRoute.handle);

const invitationsRoutes = createOrganizationInvitationsRoutes(repos);
router.openapi(invitationsRoutes.listRoute.route, invitationsRoutes.listRoute.handle);
router.openapi(invitationsRoutes.createRoute.route, invitationsRoutes.createRoute.handle);
router.openapi(invitationsRoutes.updateRoute.route, invitationsRoutes.updateRoute.handle);
router.openapi(invitationsRoutes.deleteRoute.route, invitationsRoutes.deleteRoute.handle);

const rolesRoutes = createOrganizationRolesRoutes(repos);
router.openapi(rolesRoutes.listRoute.route, rolesRoutes.listRoute.handle);
router.openapi(rolesRoutes.createRoute.route, rolesRoutes.createRoute.handle);
router.openapi(rolesRoutes.getRoute.route, rolesRoutes.getRoute.handle);
router.openapi(rolesRoutes.updateRoute.route, rolesRoutes.updateRoute.handle);
router.openapi(rolesRoutes.deleteRoute.route, rolesRoutes.deleteRoute.handle);

export const organizationRouter = router;

export {
  coreContracts,
  membersContracts,
  invitationsContracts,
  rolesContracts,
  OrganizationRepository,
  MembershipRepository,
  InvitationRepository,
  RoleRepository,
};
