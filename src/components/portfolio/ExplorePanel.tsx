import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, Compass, RotateCcw, X } from "lucide-react";
import {
  OPEN_PROJECTS_EVENT,
  PROJECT_IDS,
  STEP_ORDER,
  doneCount,
  exploration,
  isStepDone,
  useCompletionCue,
  useExploration,
  type StepId,
} from "@/lib/exploration";
import { goToSection } from "@/lib/navigate";
import { exploreView as ui } from "@/content/site";

const TOTAL = STEP_ORDER.length;
const PANEL_ID = "explore-panel";

/**
 * Whether the panel is open. Shared between the panel and its triggers, which live in the
 * navigation docks (desktop rail, mobile dock) rather than floating over the page.
 */
let panelOpen = false;
const panelSubs = new Set<() => void>();
const setPanelOpen = (open: boolean) => {
  panelOpen = open;
  panelSubs.forEach((f) => f());
};
const usePanelOpen = () =>
  useSyncExternalStore(
    (f) => {
      panelSubs.add(f);
      return () => panelSubs.delete(f);
    },
    () => panelOpen,
    () => false,
  );
/** The trigger the visitor can currently see (rail on desktop, dock on phones). */
const focusTrigger = () =>
  [...document.querySelectorAll<HTMLElement>(".explore-pill")]
    .find((el) => el.getClientRects().length > 0)
    ?.focus();

/**
 * The "Explore portfolio" trigger, placed in a navigation dock so it never covers page
 * content: `rail` is the compact desktop version (count under the icon, name on hover and
 * focus), `dock` the mobile one. Hidden when the visitor has dismissed the panel.
 */
export function ExploreTrigger({ variant }: { variant: "rail" | "dock" }) {
  const s = useExploration();
  const open = usePanelOpen();
  const cue = useCompletionCue();
  const count = doneCount(s);
  if (s.dismissed) return null;
  const icon =
    count === TOTAL ? (
      <Check aria-hidden className="h-4 w-4 text-accent" />
    ) : (
      <Compass aria-hidden className="h-4 w-4 text-accent" />
    );
  const common = {
    type: "button" as const,
    "aria-expanded": open,
    "aria-controls": open ? PANEL_ID : undefined,
    "data-cue": cue || undefined,
    onClick: () => setPanelOpen(!open),
  };
  const name = (
    <span className="sr-only">
      {ui.title}, {count} {ui.of} {TOTAL} {ui.opened}
    </span>
  );
  if (variant === "rail")
    return (
      <div className="relative">
        <button
          {...common}
          className="explore-pill peer flex h-14 w-12 flex-col items-center justify-center gap-1 rounded-md border border-transparent transition-[background-color,border-color,transform] duration-150 hover:bg-surface active:scale-95 aria-expanded:bg-surface-2"
        >
          {icon}
          <span aria-hidden className="font-meta text-[0.6875rem] text-muted">
            {count}/{TOTAL}
          </span>
          {name}
        </button>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-md border border-control bg-surface px-2.5 py-1 text-small whitespace-nowrap text-text opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
        >
          {ui.title}
        </span>
      </div>
    );
  return (
    <button
      {...common}
      className="explore-pill inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border border-control px-2.5 transition-[background-color,border-color,transform] duration-150 hover:bg-surface-2 active:scale-95 aria-expanded:bg-surface-2"
    >
      {icon}
      <span aria-hidden className="font-meta text-muted">
        {count}/{TOTAL}
      </span>
      {name}
    </button>
  );
}

/** What each optional step does when chosen: ordinary section navigation, nothing gated. */
const actions: Record<StepId, () => void> = {
  experience: () => goToSection("experience"),
  projects: () => {
    goToSection("projects");
    window.dispatchEvent(new Event(OPEN_PROJECTS_EVENT));
  },
  skills: () => goToSection("skills"),
  certifications: () => goToSection("credentials"),
};

/**
 * Dismissible "Explore portfolio" panel: a non-modal panel that opens beside its trigger in
 * the navigation dock (Escape or the trigger closes it). Nothing on the page depends on it,
 * and progress only reflects what this visitor has opened.
 */
