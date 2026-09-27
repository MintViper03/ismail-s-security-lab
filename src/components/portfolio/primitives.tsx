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
  primary: "btn-sweep bg-accent text-accent-ink hover:bg-[#7eecff]",
  secondary: "border border-control text-text hover:border-muted hover:bg-surface-2",
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
 * The one link-button used across the page. Primary/secondary buttons get the
 * magnetic drift in Interactive mode; external links open in a new tab and say so.
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
  const magnetic = motion && variant !== "quiet";
  return (
    <MagneticButton
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      strength={magnetic ? 0.2 : 0}
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

/** Numbered section with a recruiter-readable h2. Content decides its own layout. */
export function SectionShell({
  id,
  children,
  className = "",
}: {
  id: SectionId;
  children: ReactNode;
  className?: string;
}) {
  const { motion } = useViewMode();
  const s = section(id);
  return (
    <section
      id={s.id}
      aria-labelledby={`${s.id}-title`}
      className={`relative isolate overflow-x-clip border-t border-line py-section ${className}`}
    >
      <Container>
        {/* v2 chrome: an outlined index numeral slides in behind a title that wipes on */}
        <header className="relative mb-12 flex flex-col gap-4 sm:mb-16">
          <span
            aria-hidden
            className="index-numeral numeral-slide pointer-events-none absolute -top-[0.3em] -left-[0.04em] -z-10 select-none text-[clamp(6rem,3rem+12vw,15rem)] font-bold leading-none tracking-[-0.06em]"
          >
            {s.num}
          </span>
          <Meta>
            <span className="text-accent">{s.num}</span> / {s.rail}
          </Meta>
          <ScrambleHeading
            as="h2"
            id={`${s.id}-title`}
            text={s.title}
            animate={motion}
            className="title-wipe max-w-4xl text-h1 font-semibold tracking-[-0.035em] text-text"
          />
        </header>
        <div className="plane-rise">{children}</div>
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
        "inline-flex h-11 items-center gap-2 rounded-md border border-control px-4 text-small font-medium text-text transition-colors hover:bg-surface-2 reading:hidden",
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
