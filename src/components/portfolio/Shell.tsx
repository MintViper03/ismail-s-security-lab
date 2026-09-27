import { useEffect, useId, useRef, useState } from "react";
import { Command as CommandIcon, Download, Menu, X } from "lucide-react";
import { useViewMode, type ViewMode } from "@/lib/view-mode";
import {
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
            className="flex min-h-11 items-center gap-2.5 rounded-sm text-small font-semibold tracking-[-0.01em] text-text"
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
          <ViewModeToggle className="hidden sm:inline-flex" />
          <ActionLink
            href={resumeDownload.href}
            download={resumeDownload.fileName}
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
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

/** Desktop: a compact vertical rail of numbered links with hover/focus labels. */
export function SectionRail({ active }: { active: SectionId }) {
  return (
    <nav
      aria-label={nav.railLabel}
      className="fixed bottom-0 left-0 top-header z-40 hidden w-rail items-center justify-center border-r border-line lg:flex"
    >
      <ol className="flex flex-col gap-1">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="relative">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`peer relative flex h-11 w-12 items-center justify-center rounded-md font-meta transition-colors ${
                  isActive ? "text-accent" : "text-muted hover:bg-surface hover:text-text"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-colors ${
                    isActive ? "bg-accent" : "bg-transparent"
                  }`}
                />
                <span aria-hidden>{s.num}</span>
                <span className="sr-only">{s.rail}</span>
              </a>
              <span
                aria-hidden
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-control bg-surface px-2.5 py-1 text-small text-text opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
              >
                {s.rail}
              </span>
            </li>
          );
        })}
      </ol>
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
