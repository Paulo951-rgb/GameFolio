// Pure domain logic — no React, no Next.js, no DOM. Portable as-is to a future
// Electron app (which would only swap the infrastructure layer: API routes →
// IPC, PostgreSQL cloud → SQLite local). See architecture doc section 1.

export * from "./modules/index.js";
export * from "./visibility/index.js";
export * from "./templates/index.js";
export * from "./generation/index.js";
