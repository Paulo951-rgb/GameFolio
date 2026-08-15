"use client";

import { create } from "zustand";
import { set as idbSet, del as idbDel } from "idb-keyval";
import { get as idbGet } from "idb-keyval";
import type {
  GamerProfile,
  PersonalInfo,
  GameEntry,
  ThemeConfig,
  FieldVisibility,
  GeneratedText,
  Achievement,
} from "@gamer-cv/types";
import { normalizeGeneratedText } from "@/lib/normalize";

const STORAGE_KEY = "gamer-cv:current-profile";
/** Separate key for the cloud DB id (kept apart from the profile blob so the
 *  profile persistence shape is unchanged — no migration risk). null when the
 *  in-progress profile has never been saved to / loaded from the cloud. */
const CLOUD_ID_KEY = "gamer-cv:cloud-profile-id";

/**
 * Editor store (Zustand) — the single source of truth for the profile being
 * edited. The form writes here; the live preview subscribes and re-renders on
 * change. Autosave is debounced to IndexedDB so the user can close the tab and
 * resume without loss (local-first, no account required).
 */

function makeDefaultProfile(): GamerProfile {
  return {
    id: crypto.randomUUID(),
    personalInfo: {
      gamerTag: "",
      visibility: {},
    },
    playerTypes: [],
    games: [],
    achievements: [],
    templateId: "minimalist",
    themeConfig: { templateId: "minimalist" },
  };
}

export interface EditorState {
  profile: GamerProfile;
  currentStep: number;
  hydrated: boolean;
  /** Cloud DB id of the profile when it has been saved/loaded from the cloud.
   *  Tracked so repeated saves PATCH the same row instead of POSTing duplicates.
   *  null for a purely-local profile. Persisted alongside the profile. */
  cloudProfileId: string | null;
  /** True while a debounced IndexedDB autosave is pending (between an edit and
   *  the actual idb write completing). Drives the honest "Enregistrement…"
   *  status in the editor header. */
  isSaving: boolean;
  /** Epoch ms of the last successful IndexedDB autosave write, or null when no
   *  save has happened yet this session (e.g. right after hydrate). Drives the
   *  "Sauvegardé il y a Xs" status. */
  lastSavedAt: number | null;
  /** Facts the anti-hallucination check flagged as "à vérifier". */
  flaggedFacts: string[];
  /** True while an AI generation request is in flight. */
  isGenerating: boolean;
  generationError: string | null;
  setPersonalInfo: (patch: Partial<PersonalInfo>) => void;
  setPlayerTypes: (types: string[]) => void;
  setGameCount: (n: number) => void;
  addGame: (entry: GameEntry) => void;
  updateGame: (index: number, patch: Partial<GameEntry>) => void;
  removeGame: (index: number) => void;
  reorderGames: (from: number, to: number) => void;
  setFieldVisibility: (scope: "personal" | number, key: string, v: FieldVisibility) => void;
  setTemplate: (templateId: string) => void;
  setTheme: (patch: Partial<ThemeConfig>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  hydrate: () => Promise<void>;
  /** Replace the in-memory profile with a cloud-loaded one + persist locally. */
  loadCloudProfile: (profile: GamerProfile) => void;
  /** Record the cloud DB id after a save, so future saves PATCH not POST. */
  setCloudProfileId: (id: string | null) => void;
  setGeneratedText: (text: GeneratedText) => void;
  setFlaggedFacts: (facts: string[]) => void;
  setGenerating: (v: boolean) => void;
  setGenerationError: (msg: string | null) => void;
  addAchievement: (a: Achievement) => void;
  updateAchievement: (id: string, patch: Partial<Achievement>) => void;
  removeAchievement: (id: string) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced autosave to IndexedDB (400ms after the last edit). Also drives the
 * editor's save-status indicator: marks `isSaving` true while a write is
 * pending, then flips it false and stamps `lastSavedAt` once idb resolves — so
 * the header can show an honest "Enregistrement…" → "Sauvegardé il y a Xs"
 * instead of a permanently-static "Sauvegardé".
 */
function scheduleSave(profile: GamerProfile) {
  if (typeof window === "undefined") return;
  useEditorStore.setState({ isSaving: true });
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void idbSet(STORAGE_KEY, profile).then(() => {
      useEditorStore.setState({ isSaving: false, lastSavedAt: Date.now() });
    });
  }, 400);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  profile: makeDefaultProfile(),
  currentStep: 0,
  hydrated: false,
  cloudProfileId: null,
  isSaving: false,
  lastSavedAt: null,
  flaggedFacts: [],
  isGenerating: false,
  generationError: null,

  setPersonalInfo: (patch) => {
    const profile = {
      ...get().profile,
      personalInfo: { ...get().profile.personalInfo, ...patch },
    };
    set({ profile });
    scheduleSave(profile);
  },

  setPlayerTypes: (types) => {
    const profile = { ...get().profile, playerTypes: types };
    set({ profile });
    scheduleSave(profile);
  },

  setGameCount: (n) => {
    const games = [...get().profile.games];
    if (n > games.length) {
      for (let i = games.length; i < n; i++) {
        games.push({ gameId: "", moduleData: {}, order: i });
      }
    } else {
      games.length = n;
    }
    const profile = { ...get().profile, games };
    set({ profile });
    scheduleSave(profile);
  },

  addGame: (entry) => {
    const games = [...get().profile.games, entry];
    const profile = { ...get().profile, games };
    set({ profile });
    scheduleSave(profile);
  },

