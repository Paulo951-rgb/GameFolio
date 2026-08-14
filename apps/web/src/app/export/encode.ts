/**
 * Server-side base64url encoding of the profile for the stateless export render
 * URL (no server profile store for the MVP: the profile travels in `?data=`).
 * Server-only: uses Node's Buffer. The client-side decode lives in ./decode.
 */
export function encodeProfileParam(profile: unknown): string {
  const json = JSON.stringify(profile);
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
