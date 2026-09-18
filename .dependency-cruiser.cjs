/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Döngüsel import — ADP ihlali.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Kimse import etmiyor — ölü kod adayı.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$",
          "\\.d\\.ts$",
          "^(index|app\\.config|prisma\\.config)\\.ts$",
          "^scripts/",
          "^(eslint\\.config\\.js|vitest\\.config\\.ts|knip\\.json)$",
        ],
      },
      to: {},
    },
    {
      name: "core-yukari-bakmaz",
      severity: "error",
      comment: "core ↛ apps / modules / middlewares / platform / server",
      from: { path: "^core/" },
      to: {
        path: "^(apps|modules|middlewares|platform|server)/",
      },
    },
    {
      name: "platform-domain-bilmez",
      severity: "error",
      comment: "platform ↛ apps / modules",
      from: { path: "^platform/" },
      to: { path: "^(apps|modules)/" },
    },
    {
      name: "modules-sadece-core",
      severity: "error",
      comment: "modules ↛ apps / platform / middlewares / server",
      from: { path: "^modules/" },
      to: { path: "^(apps|platform|middlewares|server)/" },
    },
    {
      name: "no-self-barrel",
      severity: "error",
      comment:
        "Modül kendi klasörünün barrel'ını import etmez — döngülerin ana kaynağı.",
      from: { path: "^(core|platform)/([^/]+)/(?!index\\.ts$).+" },
      to: { path: "^(core|platform)/$2/index\\.ts$" },
    },
    {
      name: "yan-etkili-modul-re-export-edilmez",
      severity: "error",
      comment:
        "queue/redis/database import anında bağlantı açar; başka barrel bunları re-export ederse o barrel'a dokunan herkes bağlantı açtırır (test edilebilirlik).",
      from: {
        path: "^core/(?!queue|redis|database)[^/]+/index\\.ts$",
      },
      to: { path: "^core/(queue|redis|database)/" },
    },
    {
      name: "disaridan-core-deep-import-yasak",
      severity: "error",
      comment:
        "Core/platform'a dışarıdan yalnızca barrel'dan erişilir (relative kaçışlar dahil).",
      from: { path: "^(apps|modules|middlewares|server|index\\.ts)" },
      to: {
        path: "^(core|platform)/[^/]+/.+",
        pathNot: "^(core|platform)/[^/]+/index\\.ts$",
      },
    },
    {
      name: "apps-kardes-yasagi",
      severity: "error",
      comment: "apps/X ↛ apps/Y (aynı yüzey içi relative OK)",
      from: { path: "^apps/([^/]+)/" },
      to: {
        path: "^apps/([^/]+)/",
        pathNot: "^apps/$1/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: "^(node_modules|docs|core/database/generated)",
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