export function ExplorePanel() {
  const s = useExploration();
  const id = useId();
  const expanded = usePanelOpen();
  const setExpanded = setPanelOpen;
  const [recent, setRecent] = useState<StepId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const count = doneCount(s);
  // a short, visual-only cue when the visitor opens the last area (never on reload); it
  // marks their browsing, not an achievement, and is skipped entirely with motion off
  const cue = useCompletionCue();

  // subtle feedback: announce and briefly tint the step that was just completed
  useEffect(() => {
    let timer: number | undefined;
    const off = exploration.onStepComplete((step) => {
      const n = doneCount(exploration.get());
      setAnnouncement(
        `${ui.progressLabel}: ${ui.steps[step].label} — ${ui.done}. ${n} ${ui.of} ${TOTAL}.` +
          (n === TOTAL ? ` ${ui.complete}` : ""),
      );
      setRecent(step);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setRecent(null), 2400);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  const collapse = () => {
    setExpanded(false);
    focusTrigger();
  };
  const onPanelKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      collapse();
    }
  };
  const run = (step: StepId) => {
    setExpanded(false);
    actions[step]();
  };
  const hide = () => {
    exploration.setDismissed(true);
    setExpanded(false);
    setAnnouncement(`${ui.title} hidden. ${ui.show} from the footer or the command palette.`);
    document.getElementById("command-palette-trigger")?.focus();
  };
  // aria-disabled (not disabled) keeps keyboard focus on the button after resetting
  const nothingToReset = count === 0 && s.projects.length === 0;
  const reset = () => {
    if (nothingToReset) return;
    exploration.reset();
    setRecent(null);
    setAnnouncement(ui.resetDone);
  };

  const panelId = PANEL_ID;
  const titleId = `${id}-title`;

  // the live region stays mounted even while the panel is hidden, so announcements land
  return (
    <>
      <LiveRegion text={announcement} />
      {!s.dismissed && expanded && (
        <div
          data-cue={cue || undefined}
          className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(var(--dock-h)+0.5rem)] z-50 flex flex-col items-end lg:right-auto lg:bottom-6 lg:left-[calc(var(--spacing-rail)+0.75rem)] print:hidden"
        >
          <aside
            id={panelId}
            aria-labelledby={titleId}
            onKeyDown={onPanelKey}
            className="pointer-events-auto max-h-[min(calc(100vh-9.5rem-var(--dock-h)),38rem)] supports-[height:100dvh]:max-h-[min(calc(100dvh-9.5rem-var(--dock-h)),38rem)] lg:max-h-[min(calc(100vh-9.5rem),38rem)] lg:supports-[height:100dvh]:max-h-[min(calc(100dvh-9.5rem),38rem)] w-[min(23rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-5 shadow-[0_18px_48px_-12px_rgb(0_0_0/0.65)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="text-body font-semibold text-text">
                {ui.title}
              </h2>
              <div className="-mr-2 -mt-1 flex">
                <button
                  type="button"
                  onClick={collapse}
                  aria-label={ui.collapse}
                  className="grid h-11 w-11 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
                >
                  <ChevronDown aria-hidden className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={hide}
                  aria-label={ui.hide}
                  className="grid h-11 w-11 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Progress count={count} />

            <ol className="mt-4 flex flex-col gap-1.5">
              {STEP_ORDER.map((step) => {
                const done = isStepDone(s, step);
                const partial =
                  step === "projects" && !done && s.projects.length > 0
                    ? `${s.projects.length} ${ui.of} ${PROJECT_IDS.length} ${ui.opened}`
                    : null;
                return (
                  <li key={step}>
                    <button
                      type="button"
                      onClick={() => run(step)}
                      data-step={step}
                      data-done={done}
                      className={`flex min-h-12 w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        recent === step
                          ? "border-accent bg-accent/10"
                          : "border-line hover:border-control hover:bg-surface-2"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                          done ? "border-accent bg-accent text-accent-ink" : "border-control"
                        }`}
                      >
                        {done && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-small font-medium text-text">
                          {ui.steps[step].label}
                        </span>
                        <span className="text-small text-muted">
                          {done ? ui.done : (partial ?? ui.steps[step].hint)}
                          {!done && !partial && <span className="sr-only"> — {ui.notYet}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-small text-muted">
                {count === TOTAL && (
                  <span className="inline-flex items-center gap-1.5 text-text">
                    <Check aria-hidden className="h-4 w-4 text-accent" />
                    {ui.complete}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={reset}
                aria-disabled={nothingToReset}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-control px-3 text-small font-medium text-text hover:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                {ui.reset}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Four segments, one per area. Labelled as visitor exploration, not as a skill score. */
function Progress({ count }: { count: number }) {
  const id = useId();
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <span id={`${id}-label`} className="font-meta text-muted">
          {ui.progressLabel}
        </span>
        <span className="font-meta text-text">
          {count} {ui.of} {TOTAL}
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-note`}
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={count}
        aria-valuetext={`${count} ${ui.of} ${TOTAL} ${ui.opened}`}
        className="mt-2 grid grid-cols-4 gap-1"
      >
        {STEP_ORDER.map((step, i) => (
          <span
            key={step}
            style={{ "--i": i } as CSSProperties}
            className={`explore-seg h-1.5 rounded-full transition-colors duration-500 ${
              i < count ? "bg-accent" : "bg-surface-2"
            }`}
          />
        ))}
      </div>
      <p id={`${id}-note`} className="mt-2 text-small text-muted">
        {ui.progressNote}
      </p>
    </div>
  );
}

function LiveRegion({ text }: { text: string }) {
  return (
    <p aria-live="polite" role="status" className="sr-only">
      {text}
    </p>
  );
}
