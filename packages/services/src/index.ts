// Service layer (packages/services). Thin adapters behind the domain
// interfaces defined in packages/types. Filled in across phases 2-3:
//   ai/      — AIProvider adapters (Phase 2)
//   export/  — headless PDF/image render (Phase 3)
//   storage/ — local (IndexedDB) + cloud adapters (Phase 1 & v2)
//   share/   — public link management (Phase 5)
export * from "./ai/index.js";
