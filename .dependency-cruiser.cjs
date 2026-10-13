/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // 1. Circular dependencies
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are not allowed",
      from: {},
      to: {
        circular: true,
      },
    },

    // 2. Modular monolith: no deep imports into module internals from outside that module
    {
      name: "no-deep-module-imports",
      severity: "error",
      comment: "Outside code may import a module ONLY through its index.ts (except platform/db/schema.ts importing module schemas)",
      from: {
        pathNot: "^(src/modules/[^/]+/.+|src/platform/db/schema\\.ts)$",
      },
      to: {
        path: "^src/modules/[^/]+/.+",
        pathNot: "^src/modules/[^/]+/index\\.ts$",
      },
    },
    {
      name: "no-cross-module-deep-imports",
      severity: "error",
      comment: "Cross-module imports must go through the other module's index.ts only",
      from: {
        path: "^src/modules/([^/]+)/.+",
      },
      to: {
        path: "^src/modules/(?!$1/).+",
        pathNot: "^src/modules/[^/]+/index\\.ts$",
      },
    },

    // 3. Ports & adapters: Vendor SDKs are forbidden outside platform/adapters
    {
      name: "vendor-sdks-only-in-adapters",
      severity: "error",
      comment: "Vendor SDKs may only be imported inside src/platform/adapters",
      from: {
        pathNot: "^src/platform/adapters/",
      },
      to: {
        path: "(razorpay|resend|^posthog-|^@upstash/|^@octokit/|octokit)",
      },
    },

    // 4. Thin app layer: app/** cannot import platform/db directly
    {
      name: "app-no-direct-db",
      severity: "error",
      comment: "Routing layer (src/app/**) cannot directly import platform/db",
      from: {
        path: "^src/app/",
      },
      to: {
        path: "^src/platform/db/",
      },
    },

    // 5. Engine isolation: planning/engine cannot import platform, db, next, or app
    {
      name: "engine-isolation",
      severity: "error",
      comment: "The transition engine must be pure and not import platform, db, or app",
      from: {
        path: "^src/modules/planning/engine/",
      },
      to: {
        path: "(^src/platform/|^src/app/|^next)",
      },
    },

    // 6. Platform cannot depend on domain modules (except db/schema aggregating module schemas)
    {
      name: "platform-cannot-depend-on-modules",
      severity: "error",
      comment: "src/platform cannot depend on src/modules (except db/schema.ts aggregating module schema.ts)",
      from: {
        path: "^src/platform/(?!db/schema\\.ts).+",
      },
      to: {
        path: "^src/modules/",
      },
    },

    // 7. Catalog module cannot depend on other domain modules
    {
      name: "catalog-allowed-dependencies",
      severity: "error",
      comment: "src/modules/catalog may depend only on platform",
      from: {
        path: "^src/modules/catalog/",
      },
      to: {
        path: "^src/modules/(?!catalog/).+",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
