import { createRouter } from "@/core/router";
import { authMiddleware } from "@/middlewares";

import { commonAccessRouter } from "./access/access.routes";
import { commonAddressRouter } from "./address/address.routes";
import { commonBankAccountRouter } from "./bank-account/bank-account.routes";
import { commonCountryRouter } from "./country/country.routes";
import { commonFileRouter } from "./file/file.routes";
import { commonInviteRouter } from "./invite/invite.routes";
import { commonSocialMediaRouter } from "./social-media/social-media.routes";

/** Ortak kaynaklar. Önek `/common`. */
export const commonRouter = createRouter();
commonRouter.use("*", authMiddleware);
commonRouter.route("/", commonAccessRouter);
commonRouter.route("/", commonAddressRouter);
commonRouter.route("/", commonBankAccountRouter);
commonRouter.route("/", commonCountryRouter);
commonRouter.route("/", commonFileRouter);
commonRouter.route("/", commonInviteRouter);
commonRouter.route("/", commonSocialMediaRouter);
