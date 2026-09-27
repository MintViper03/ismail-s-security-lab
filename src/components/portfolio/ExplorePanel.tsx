import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Compass, RotateCcw, X } from "lucide-react";
import {
  OPEN_PROJECTS_EVENT,
  PROJECT_IDS,
  STEP_ORDER,
  doneCount,
  exploration,
  isStepDone,
  useExploration,
  type StepId,
} from "@/lib/exploration";
import { goToSection } from "@/lib/navigate";
import { exploreView as ui } from "@/content/site";

const TOTAL = STEP_ORDER.length;

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
 * Floating, dismissible "Explore portfolio" panel. Collapsed it is a small pill with the
 * count; expanded it is a non-modal panel (Escape or the pill collapses it). Nothing on the
 * page depends on it, and progress only reflects what this visitor has opened.
 */
export function ExplorePanel() {
  const s = useExploration();
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [recent, setRecent] = useState<StepId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const pillRef = useRef<HTMLButtonElement>(null);
  const count = doneCount(s);

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
    pillRef.current?.focus();
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

  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;

  // the live region stays mounted even while the panel is hidden, so announcements land
  return (
    <>
      <LiveRegion text={announcement} />
      {!s.dismissed && (
        <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-end gap-2 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-[max(1.5rem,env(safe-area-inset-right))] print:hidden">
          {expanded && (
            <aside
              id={panelId}
              aria-labelledby={titleId}
              onKeyDown={onPanelKey}
              className="pointer-events-auto max-h-[min(calc(100vh-9.5rem),38rem)] supports-[height:100dvh]:max-h-[min(calc(100dvh-9.5rem),38rem)] w-[min(23rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-5 shadow-[0_18px_48px_-12px_rgb(0_0_0/0.65)]"
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
          )}

          <button
            ref={pillRef}
            id="explore-pill"
            type="button"
            aria-expanded={expanded}
            aria-controls={expanded ? panelId : undefined}
            onClick={() => setExpanded((x) => !x)}
            className="pointer-events-auto inline-flex h-11 min-w-11 items-center gap-2.5 rounded-full border border-control bg-surface px-3.5 text-small sm:px-4 font-medium text-text shadow-[0_10px_30px_-10px_rgb(0_0_0/0.7)] hover:bg-surface-2"
          >
            <Compass aria-hidden className="h-4 w-4 text-accent" />
            {/* compact on phones so the pill never covers the hero's actions */}
            <span className="sr-only sm:not-sr-only">{ui.title}</span>
            <span className="font-meta text-muted">
              {count}/{TOTAL}
              <span className="sr-only"> {ui.opened}</span>
            </span>
          </button>
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
            className={`h-1.5 rounded-full transition-colors duration-500 ${
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
