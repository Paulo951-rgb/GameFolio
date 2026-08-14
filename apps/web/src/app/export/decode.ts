/**
 * Client-side decode of the profile from the `?data=` query param (the
 * counterpart of encode.ts which runs server-side). Uses atob (browser).
 */
export function decodeProfileParam(param: string):
  | { ok: true; value: unknown }
  | { ok: false; error: string } {
  try {
    let b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    const json = atob(b64);
    return { ok: true, value: JSON.parse(json) };
  } catch {
    return { ok: false, error: "Encodage des données invalide." };
  }
}
