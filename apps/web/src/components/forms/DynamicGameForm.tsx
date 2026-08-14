"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { FieldDescriptor, GameDefinition } from "@gamer-cv/types";
import { resolveFieldOptions } from "@/lib/games";

/**
 * DynamicGameForm — renders a game's form from its resolved module fields,
 * with NO per-game code. Each FieldDescriptor.type maps to a widget; options
 * are resolved from the game's gameData (game.ranks, game.roles, ...) at
 * render time. The form writes back to the Zustand store on every change so
 * the live preview updates in real time.
 */
interface DynamicGameFormProps {
  game: GameDefinition;
  fields: FieldDescriptor[];
  compositeSchema: z.ZodTypeAny;
  values: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
const labelClass = "block text-sm font-medium text-slate-300";

export function DynamicGameForm({
  game,
  fields,
  compositeSchema,
  values,
  onChange,
}: DynamicGameFormProps) {
  const resolver = useMemo(() => zodResolver(compositeSchema), [compositeSchema]);

  const { register, watch, setValue } = useForm<Record<string, unknown>>({
    resolver,
    defaultValues: values as Record<string, unknown>,
    mode: "onChange",
  });

  // Stream registered-field changes (text/select/number) to the store. Empty
  // number inputs register as NaN (RHF valueAsNumber); strip them so NaN never
  // reaches the store / IndexedDB / AI prompt (it would render as "NaN" and
  // leak an ambiguous value to the model).
  const subscription = watch((data) => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      cleaned[k] = typeof v === "number" && Number.isNaN(v) ? undefined : v;
    }
    onChange(cleaned);
  });
  void subscription;

  // Multiselect fields are controlled (not registered), so push their changes
  // to the store directly — watch doesn't reliably cover setValue-only fields.
  const pushField = (key: string, value: unknown) => {
    setValue(key, value, { shouldDirty: true, shouldValidate: false });
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          game={game}
          register={register}
          onMultiChange={pushField}
          currentValue={values[field.key]}
        />
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  game,
  register,
  onMultiChange,
  currentValue,
}: {
  field: FieldDescriptor;
  game: GameDefinition;
  register: ReturnType<typeof useForm<Record<string, unknown>>>["register"];
  onMultiChange: (key: string, value: unknown) => void;
  currentValue: unknown;
}) {
  const options = resolveFieldOptions(game, field);
  const hasOptions = !!options?.length;

  if (field.type === "select") {
    // No resolved options -> free-text fallback so the field stays usable
    // (optionsSource fields use z.string(), so free text validates).
    if (!hasOptions) {
      return (
        <label className="block">
          <span className={labelClass}>{field.label}</span>
          <input
            type="text"
            className={inputClass}
            placeholder={field.placeholder ?? "Saisie libre"}
            {...register(field.key)}
          />
        </label>
      );
    }
    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>
        <select className={inputClass} {...register(field.key)}>
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "multiselect") {
    // Controlled checkboxes: maintain an array of selected option strings,
    // pushed to the store on every toggle.
    const selected = Array.isArray(currentValue)
      ? (currentValue as string[])
      : [];

    // No resolved options -> free-text fallback (comma-separated -> array).
    // The schema is z.array(z.string()), so a split array validates.
    if (!hasOptions) {
      return (
        <label className="block">
          <span className={labelClass}>{field.label}</span>
          <input
            type="text"
            className={inputClass}
            placeholder="Saisie libre (séparé par des virgules)"
            value={selected.join(", ")}
            onChange={(e) =>
              onMultiChange(
                field.key,
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      );
    }

    function toggle(opt: string, checked: boolean) {
      const next = checked
        ? [...selected, opt]
        : selected.filter((o) => o !== opt);
      onMultiChange(field.key, next);
    }
    return (
      <fieldset className="block">
        <span className={labelClass}>{field.label}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
                  checked
                    ? "border-violet-500 bg-violet-600/20"
                    : "border-slate-700 bg-slate-900 hover:border-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggle(o, e.target.checked)}
                  className="accent-violet-500"
                />
                {o}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (field.type === "number") {
    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>
        <input
          type="number"
          className={inputClass}
          placeholder={field.placeholder}
          {...register(field.key, { valueAsNumber: true })}
        />
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className={labelClass}>{field.label}</span>
        <textarea
          className={inputClass}
          rows={3}
          placeholder={field.placeholder}
          {...register(field.key)}
        />
      </label>
    );
  }

  // text
  return (
    <label className="block">
      <span className={labelClass}>{field.label}</span>
      <input
        type="text"
        className={inputClass}
        placeholder={field.placeholder}
        {...register(field.key)}
      />
    </label>
  );
}
