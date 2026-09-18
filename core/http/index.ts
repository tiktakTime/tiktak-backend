export {
  configureRoutePlatform,
  tenantId,
  actorId,
  type ScopeRegistration,
  type RoutePlatformConfig,
} from "./platform";
export {
  Result,
  Page,
  Failure,
  type ResponseSpec,
  type ZodLike,
} from "./response-spec";
export {
  defineRoute,
  type RouteDef,
  type RouteCtx,
  type RouteCacheConfig,
  type RouteCacheRead,
  type RouteCacheWrite,
} from "./define";
export { createSlice } from "./slice";
export {
  ok,
  isNamedSuccess,
  toPage,
  resultSchema,
  pageSchema,
  ApiFieldErrorSchema,
  PageMetaSchema,
  refNameOf,
  ErrorEnvelopeSchema,
  type ApiFieldError,
  type ApiEnvelope,
  type ApiSemanticStatus,
  type PageResponse,
  type PageMeta,
  type NamedSuccess,
  type ApiMessage,
} from "./result";
export {
  type CatalogText,
  type CatalogRegistry,
  type ErrorKey,
  type SuccessKey,
  type CatalogKey,
} from "./catalog";
export {
  configureI18n,
  negotiateLocale,
  interpolate,
  resolveError,
  resolveSuccess,
  resolveValidation,
  registerMutationSuccessKey,
  lookupErrorMeta,
  hasSuccessKey,
  type LocaleCode,
  type LocaleBundle,
  type I18nConfig,
  type ErrorMeta,
} from "./i18n";
export { extractBearerToken } from "./bearer";
export {
  renderSuccess,
  renderError,
  renderValidation,
  validationKeyOf,
  applyResponseHeaders,
  localeOf,
} from "./render";
export { errorHandler, notFoundHandler, validationHook } from "./error-handler";
export {
  paginate,
  toPaginateSort,
  PaginationSchema,
  SearchSchema,
  SortOrderSchema,
  SortSchema,
  CompactQuerySchema,
  PaginationQuerySchema,
  type PaginateParams,
  type PaginationParams,
} from "./paginate";
