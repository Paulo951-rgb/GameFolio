"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import type { FieldVisibility } from "@gamer-cv/types";
import { Field, Fieldset, TextInput, NumberInput, Textarea } from "@/components/ui";

const FIELDS = {
  gamerTag: { label: "Pseudo / GamerTag", type: "text", placeholder: "ShadowHunter" },
  firstName: { label: "Prénom", type: "text" },
  age: { label: "Âge", type: "number" },
  country: { label: "Pays", type: "text", placeholder: "France" },
  languages: { label: "Langues (séparées par virgules)", type: "text", placeholder: "Français, Anglais" },
  platforms: { label: "Plateformes (séparées par virgules)", type: "text", placeholder: "PC, PS5, Switch" },
  avatarUrl: { label: "URL avatar", type: "text", placeholder: "https://…" },
} as const;

export function PersonalInfoStep() {
  const profile = useEditorStore((s) => s.profile);
  const setPersonalInfo = useEditorStore((s) => s.setPersonalInfo);
  const setFieldVisibility = useEditorStore((s) => s.setFieldVisibility);
  const info = profile.personalInfo;
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function setField(key: keyof typeof FIELDS | "bio", value: string | number | undefined) {
    setPersonalInfo({ [key]: value } as never);
  }

  function setSocials(raw: string) {
    const entries = raw
      .split("\n")
      .map((l) => l.split(":"))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()]);
    setPersonalInfo({ socials: Object.fromEntries(entries) });
  }

  const socialsText = Object.entries(info.socials ?? {})
    .map(([k, v]) => `${k}:${v}`)
    .join("\n");

  return (
    <Fieldset>
      <h2 className="text-lg font-semibold text-content-primary">Identité du joueur</h2>
      <p className="-mt-2 text-sm text-content-muted">
        Qui tu es en jeu. Le pseudo est le seul champ obligatoire.
      </p>

      <Field label={FIELDS.gamerTag.label} required htmlFor="gamerTag">
        <TextInput
          id="gamerTag"
          type="text"
          value={info.gamerTag}
          onChange={(e) => setField("gamerTag", e.target.value)}
          placeholder={FIELDS.gamerTag.placeholder}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={FIELDS.firstName.label} htmlFor="firstName">
          <TextInput
            id="firstName"
            type="text"
            value={info.firstName ?? ""}
            onChange={(e) => setField("firstName", e.target.value)}
          />
        </Field>
        <Field label={FIELDS.age.label} htmlFor="age">
          <NumberInput
            id="age"
            value={info.age ?? ""}
            onChange={(e) =>
              setField("age", e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={FIELDS.country.label} htmlFor="country">
          <TextInput
            id="country"
            type="text"
            value={info.country ?? ""}
            onChange={(e) => setField("country", e.target.value)}
            placeholder={FIELDS.country.placeholder}
          />
        </Field>
        <Field label={FIELDS.languages.label} htmlFor="languages">
          <TextInput
            id="languages"
            type="text"
            value={(info.languages ?? []).join(", ")}
            onChange={(e) =>
              setField(
                "languages",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as never,
              )
            }
            placeholder={FIELDS.languages.placeholder}
          />
        </Field>
      </div>

      <Field label={FIELDS.platforms.label} htmlFor="platforms">
        <TextInput
          id="platforms"
          type="text"
          value={(info.platforms ?? []).join(", ")}
          onChange={(e) =>
            setField(
              "platforms",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as never,
            )
          }
          placeholder={FIELDS.platforms.placeholder}
        />
      </Field>

      <Field label={FIELDS.avatarUrl.label} htmlFor="avatarUrl" error={avatarError ?? undefined}>
        <AvatarField
          url={info.avatarUrl ?? ""}
          gamerTag={info.gamerTag}
          onChange={(v) => setField("avatarUrl", v)}
          onLoad={() => setAvatarError(null)}
          onError={() => setAvatarError("Impossible de charger cette image (URL invalide ou non publique).")}
        />
      </Field>

      <Field
        label="Bio / Présentation"
        htmlFor="bio"
        hint="Une phrase qui te décrit — affichée sur ton profil et fournie à l'IA."
      >
        <Textarea
          id="bio"
          value={info.bio ?? ""}
          onChange={(e) => setField("bio", e.target.value)}
          rows={3}
          placeholder="Joueur FPS compétitif depuis 2018, fan de Valorant et de construction Minecraft."
        />
      </Field>

      <Field label="Réseaux sociaux (une ligne au format nom:valeur)" htmlFor="socials">
        <Textarea
          id="socials"
          value={socialsText}
          onChange={(e) => setSocials(e.target.value)}
          rows={3}
          placeholder={"discord:Shad0w\ntwitch:shadowhunter"}
        />
      </Field>

      <VisibilityControls
        fields={["age", "country", "firstName"]}
        visibility={info.visibility}
        onChange={(key, v) => setFieldVisibility("personal", key, v)}
      />
    </Fieldset>
  );
}

function VisibilityControls({
  fields,
  visibility,
  onChange,
}: {
  fields: string[];
  visibility: Record<string, string>;
  onChange: (key: string, v: FieldVisibility) => void;
}) {
  if (fields.length === 0) return null;
  return (
    <div className="surface-2 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-content-muted">
        Visibilité des champs
      </div>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f} className="flex items-center gap-3 text-sm">
            <span className="w-20 capitalize text-content-secondary">{f}</span>
            {(["visible", "hidden", "private"] as const).map((v) => (
              <label key={v} className="flex items-center gap-1 text-content-muted">
                <input
                  type="radio"
                  name={`vis-${f}`}
                  checked={(visibility[f] ?? "visible") === v}
                  onChange={() => onChange(f, v)}
                  className="accent-[var(--color-accent)]"
                />
                <span>{v}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** URL input + live circular preview. Validates that the URL is well-formed
 *  and that the browser can actually fetch+decode it as an image (onError
 *  fires for 404s, non-image MIME, or CORS-blocked loads). Empty URL = no
 *  preview, no error (avatar is optional). The fallback monogram uses the
 *  gamerTag's first letter so the placeholder is personalized, not a bare "?". */
function AvatarField({
  url,
  gamerTag,
  onChange,
  onLoad,
  onError,
}: {
  url: string;
  gamerTag: string;
  onChange: (v: string) => void;
  onLoad: () => void;
  onError: () => void;
}) {
  const trimmed = url.trim();
  let urlValid = true;
  if (trimmed) {
    try {
      new URL(trimmed);
    } catch {
      urlValid = false;
    }
  }
  const monogram = (gamerTag?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2">
        {trimmed && urlValid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trimmed}
            alt=""
            className="h-full w-full object-cover"
            onLoad={onLoad}
            onError={onError}
          />
        ) : (
          <span className="text-lg font-semibold text-content-muted">{monogram}</span>
        )}
      </div>
      <TextInput
        id="avatarUrl"
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder={FIELDS.avatarUrl.placeholder}
        className="flex-1"
      />
    </div>
  );
}
