import { Fragment, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { ScrambleHeading } from "./ScrambleHeading";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/lib/view-mode";
import { labels, section, type SectionId } from "@/content/site";
import type { Bullet } from "@/content/resume";

/* ---------- buttons ---------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "quiet";
type ButtonSize = "md" | "sm";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]";
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "btn-light btn-light-strong bg-accent text-accent-ink hover:bg-[#7eecff]",
  secondary: "btn-light border border-control text-text hover:border-muted hover:bg-surface-2",
  quiet:
    "min-h-11 text-text underline decoration-control decoration-1 underline-offset-[6px] hover:decoration-accent",
};
const buttonSizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-small",
  sm: "h-11 px-3.5 text-small",
};

function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${buttonBase} ${buttonVariants[variant]} ${variant === "quiet" ? "text-small" : buttonSizes[size]}`;
}

/**
 * The one link-button used across the page. Every button has a press state and a
 * directional light (pointer-following, centred on keyboard focus, at the point of a tap).
 * Primary buttons also get the magnetic drift — label only, at most 4px, mouse only, in
 * Interactive mode with motion on. External links open in a new tab and say so.
 */
export function ActionLink({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  download,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  download?: string;
  className?: string;
}) {
  const { motion } = useViewMode();
  const magnetic = motion && variant === "primary";
  return (
    <MagneticButton
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      strength={magnetic ? 0.25 : 0}
      className={cn(buttonClass(variant, size), className)}
    >
      {children}
      {external && <span className="sr-only"> {labels.opensInNewTab}</span>}
    </MagneticButton>
  );
}

/* ---------- text ------------------------------------------------------- */

export function Meta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-meta text-muted", className)}>{children}</span>;
}

// Stand-alone figures ("22", "2,895", "15+", "8%"), not digits inside words (base64, C2, 90th).
const FIGURE = /(?<![A-Za-z\d])(\d[\d,]*\+?%?)(?![A-Za-z\d])/g;

/** Resume text with its figures set in the primary text colour. Wording is untouched. */
export function FigureText({ text }: { text: string }) {
  const parts = text.split(FIGURE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-medium text-text tabular">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** A resume bullet: bold lead phrase (as printed) followed by the remainder. */
export function BulletText({ bullet }: { bullet: Bullet }) {
  if (!bullet.emphasis) return <FigureText text={bullet.text} />;
  return (
    <>
      <strong className="font-semibold text-text">{bullet.emphasis}</strong>
      <FigureText text={bullet.text.slice(bullet.emphasis.length)} />
    </>
  );
}

/* ---------- layout ----------------------------------------------------- */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-page px-gutter ${className}`}>{children}</div>;
}

/**
 * How a section enters (docs/visual-redesign-v2.md §11). Each motif is part of one
 * connected sequence down the page rather than the same fade on every section:
 * - timeline: an illuminated path draws down from the section edge into the role timeline
 * - stage: the path hands off to a horizontal plane; large type rises (projects)
 * - constellation: numeral and title wipe in ahead of the assembling skill map
 * - quiet: no header motion at all (credentials, education — less noise before contact)
 * - finale: the contact composition's large title rises with the section
 */
export type SectionMotif = "timeline" | "stage" | "constellation" | "quiet" | "finale";

const titleClass: Record<SectionMotif, string> = {
  timeline: "title-wipe max-w-4xl text-h1 font-semibold tracking-[-0.035em]",
  constellation: "title-wipe max-w-4xl text-h1 font-semibold tracking-[-0.035em]",
  stage: "title-rise max-w-5xl text-display font-semibold tracking-[-0.045em]",
  quiet: "max-w-3xl text-h2 font-semibold tracking-[-0.02em]",
  finale: "finale-rise max-w-5xl text-display font-semibold tracking-[-0.045em]",
};

/** Numbered section with a recruiter-readable h2. Content decides its own layout. */
export function SectionShell({
  id,
  children,
  className = "",
  motif = "quiet",
}: {
  id: SectionId;
  children: ReactNode;
  className?: string;
  motif?: SectionMotif;
}) {
  const { motion } = useViewMode();
  const s = section(id);
  const numbered = motif === "timeline" || motif === "stage" || motif === "constellation";
  return (
    <section
      id={s.id}
      aria-labelledby={`${s.id}-title`}
      className={`relative isolate overflow-x-clip border-t border-line py-section ${className}`}
    >
      <Container className="relative">
        {motif === "stage" && (
          // the experience path turns into a horizontal plane along the section's top edge
          <span
            aria-hidden
            className="rule-glow proj-handoff top-[calc(-1*var(--spacing-section)-1px)] right-gutter left-gutter"
          />
        )}
        <header
          className={cn(
            "relative flex flex-col gap-4",
            motif === "quiet" ? "mb-10 sm:mb-12" : "mb-12 sm:mb-16",
            motif === "timeline" && "pl-6 sm:pl-8",
          )}
        >
          {motif === "timeline" && (
            // lead-in: from the section's top edge down to the start of the role timeline
            <span
              aria-hidden
              className="exp-lead path-line top-[calc(-1*var(--spacing-section))] -bottom-12 left-0 sm:-bottom-16"
            >
              <span className="path-glow" />
            </span>
          )}
          {numbered && (
            <span
              aria-hidden
              className="index-numeral numeral-slide pointer-events-none absolute -top-[0.3em] -left-[0.04em] -z-10 text-[clamp(6rem,3rem+12vw,15rem)] leading-none font-bold tracking-[-0.06em] select-none"
            >
              {s.num}
            </span>
          )}
          <Meta>
            <span className="text-accent">{s.num}</span> / {s.rail}
          </Meta>
          <ScrambleHeading
            as="h2"
            id={`${s.id}-title`}
            text={s.title}
            animate={motion && numbered}
            className={cn(titleClass[motif], "text-text")}
          />
        </header>
        {children}
      </Container>
    </section>
  );
}

/* ---------- inline disclosure ------------------------------------------ */

/** Button half of an inline disclosure; content uses `whenCollapsed` from lib/disclosure. */
export function DisclosureToggle({
  expanded,
  controls,
  onToggle,
  label,
  expandedLabel,
  meta,
  className = "",
}: {
  expanded: boolean;
  /** Space-separated ids of the regions this button shows and hides. */
  controls: string;
  onToggle: () => void;
  label: string;
  /** Label while open; defaults to `label` (e.g. a "Project details" toggle keeps its name). */
  expandedLabel?: string;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md border border-control px-4 text-small font-medium text-text transition-[background-color,transform] duration-150 hover:bg-surface-2 active:scale-[0.97] reading:hidden",
        className,
      )}
    >
      {expanded ? (expandedLabel ?? label) : label}
      {!expanded && meta && <span className="font-meta text-muted">{meta}</span>}
      <ChevronDown
        aria-hidden
        className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );
}
