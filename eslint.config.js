import { readdirSync } from "node:fs";

import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

/**
 * Katman ve barrel kuralları — docs/architecture.md + docs/quality-tools.md.
 *
 * Neden `eslint-plugin-boundaries` değil: v7'de `type: { anyOf: [...] }`
 * selector'ı plugin içinde patlıyor (`template.replaceAll is not a function`)
 * ve policy eşleştirmesi sessizce başarısız oluyordu. Yerine
 * `no-restricted-imports` — sade, patlamaz, IDE'de anlık.
 *
 * Grafik seviyesindeki denetim (relative kaçışlar, döngü, self-barrel,
 * yan etkili re-export) dependency-cruiser'da: `pnpm arch`.
 *
 * ÖNEMLİ: ESLint flat config'de aynı kural sonraki blokta **tamamen** ezilir,
 * seçenekler birleşmez. Bu yüzden her dosya grubu için tek blok ve tam desen
 * listesi üretiliyor; genel `core/**` bloğu yok.
 */

const SURFACES = [
  "public",
  "common",
  "web",
  "mobile",
  "admin",
  "auth",
  "system",
];

const DENY = {
  apps: "@/apps/**",
  modules: "@/modules/**",
  platform: "@/platform/**",
  middlewares: "@/middlewares/**",
  server: "@/server/**",
};

/** Core dışından core'a yalnızca barrel (`@/core/http`), dosya değil. */
const CORE_DEEP = ["@/core/*/*"];
const PLATFORM_DEEP = ["@/platform/*/*"];

const BARREL_ONLY_MSG =
  "Core/platform'a dışarıdan yalnızca barrel'dan erişilir (@/core/http), dosyadan değil — barrel o paketin public API'si.";

const SELF_BARREL_MSG =
  "Kendi klasörünün barrel'ını import etme: döngü kaynağı. Kardeş dosyayı relative import et (./session).";

function unitsOf(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/**
 * Bir modülün kendi barrel'ına giden yollar.
 * `"."` / `".."` bilinçli olarak yok: gitignore semantiğinde her `./sibling`
 * importunu eşleştirip yanlış pozitif üretiyorlar. O iki biçimi
 * dependency-cruiser'ın `no-self-barrel` kuralı grafikte yakalıyor.
 */
function selfBarrelPatterns(alias) {
  return [alias, "./index", "../index"];
}

function restricted(patterns) {
  return {
    "@typescript-eslint/no-restricted-imports": ["error", { patterns }],
  };
}

/** core/<unit> ve platform/<unit> için tek blok: katman + self-barrel. */
function unitBlocks(root, layerDeny, layerMsg, extraDeep) {
  return unitsOf(root).map((unit) => ({
    files: [`${root}/${unit}/**/*.ts`],
    ignores: ["**/*.test.ts"],
    rules: restricted([
      { group: layerDeny, message: layerMsg },
      ...(extraDeep.length
        ? [{ group: extraDeep, message: BARREL_ONLY_MSG }]
        : []),
      {
        group: selfBarrelPatterns(`@/${root}/${unit}`),
        message: SELF_BARREL_MSG,
      },
    ]),
  }));
}

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "**/generated/**",
      "docs/**",
      "scripts/**",
      "prisma.config.ts",
      "eslint.config.js",
      ".dependency-cruiser.cjs",
      "vitest.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { sonarjs },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Sıfırlandıktan sonra kilitlendi: yeni ihlal CI'yı kırar.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },

  // core/<unit>: motor — üst katman yok, kendi barrel'ı yok.
  // Core içinde başka core dosyasına deep import serbest (döngü yönetimi).
  ...unitBlocks(
    "core",
    [DENY.apps, DENY.modules, DENY.platform, DENY.middlewares, DENY.server],
    "core yukarı bakmaz: port tanımla, wiring'i server yapsın (docs/architecture.md).",
    [],
  ),

  // platform/<unit>: core'u TikTak'a bağlar; domain bilmez, core'a barrel'dan bakar
  ...unitBlocks(
    "platform",
    [DENY.apps, DENY.modules, DENY.middlewares, DENY.server],
    "platform yalnızca core'a bakar; domain/use-case import etmez.",
    CORE_DEEP,
  ),

  // modules: prisma + repo, saf veri
  {
    files: ["modules/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: restricted([
      {
        group: [DENY.apps, DENY.platform, DENY.middlewares, DENY.server],
        message: "modules saf veri erişimidir; yalnızca core'a bakar.",
      },
      { group: CORE_DEEP, message: BARREL_ONLY_MSG },
    ]),
  },

  // middlewares: driving adapter
  {
    files: ["middlewares/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: restricted([
      {
        group: [DENY.apps, DENY.modules, DENY.server],
        message: "middlewares yalnızca core + platform'a bakar.",
      },
      { group: [...CORE_DEEP, ...PLATFORM_DEEP], message: BARREL_ONLY_MSG },
    ]),
  },

  // apps/<surface>: kardeş yüzey yasağı + server yasağı + barrel zorunlu
  ...SURFACES.map((surface) => ({
    files: [`apps/${surface}/**/*.ts`],
    ignores: ["**/*.test.ts"],
    rules: restricted([
      {
        group: SURFACES.filter((s) => s !== surface).map(
          (s) => `@/apps/${s}/**`,
        ),
        message:
          "Kardeş yüzey import yasak: paylaşılan ihtiyaç core/platform'a, use-case kendi domain'ine.",
      },
      {
        group: [DENY.server],
        message: "apps → server yasak; composition root yalnızca mount eder.",
      },
      { group: [...CORE_DEEP, ...PLATFORM_DEEP], message: BARREL_ONLY_MSG },
    ]),
  })),

  // composition root: her şeyi mount eder, ama core/platform'a barrel'dan bakar
  {
    files: ["index.ts", "app.config.ts", "server/**/*.ts"],
    rules: restricted([
      { group: [...CORE_DEEP, ...PLATFORM_DEEP], message: BARREL_ONLY_MSG },
    ]),
  },

  /**
   * Testler: barrel yasak, doğrudan dosya. Birim testi yalnızca kendi birimine
   * bağımlı olmalı; barrel yan etkili modülleri (queue/redis/database) de çeker.
   */
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      ...restricted([
        {
          group: ["@/core/*", "@/platform/*"],
          message:
            "Test barrel'dan import etmez: doğrudan dosyayı import et (./hash). Barrel yan etkili modülleri de yükler.",
        },
      ]),
    },
  },
);
