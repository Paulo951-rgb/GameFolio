"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { FieldDescriptor, GameDefinition } from "@gamer-cv/types";
import { resolveFieldOptions } from "@/lib/games";
import { Field, TextInput, NumberInput, Textarea, Select } from "@/components/ui";

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
    if (!hasOptions) {
      return (
        <Field label={field.label}>
          <TextInput
            type="text"
            placeholder={field.placeholder ?? "Saisie libre"}
            {...register(field.key)}
          />
        </Field>
      );
    }
    return (
      <Field label={field.label}>
        <Select {...register(field.key)}>
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </Field>
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(currentValue)
      ? (currentValue as string[])
      : [];

    if (!hasOptions) {
      return (
        <Field label={field.label}>
          <TextInput
            type="text"
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
        </Field>
      );
    }

    function toggle(opt: string, checked: boolean) {
      const next = checked
        ? [...selected, opt]
        : selected.filter((o) => o !== opt);
      onMultiChange(field.key, next);
    }
    return (
      <fieldset>
        <span className="block text-sm font-medium text-content-secondary">
          {field.label}
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
                  checked
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggle(o, e.target.checked)}
                  className="accent-[var(--color-accent)]"
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
      <Field label={field.label}>
        <NumberInput
          placeholder={field.placeholder}
          {...register(field.key, { valueAsNumber: true })}
        />
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field label={field.label}>
        <Textarea rows={3} placeholder={field.placeholder} {...register(field.key)} />
      </Field>
    );
  }

  // text
  return (
    <Field label={field.label}>
      <TextInput type="text" placeholder={field.placeholder} {...register(field.key)} />
    </Field>
  );
}
