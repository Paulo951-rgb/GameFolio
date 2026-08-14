"use client";

import { useEditorStore } from "@/lib/store";
import type { FieldVisibility } from "@gamer-cv/types";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
const labelClass = "block text-sm font-medium text-slate-300";

const VISIBLE_FIELDS: { key: keyof typeof FIELDS; label: string }[] = [];

const FIELDS = {
  gamerTag: { label: "Pseudo / GamerTag *", type: "text", placeholder: "ShadowHunter" },
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

  function setField(key: keyof typeof FIELDS, value: string | number) {
    setPersonalInfo({ [key]: value } as never);
  }

  function setSocials(raw: string) {
    // discord:twitch:...
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informations personnelles</h2>

      <label className="block">
        <span className={labelClass}>{FIELDS.gamerTag.label}</span>
        <input
          type="text"
          value={info.gamerTag}
          onChange={(e) => setField("gamerTag", e.target.value)}
          placeholder={FIELDS.gamerTag.placeholder}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClass}>{FIELDS.firstName.label}</span>
          <input
            type="text"
            value={info.firstName ?? ""}
            onChange={(e) => setField("firstName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>{FIELDS.age.label}</span>
          <input
            type="number"
            value={info.age ?? ""}
            onChange={(e) =>
              setField("age", e.target.value === "" ? 0 : Number(e.target.value))
            }
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClass}>{FIELDS.country.label}</span>
          <input
            type="text"
            value={info.country ?? ""}
            onChange={(e) => setField("country", e.target.value)}
            placeholder={FIELDS.country.placeholder}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>{FIELDS.languages.label}</span>
          <input
            type="text"
            value={(info.languages ?? []).join(", ")}
            onChange={(e) =>
              setField(
                "languages",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as never,
              )
            }
            placeholder={FIELDS.languages.placeholder}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>{FIELDS.platforms.label}</span>
        <input
          type="text"
          value={(info.platforms ?? []).join(", ")}
          onChange={(e) =>
            setField(
              "platforms",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as never,
            )
          }
          placeholder={FIELDS.platforms.placeholder}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>{FIELDS.avatarUrl.label}</span>
        <input
          type="text"
          value={info.avatarUrl ?? ""}
          onChange={(e) => setField("avatarUrl", e.target.value)}
          placeholder={FIELDS.avatarUrl.placeholder}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Réseaux sociaux (une ligne au format nom:url)</span>
        <textarea
          value={socialsText}
          onChange={(e) => setSocials(e.target.value)}
          rows={3}
          placeholder={"discord:Shad0w\ntwitch:shadowhunter"}
          className={inputClass}
        />
      </label>

      <VisibilityControls
        fields={["age", "country", "firstName"]}
        visibility={info.visibility}
        onChange={(key, v) => setFieldVisibility("personal", key, v)}
      />
    </div>
  );
}

void VISIBLE_FIELDS;

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
    <div className="rounded-md border border-slate-800 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        Visibilité des champs
      </div>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f} className="flex items-center gap-3 text-sm">
            <span className="w-20 capitalize">{f}</span>
            {(["visible", "hidden", "private"] as const).map((v) => (
              <label key={v} className="flex items-center gap-1">
                <input
                  type="radio"
                  name={`vis-${f}`}
                  checked={(visibility[f] ?? "visible") === v}
                  onChange={() => onChange(f, v)}
                  className="accent-violet-500"
                />
                <span className="text-slate-400">{v}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
