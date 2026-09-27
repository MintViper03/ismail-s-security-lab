import { useSyncExternalStore } from "react";
import { uiStorage } from "./ui-storage";

/**
 * Visitor exploration progress: which of four areas this visitor has actually opened on
 * the page. It measures the visitor's browsing only — never Ismail's skills or results.
 * Kept in UI storage on this device; no accounts, analytics or network calls.
 */

export type StepId = "experience" | "projects" | "skills" | "certifications";
export const STEP_ORDER: readonly StepId[] = ["experience", "projects", "skills", "certifications"];
export const PROJECT_IDS = ["proj.aigisai", "proj.sentineltrace"] as const;

export interface ExplorationState {
  experience: boolean;
  /** Project ids whose details the visitor has opened (or read in Reading mode). */
  projects: string[];
  skills: boolean;
  certifications: boolean;
  /** The floating panel was hidden by the visitor. */
  dismissed: boolean;
}

const KEY = "portfolio-exploration";
const EMPTY: ExplorationState = {
  experience: false,
  projects: [],
  skills: false,
  certifications: false,
  dismissed: false,
};

let state: ExplorationState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
/** Notified when a visitor action completes a step (never for progress restored on load). */
const completions = new Set<(step: StepId) => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = uiStorage.get(KEY);
    if (!raw) return;
    const v = JSON.parse(raw) as Partial<ExplorationState>;
    state = {
      experience: v.experience === true,
      projects: Array.isArray(v.projects)
        ? v.projects.filter((p): p is string => (PROJECT_IDS as readonly string[]).includes(p))
        : [],
      skills: v.skills === true,
      certifications: v.certifications === true,
      dismissed: v.dismissed === true,
    };
  } catch {
    state = EMPTY;
  }
}

function update(next: ExplorationState) {
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  const before = state;
  state = next;
  uiStorage.set(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
  STEP_ORDER.filter((s) => isStepDone(state, s) && !isStepDone(before, s)).forEach((s) =>
    completions.forEach((c) => c(s)),
  );
}

export const exploration = {
  get(): ExplorationState {
    load();
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  mark(step: Exclude<StepId, "projects">) {
    load();
    if (!state[step]) update({ ...state, [step]: true });
  },
  markProject(id: string) {
    load();
    if (!state.projects.includes(id)) update({ ...state, projects: [...state.projects, id] });
  },
  /** Clears progress; keeps the panel's visibility preference. */
  reset() {
    load();
    update({ ...EMPTY, dismissed: state.dismissed });
  },
  onStepComplete(cb: (step: StepId) => void) {
    completions.add(cb);
    return () => completions.delete(cb);
  },
  setDismissed(dismissed: boolean) {
    load();
    update({ ...state, dismissed });
  },
};

export function isStepDone(s: ExplorationState, step: StepId): boolean {
  return step === "projects" ? PROJECT_IDS.every((p) => s.projects.includes(p)) : s[step];
}

export function doneCount(s: ExplorationState): number {
  return STEP_ORDER.filter((step) => isStepDone(s, step)).length;
}

/** Live exploration state; SSR and hydration see the empty state. */
export function useExploration(): ExplorationState {
  return useSyncExternalStore(exploration.subscribe, exploration.get, () => EMPTY);
}

/** Fired by the explore panel's "Open both projects" action; Projects opens its details. */
export const OPEN_PROJECTS_EVENT = "portfolio:open-projects";

/** Brings the explore panel back and focuses its pill (the restoring control disappears). */
export function restoreExplorePanel() {
  exploration.setDismissed(false);
  requestAnimationFrame(() => document.getElementById("explore-pill")?.focus());
}
