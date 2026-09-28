import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, Command as CommandIcon, Download, Mail, Menu, X } from "lucide-react";
import { useViewMode, type ViewMode } from "@/lib/view-mode";
import { contact } from "@/content/resume";
import { useCompletionCue } from "@/lib/exploration";
import {
  dockView,
  motionControl,
  nav,
  paletteView,
  resumeDownload,
  sections,
  viewModeControl,
  type SectionId,
} from "@/content/site";
import { cn } from "@/lib/utils";
import { goToSection } from "@/lib/navigate";
import { ActionLink, Meta } from "./primitives";
import { ExploreTrigger } from "./ExplorePanel";

export function ViewModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useViewMode();
  const options: { value: ViewMode; label: string; hint: string }[] = [
    {
      value: "interactive",
      label: viewModeControl.interactive,
      hint: viewModeControl.interactiveHint,
    },
    { value: "reading", label: viewModeControl.reading, hint: viewModeControl.readingHint },
  ];

  return (
    <div
      role="group"
      aria-label={viewModeControl.groupLabel}
      className={cn("inline-flex rounded-md border border-control p-0.5", className)}
    >
      {options.map((o) => {
        const pressed = mode === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={pressed}
            title={o.hint}
            onClick={() => setMode(o.value)}
            className={`h-11 rounded-[4px] px-3 text-small font-medium transition-colors ${
              pressed ? "bg-surface-2 text-text" : "text-muted hover:text-text"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Motion on/off. A toggle button with a constant name ("Motion"); pressed = motion on.
 * Off stops every animation, transition, pointer depth and the 3D loop site-wide.
 */
export function MotionToggle({ className = "" }: { className?: string }) {
  const { reducedMotion, setReducedMotion } = useViewMode();
  const on = !reducedMotion;
  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? motionControl.hintOn : motionControl.hintOff}
      onClick={() => setReducedMotion(on)}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md border border-control px-3 text-small font-medium text-text transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${on ? "bg-accent shadow-[0_0_8px_var(--accent)]" : "bg-control"}`}
      />
      {motionControl.label}
      {/* state shown visually; aria-pressed carries it for assistive technology */}
      <span aria-hidden className="inline-block w-[3ch] font-meta text-muted">
        {on ? motionControl.on : motionControl.off}
      </span>
    </button>
  );
}

export function SiteHeader({
  active,
  onOpenPalette,
}: {
  active: SectionId;
  onOpenPalette: () => void;
}) {
  const current = sections.find((s) => s.id === active)!;
  // show the platform's own shortcut once we know it (SSR renders the Ctrl form)
  const [isMac, setIsMac] = useState(false);
  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-header border-b border-line">
      {/* blur lives on a layer: backdrop-filter on the header itself would become the
          containing block for the fixed mobile menu panel and clip it to 64px */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg/90 backdrop-blur-md" />
      <div className="flex h-full items-center justify-between gap-4 px-gutter">
        <div className="flex min-w-0 items-center gap-5">
          <a
            href="#overview"
            className="flex min-h-11 items-center gap-2.5 rounded-sm text-small font-semibold tracking-[-0.01em] whitespace-nowrap text-text"
          >
            <span aria-hidden className="h-2 w-2 rounded-[2px] bg-accent" />
            Ismail Murtaza
          </a>
          <span aria-hidden className="hidden h-4 w-px bg-line lg:block" />
          <Meta className="hidden truncate lg:block">
            <span className="text-accent">{current.num}</span> / {current.title}
          </Meta>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="command-palette-trigger"
            type="button"
            onClick={onOpenPalette}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K /"
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-control px-2.5 text-small font-medium text-text transition-colors hover:bg-surface-2 sm:px-3"
          >
            <CommandIcon aria-hidden className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">{paletteView.trigger}</span>
            <kbd className="hidden font-meta text-muted xl:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <MotionToggle className="hidden lg:inline-flex" />
          <ViewModeToggle className="hidden sm:inline-flex" />
          <ActionLink
            href={resumeDownload.href}
            download={resumeDownload.fileName}
            variant="secondary"
            size="sm"
            className="hidden lg:inline-flex"
          >
            <Download aria-hidden className="h-4 w-4" />
            {resumeDownload.label}
          </ActionLink>
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}

/**
 * Desktop navigation dock (≥1024px): the numbered section links with one indicator that
 * glides to the active section, hover/focus labels, and two always-available tools below —
 * Reading mode and email. When the visitor finishes exploring, a light passes once down
 * the dock (visual only).
 */
export function SectionRail({ active }: { active: SectionId }) {
  const { mode, setMode } = useViewMode();
  const reading = mode === "reading";
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === active),
  );
  const cue = useCompletionCue();
  return (
    <nav
      aria-label={nav.railLabel}
      className="fixed top-header bottom-0 left-0 z-40 hidden w-rail flex-col items-center justify-center gap-6 border-r border-line lg:flex"
    >
      <ol className="relative flex flex-col gap-1" style={{ "--active": index } as CSSProperties}>
        {/* the active-section indicator: one bar that glides between items */}
        <span
          aria-hidden
          className="dock-indicator absolute top-0 left-0 h-11 w-0.5 rounded-full"
        />
        {cue && <span aria-hidden className="dock-trace absolute top-0 left-0 h-11 w-0.5" />}
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="relative">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`peer relative flex h-11 w-12 items-center justify-center rounded-md font-meta transition-[color,background-color,transform] duration-150 active:scale-95 ${
                  isActive ? "text-accent" : "text-muted hover:bg-surface hover:text-text"
                }`}
              >
                <span aria-hidden>{s.num}</span>
                <span className="sr-only">{s.rail}</span>
              </a>
              <RailLabel>{s.rail}</RailLabel>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col items-center gap-1 border-t border-line pt-4">
        <ExploreTrigger variant="rail" />
        <div className="relative">
          <button
            type="button"
            aria-pressed={reading}
            aria-label={dockView.readingMode}
            onClick={() => setMode(reading ? "interactive" : "reading")}
            className={`peer grid h-11 w-12 place-items-center rounded-md transition-[color,background-color,transform] duration-150 active:scale-95 ${
              reading ? "bg-surface-2 text-accent" : "text-muted hover:bg-surface hover:text-text"
            }`}
          >
            <BookOpen aria-hidden className="h-4 w-4" />
          </button>
          <RailLabel>{reading ? dockView.toInteractive : dockView.toReading}</RailLabel>
        </div>
        <div className="relative">
          <a
            href={contact.email.href}
            className="peer grid h-11 w-12 place-items-center rounded-md text-muted transition-[color,background-color,transform] duration-150 hover:bg-surface hover:text-text active:scale-95"
          >
            <Mail aria-hidden className="h-4 w-4" />
            <span className="sr-only">
              {dockView.email} {contact.email.display}
            </span>
          </a>
          <RailLabel>
            {dockView.email} · {contact.email.display}
          </RailLabel>
        </div>
      </div>
    </nav>
  );
}

