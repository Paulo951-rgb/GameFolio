// Shared types & Zod schemas — the single source of truth consumed by both
// the client (form validation) and the server (route handler validation), so
// we never trust client data blindly without re-validating identically.

export * from "./profile";
export * from "./profile-full";
export * from "./module";
export * from "./game";
export * from "./theme";
export * from "./ai";
export * from "./stats";
export * from "./badges";