  updateGame: (index, patch) => {
    const games = get().profile.games.map((g, i) =>
      i === index ? { ...g, ...patch } : g,
    );
    const profile = { ...get().profile, games };
    set({ profile });
    scheduleSave(profile);
  },

  removeGame: (index) => {
    const games = get().profile.games.filter((_, i) => i !== index);
    const profile = { ...get().profile, games };
    set({ profile });
    scheduleSave(profile);
  },

  reorderGames: (from, to) => {
    const games = [...get().profile.games];
    if (from < 0 || to < 0 || from >= games.length || to >= games.length) return;
    const [moved] = games.splice(from, 1);
    games.splice(to, 0, moved);
    games.forEach((g, i) => (g.order = i));
    const profile = { ...get().profile, games };
    set({ profile });
    scheduleSave(profile);
  },

  setFieldVisibility: (scope, key, v) => {
    const profile = { ...get().profile };
    if (scope === "personal") {
      profile.personalInfo = {
        ...profile.personalInfo,
        visibility: { ...profile.personalInfo.visibility, [key]: v },
      };
    } else {
      // per-game field visibility lives in the game entry's moduleData
      // adjacency; for the MVP we store it on personalInfo keyed by
      // `${gameIndex}.${key}` to keep the store flat. The visibility engine
      // consumes a VisibilityMap keyed by field name, so this is resolved at
      // preview time.
      profile.personalInfo = {
        ...profile.personalInfo,
        visibility: { ...profile.personalInfo.visibility, [`${scope}.${key}`]: v },
      };
    }
    set({ profile });
    scheduleSave(profile);
  },

  setTemplate: (templateId) => {
    const profile = {
      ...get().profile,
      templateId,
      themeConfig: { ...get().profile.themeConfig, templateId },
    };
    set({ profile });
    scheduleSave(profile);
  },

  setTheme: (patch) => {
    const profile = {
      ...get().profile,
      themeConfig: { ...get().profile.themeConfig, ...patch },
    };
    set({ profile });
    scheduleSave(profile);
  },

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  reset: () => {
    const profile = makeDefaultProfile();
    set({
      profile,
      currentStep: 0,
      cloudProfileId: null,
      isSaving: false,
      lastSavedAt: null,
      flaggedFacts: [],
      isGenerating: false,
      generationError: null,
    });
    void idbDel(STORAGE_KEY);
    void idbDel(CLOUD_ID_KEY);
  },

  loadCloudProfile: (profile) => {
    // A profile loaded from the cloud carries its DB id as profile.id — record
    // it so subsequent saves PATCH the same row instead of creating duplicates.
    // The generatedText JSON column is cast `as GeneratedText` by the mapper
    // with no validation; an older DB row can carry a partial/legacy shape whose
    // array fields are undefined at runtime → normalize before it reaches the UI.
    if (profile.generatedText !== undefined) {
      profile.generatedText = normalizeGeneratedText(profile.generatedText);
    }
    set({
      profile,
      currentStep: 0,
      cloudProfileId: profile.id,
      flaggedFacts: [],
      isGenerating: false,
      generationError: null,
    });
    void idbSet(STORAGE_KEY, profile);
    void idbSet(CLOUD_ID_KEY, profile.id);
  },

  setCloudProfileId: (id) => {
    set({ cloudProfileId: id });
    if (typeof window !== "undefined") {
      if (id) void idbSet(CLOUD_ID_KEY, id);
      else void idbDel(CLOUD_ID_KEY);
    }
  },

  hydrate: async () => {
    if (typeof window === "undefined") return;
    const saved = (await idbGet(STORAGE_KEY)) as GamerProfile | undefined;
    const cloudId = (await idbGet(CLOUD_ID_KEY)) as string | undefined;
    if (saved) {
      // A profile restored from IndexedDB may have been persisted by an older
      // app version or carry a partial/legacy generatedText whose array fields
      // are missing (undefined at runtime despite the TS type). Re-validate it
      // through the schema so the UI never crashes on generated.specializations
      // .length / generated.games.map etc. (see normalizeGeneratedText).
      if (saved.generatedText !== undefined) {
        saved.generatedText = normalizeGeneratedText(saved.generatedText);
      }
      set({ profile: saved, cloudProfileId: cloudId ?? null, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  setGeneratedText: (text) => {
    // Defense-in-depth: the API route already parses the AI output through
    // GeneratedTextSchema, but inline edits (editText/editGame spreads) and any
    // future caller could introduce a partial shape. Normalize so the runtime
    // always matches the GeneratedText contract.
    const normalized = normalizeGeneratedText(text);
    const profile = {
      ...get().profile,
      generatedText: normalized as GeneratedText | undefined,
    };
    set({ profile });
    scheduleSave(profile);
  },

  setFlaggedFacts: (facts) => set({ flaggedFacts: facts }),
  setGenerating: (v) =>
    set((s) => ({
      isGenerating: v,
      generationError: v ? null : s.generationError,
    })),
  setGenerationError: (msg) => set({ generationError: msg }),

  addAchievement: (a) => {
    const profile = {
      ...get().profile,
      achievements: [...(get().profile.achievements ?? []), a],
    };
    set({ profile });
    scheduleSave(profile);
  },
  updateAchievement: (id, patch) => {
    const profile = {
      ...get().profile,
      achievements: (get().profile.achievements ?? []).map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    };
    set({ profile });
    scheduleSave(profile);
  },
  removeAchievement: (id) => {
    const profile = {
      ...get().profile,
      achievements: (get().profile.achievements ?? []).filter((a) => a.id !== id),
    };
    set({ profile });
    scheduleSave(profile);
  },
}));
