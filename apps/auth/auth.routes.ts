import { createSlice } from "@/core/http";

import { changePasswordRoute } from "./routes/change-password";
import { emailChangeRequestRoute } from "./routes/email-change-request";
import { emailChangeVerifyRoute } from "./routes/email-change-verify";
import { forgotPasswordRoute } from "./routes/forgot-password";
import { forgotPasswordRecoveryRoute } from "./routes/forgot-password-recovery";
import { logoutRoute } from "./routes/logout";
import { memberRoute } from "./routes/member";
import { recoveryEmailDeleteRoute } from "./routes/recovery-email";
import { recoveryEmailRequestRoute } from "./routes/recovery-email-request";
import { recoveryEmailVerifyRoute } from "./routes/recovery-email-verify";
import { resetPasswordRoute } from "./routes/reset-password";
import { signInRoute } from "./routes/sign-in";
import { signUpRoute } from "./routes/sign-up";
import { switchRoute } from "./routes/switch";
import { verifyEmailRoute } from "./routes/verify-email";
import { verifyEmailRequestRoute } from "./routes/verify-email-request";

export const authPublicRouter = createSlice([
  emailChangeVerifyRoute,
  forgotPasswordRoute,
  forgotPasswordRecoveryRoute,
  recoveryEmailVerifyRoute,
  resetPasswordRoute,
  signInRoute,
  signUpRoute,
  verifyEmailRoute,
]);

export const authPrivateRouter = createSlice([
  changePasswordRoute,
  emailChangeRequestRoute,
  logoutRoute,
  memberRoute,
  recoveryEmailDeleteRoute,
  recoveryEmailRequestRoute,
  switchRoute,
  verifyEmailRequestRoute,
]);