/** A rail item's name, shown on hover and on keyboard focus (never hover-only). */
function RailLabel({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-md border border-control bg-surface px-2.5 py-1 text-small whitespace-nowrap text-text opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

/**
 * Mobile navigation dock (<1024px), fixed to the bottom edge: where you are on the page
 * (a lit segment glides along seven, and the section name changes with it), and what must
 * always be one tap away — email and Reading mode — plus the exploration panel's trigger
 * (so it never floats over content). Section links and the command palette stay in the
 * header; nothing is hidden behind the dock.
 */
export function MobileDock({ active }: { active: SectionId }) {
  const { mode, setMode } = useViewMode();
  const reading = mode === "reading";
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === active),
  );
  const current = sections[index];
  const cue = useCompletionCue();
  const tool =
    "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md text-small font-medium transition-[color,background-color,transform] duration-150 active:scale-95";
  return (
    <nav
      aria-label={dockView.label}
      className="mobile-dock fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 border-t border-line bg-bg/92 backdrop-blur-md"
      />
      {/* where you are: seven segments, one lit segment glides to the active section */}
      <div
        aria-hidden
        className="relative mx-gutter h-0.5 bg-line"
        style={{ "--active": index } as CSSProperties}
      >
        <span className="dock-segment absolute top-0 left-0 h-full w-[calc(100%/7)]" />
        {cue && <span className="dock-sweep absolute inset-0" />}
      </div>
      <div className="flex h-14 items-center justify-between gap-2 px-gutter">
        <p className="min-w-0 truncate font-meta text-muted">
          <span className="sr-only">{dockView.current}: </span>
          <span key={current.id} className="dock-label inline-block">
            <span className="text-accent">{current.num}</span> {current.rail}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <a href={contact.email.href} className={`${tool} text-text hover:bg-surface-2`}>
            <Mail aria-hidden className="h-4 w-4" />
            <span className="sr-only">
              {dockView.email} {contact.email.display}
            </span>
          </a>
          <button
            type="button"
            aria-pressed={reading}
            onClick={() => setMode(reading ? "interactive" : "reading")}
            className={`${tool} border px-3 ${
              reading
                ? "border-accent bg-surface-2 text-text"
                : "border-control text-text hover:bg-surface-2"
            }`}
          >
            <BookOpen aria-hidden className="h-4 w-4" />
            {dockView.reading}
          </button>
          {/* exploration lives in the dock on phones (the header keeps the command palette) */}
          <ExploreTrigger variant="dock" />
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

/** Below lg: a disclosure button that opens a full-width section list. */
function MobileMenu({ active }: { active: SectionId }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    // keep keyboard and screen-reader focus inside the header + menu while open
    const page = document.getElementById("page-content");
    page?.setAttribute("inert", "");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 64rem)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      page?.removeAttribute("inert");
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-control px-3 text-small font-medium text-text lg:hidden"
      >
        {open ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
        {open ? nav.menuClose : nav.menuOpen}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-header z-50 overflow-y-auto overscroll-contain border-t border-line bg-bg lg:hidden"
      >
        <nav
          aria-label={nav.menuLabel}
          className="px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6"
        >
          <ol className="divide-y divide-line border-y border-line">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={s.id === active ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    // after the panel closes, move to the section and focus its heading
                    requestAnimationFrame(() => goToSection(s.id));
                  }}
                  className="flex items-baseline gap-4 py-4 text-lede font-medium text-text aria-[current=location]:text-accent"
                >
                  <Meta className="w-6 shrink-0">{s.num}</Meta>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col items-start gap-5">
            <div className="flex flex-col gap-2">
              <Meta>{viewModeControl.groupLabel}</Meta>
              <ViewModeToggle />
            </div>
            <MotionToggle />
            <ActionLink
              href={resumeDownload.href}
              download={resumeDownload.fileName}
              variant="secondary"
            >
              <Download aria-hidden className="h-4 w-4" />
              {resumeDownload.label}
            </ActionLink>
          </div>
        </nav>
      </div>
    </>
  );
}
