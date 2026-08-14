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
} from "@gamer-cv/types";

const STORAGE_KEY = "gamer-cv:current-profile";

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
    templateId: "minimalist",
    themeConfig: { templateId: "minimalist" },
  };
}

export interface EditorState {
  profile: GamerProfile;
  currentStep: number;
  hydrated: boolean;
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
  setGeneratedText: (text: GeneratedText) => void;
  setFlaggedFacts: (facts: string[]) => void;
  setGenerating: (v: boolean) => void;
  setGenerationError: (msg: string | null) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(profile: GamerProfile) {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void idbSet(STORAGE_KEY, profile);
  }, 400);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  profile: makeDefaultProfile(),
  currentStep: 0,
  hydrated: false,
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
      flaggedFacts: [],
      isGenerating: false,
      generationError: null,
    });
    void idbDel(STORAGE_KEY);
  },

  loadCloudProfile: (profile) => {
    set({ profile, currentStep: 0, flaggedFacts: [], isGenerating: false, generationError: null });
    void idbSet(STORAGE_KEY, profile);
  },

  hydrate: async () => {
    if (typeof window === "undefined") return;
    const saved = (await idbGet(STORAGE_KEY)) as GamerProfile | undefined;
    if (saved) {
      set({ profile: saved, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  setGeneratedText: (text) => {
    const profile = { ...get().profile, generatedText: text };
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
}));
