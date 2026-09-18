export { AppError, ERROR_CODES, BASE_ERROR_TITLES } from "./errors";
export type { ErrorCode } from "./errors";

/** HTTP adaptörleri `core/http` altında; geriye uyumluluk için re-export. */
export {
  errorHandler,
  notFoundHandler,
  validationHook,
} from "@/core/http/error-handler";
