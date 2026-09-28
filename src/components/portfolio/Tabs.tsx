import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * WAI-ARIA tabs with automatic activation: click/tap, Arrow keys, Home, End.
 * Only the selected tab is in the Tab order; the panel itself is focusable.
 */
export function Tabs({
  label,
  tabs,
  selected,
  onSelect,
  children,
  listClassName = "",
  panelClassName = "",
  vertical = false,
  verticalClassName = "grid-cols-[minmax(0,17rem)_minmax(0,1fr)] gap-10",
  bothAxes = false,
}: {
  /** Visible label announced as the tablist's name. */
  label: string;
  tabs: readonly { key: string; label: ReactNode }[];
  selected: number;
  onSelect: (index: number) => void;
  /** Content of the selected tab's panel. */
  children: ReactNode;
  listClassName?: string;
  panelClassName?: string;
  /** Stacked tab list beside the panel; Up/Down arrows move between tabs. */
  vertical?: boolean;
  /** Grid for the vertical layout (list column + panel). */
  verticalClassName?: string;
  /** For a list laid out as a grid or reflowing by breakpoint: all four arrows move. */
  bothAxes?: boolean;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = tabs.length;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    const fwd =
      e.key === forward || (bothAxes && (e.key === "ArrowRight" || e.key === "ArrowDown"));
    const bck = e.key === back || (bothAxes && (e.key === "ArrowLeft" || e.key === "ArrowUp"));
    const next = fwd
      ? (selected + 1) % n
      : bck
        ? (selected - 1 + n) % n
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? n - 1
            : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  const list = (
    <>
      <span id={`${id}-label`} className="font-meta text-muted">
        {label}
      </span>
      <div
        role="tablist"
        aria-labelledby={`${id}-label`}
        aria-orientation={vertical ? "vertical" : "horizontal"}
        className={cn("mt-3 grid gap-1 rounded-md border border-control p-1", listClassName)}
      >
        {tabs.map((t, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={t.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={isSelected}
              aria-controls={`${id}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(i)}
              onKeyDown={onKeyDown}
              className={`min-h-11 rounded-[4px] px-2 py-1.5 text-small font-medium leading-tight transition-[color,background-color,transform] duration-150 active:scale-[0.97] ${
                vertical ? "text-left" : ""
              } ${
                isSelected
                  ? `bg-surface-2 text-text ${
                      vertical
                        ? "shadow-[inset_2px_0_0_var(--accent)]"
                        : "shadow-[inset_0_-2px_0_var(--accent)]"
                    }`
                  : "text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </>
  );
  const panel = (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${id}-tab-${selected}`}
      tabIndex={0}
      className={cn(vertical ? "rounded-sm" : "mt-4 rounded-sm", panelClassName)}
    >
      {children}
    </div>
  );

  return vertical ? (
    <div className={cn("grid", verticalClassName)}>
      <div>{list}</div>
      {panel}
    </div>
  ) : (
    <>
      {list}
      {panel}
    </>
  );
}
