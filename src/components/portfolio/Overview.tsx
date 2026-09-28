import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, Download, Pause, Play } from "lucide-react";
import { Reveal } from "./Reveal";
import { ActionLink, Container, Meta } from "./primitives";
import { Sculpture } from "./hero/Sculpture";
import { Tabs } from "./Tabs";
import { useViewMode } from "@/lib/view-mode";
import { cn } from "@/lib/utils";
import { useStageParallax } from "@/hooks/useStageParallax";
import { displayName, identity, skills, summary, type SkillGroup } from "@/content/resume";
import { highlights } from "@/content/highlights";
import { cta, heroScene, labels, resumeDownload, section } from "@/content/site";

export function Overview() {
  const s = section("overview");

  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} className="pb-section">
      <Stage />
      <Container>
        <ProfessionalSummary />
      </Container>
    </section>
  );
}

/* ---------- the stage: light, portrait, 3D sculpture, name, HUD -------- */

const focusGroups = heroScene.focusGroups.map((id) => skills.find((g) => g.id === id)!);

/**
 * Opening viewport, built around the photograph (docs/visual-redesign-v2.md §3).
 *
 * Desktop (≥1024px): the portrait column is min(0.9 × stage height, 56–62% of the grid),
 * so the photo spans the full stage height beside the name. Back to front: stage light →
 * offset planes and light spills → the photograph → foreground drafting accents → the 3D
 * sculpture, in the largest free slot beside the portrait (hero/Sculpture.tsx; it can pass
 * behind the photo but never over the face, name or actions) → the controls (name,
 * actions, skill-focus HUD, pause), which are never inside a transformed parallax layer.
 * Tablet (768–1023px): two columns, HUD below. Mobile: portrait first, name overlapping
 * its faded lower edge, then role, actions and availability.
 */
function Stage() {
  // `motion` is false in Reading mode and whenever motion is switched off (header control
  // or OS setting): no parallax, and the sculpture shows its static poster
  const { motion, mode, ready } = useViewMode();
  const reading = ready && mode === "reading";
  const [focus, setFocus] = useState(0);
  const [paused, setPaused] = useState(false);
  const [live, setLive] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  useStageParallax(stageRef, motion);

  return (
    <div ref={stageRef} data-stage className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="stage-exit-light absolute inset-x-0 top-0 -z-10 h-[calc(var(--spacing-header)+2.5rem+min(100vw,max(14rem,100svh-27rem)))] max-h-full [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] split:inset-y-0 split:h-auto split:max-h-none split:[mask-image:linear-gradient(to_bottom,#000_82%,transparent)]"
      >
        <div className="stage-light absolute inset-0" />
      </div>

      <Sculpture
        focus={reading ? -1 : focus}
        paused={paused}
        enabled={motion}
        onLiveChange={setLive}
      />

      <div className="mx-auto grid w-full max-w-[140rem] grid-cols-1 px-gutter pt-[calc(var(--spacing-header)+1rem)] split:min-h-[100svh] split:grid-cols-2 split:gap-x-8 split:pt-header wide:grid-cols-[minmax(0,1fr)_min(calc((100svh-var(--spacing-header)-1.5rem)*0.9),56%)] wide:gap-x-12 wide:pt-[calc(var(--spacing-header)+1.5rem)] wider:grid-cols-[minmax(0,1fr)_min(calc((100svh-var(--spacing-header)-1.5rem)*0.9),62%)]">
        <StageCopy />
        <Portrait />
        {/* skill-focus HUD (the sculpture's three controls): below the name and photo up to
            1279px; from 1280px a foreground card over the photo's lower-right corner, below
            the face, leaving the space beside the portrait to the sculpture */}
        <div
          data-sculpture-avoid="box"
          className="relative z-20 mt-10 reading:hidden split:col-start-1 split:row-start-2 split:mt-2 split:mb-10 split:max-w-xl wider:col-span-1 wider:col-start-2 wider:row-start-1 wider:mt-0 wider:mr-6 wider:mb-[clamp(1rem,3svh,3rem)] wider:w-[min(calc(100%-3rem),28rem)] wider:max-w-none wider:self-end wider:justify-self-end"
        >
          <FocusHud focus={focus} setFocus={setFocus} />
        </div>
        {/* scene caption + pause, in flow so it never covers the photo, the HUD or the name:
            beside the HUD below 1280px, at the foot of the name column from 1280px. The
            button's slot is always reserved, so it appearing later shifts nothing */}
        <div
          data-sculpture-avoid="box"
          className="relative z-20 mt-3 flex items-center justify-self-end rounded-md bg-bg/75 pr-11 pl-3 backdrop-blur-md reading:hidden split:col-start-2 split:row-start-2 split:mt-2 split:self-start wider:col-start-1 wider:row-start-1 wider:mt-0 wider:mb-[clamp(1rem,3svh,3rem)] wider:self-end wider:justify-self-start"
        >
          <Meta className="py-2.5 pr-3">
            <span className="hidden text-text sm:inline">{heroScene.caption} · </span>
            {heroScene.note}
          </Meta>
          {live && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? heroScene.play : heroScene.pause}
              className="absolute inset-y-0 right-0 inline-flex h-11 w-11 items-center justify-center rounded-md border border-control text-text transition-[background-color,transform] hover:bg-surface-2 active:scale-[0.94]"
            >
              {paused ? (
                <Play aria-hidden className="h-4 w-4" />
              ) : (
                <Pause aria-hidden className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StageCopy() {
  const s = section("overview");
  const [first, last] = displayName.split(" ");
  return (
    // a size container: the name scales with the column it has, never overflowing it
    <div className="stage-exit-copy @container relative z-20 flex flex-col split:col-start-1 split:row-start-1 split:self-center split:py-12 wide:py-16 short:py-5">
      <Reveal className="order-5 mt-8 split:order-none split:mt-0">
        <div data-sculpture-avoid="text">
          <Meta>
            <span className="text-accent">{s.num}</span> / {s.rail} · {identity.location}
          </Meta>
        </div>
      </Reveal>

      <Reveal delay={60} className="order-1 split:order-none">
        {/* text content stays exactly the resume name; the two lines are visual only */}
        <h1
          id={`${s.id}-title`}
          data-sculpture-avoid="text"
          className="-mt-[0.5em] mb-6 text-[min(5.75rem,19.5cqi)] split:text-[min(10.5rem,19.5cqi)] leading-[0.86] font-bold tracking-[-0.055em] text-text split:mt-5 split:mb-0 short:mt-3"
        >
          <span className="block">{first}</span>{" "}
          <span className="block text-transparent [-webkit-text-stroke:1.5px_var(--color-text)] wide:[-webkit-text-stroke-width:2px] reading:text-text">
            {last}
          </span>
        </h1>
      </Reveal>

      <Reveal delay={120} className="order-3 split:order-none">
        {/* text content is exactly "Penetration Tester | Security Engineer | Red Teamer" */}
        <p
          data-sculpture-avoid="text"
          className="mt-5 max-w-[34rem] text-lede font-medium text-text split:mt-8 short:mt-4"
        >
          {identity.headline.map((role, i) => {
            const end = i === identity.headline.length - 1;
            return (
              <Fragment key={role}>
                {/* a role and its trailing separator never split; lines break after "|" */}
                <span className="whitespace-nowrap">
                  {role}
                  {!end && <span className="text-accent"> |</span>}
                </span>
                {!end && " "}
              </Fragment>
            );
          })}
        </p>
      </Reveal>

      <Reveal delay={170} className="order-4 split:order-none">
        {/* stacked: the primary action full width, the two others sharing a row (they wrap
            only if they must); a single row from 640px */}
        <div
          data-sculpture-avoid="children"
          className="mt-7 flex flex-wrap items-center gap-3 split:mt-10 short:mt-5"
        >
          <ActionLink href={cta.experience.href} className="w-full sm:w-auto">
            {cta.experience.label}
            <ArrowDown aria-hidden className="h-4 w-4" />
          </ActionLink>
          <ActionLink
            href={resumeDownload.href}
            download={resumeDownload.fileName}
            variant="secondary"
            className="flex-auto bg-bg/60 px-3.5 backdrop-blur-sm sm:flex-none sm:px-5"
          >
            <Download aria-hidden className="h-4 w-4" />
            {resumeDownload.label}
          </ActionLink>
          <ActionLink
            href={cta.contact.href}
            variant="secondary"
            className="flex-auto bg-bg/60 px-3.5 backdrop-blur-sm sm:flex-none sm:px-5"
          >
            {cta.contact.label}
          </ActionLink>
        </div>
      </Reveal>

      <Reveal delay={220} className="order-6 split:order-none">
        <div
          data-sculpture-avoid="text"
          className="mt-8 max-w-[34rem] border-l-2 border-accent pl-5 split:mt-10"
        >
          <Meta>{labels.availability}</Meta>
          <p className="mt-1 text-small text-text">{summary.availability.text}</p>
        </div>
      </Reveal>

      {/* Reading mode: every focus group in normal flow instead of the HUD tabs */}
      <div
        data-sculpture-avoid="box"
        className="order-7 mt-10 hidden reading:block split:order-none"
      >
        <h2 className="font-meta text-muted">{heroScene.focusLabel}</h2>
        <div className="mt-4">
          <AllFocusGroups />
        </div>
      </div>
    </div>
  );
}

/**
 * A decorative plane that moves `depth` px per unit of pointer travel (`.depth`) and, as
 * the hero scrolls out, separates from the photograph by `sep` (the geometry comes apart
 * while the portrait itself only recedes, staying fully readable).
 * `plane` records whether it sits behind or in front of the photograph.
 */
function DepthLayer({
  depth,
  plane,
  sep,
  className,
  children,
}: {
  depth: number;
  plane: "back" | "front";
  /** How far (px) this plane drifts away as the hero scrolls out (`.geo-sep`). */
  sep: readonly [number, number];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden
      data-plane={plane}
      className={cn(
        "depth geo-sep pointer-events-none absolute",
        plane === "back" ? "z-0" : "z-20",
        className,
      )}
      style={
        { "--depth": depth, "--sep-x": `${sep[0]}px`, "--sep-y": `${sep[1]}px` } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * The photograph, uncut and in natural colour. Source: the repository's original
 * `public/photo.jpg` (git HEAD, 1200×1798), cropped 9:10 at full width to end above its
 * "AI-generated content" mark → public/hero-portrait-{640,960,1200}.webp + 960.jpg.
 * Nothing is drawn over the face: light and planes sit behind or beside it, the grade only
 * touches the lower and left background, and accents stay at the edges.
 */
function Portrait() {
  return (
    <figure className="stage-exit-portrait relative isolate order-first mb-2 split:order-none split:col-start-2 split:row-start-1 split:mb-0 split:w-[min(100%,calc(min(86svh,58rem)*0.9))] split:self-center split:justify-self-end wide:w-full wide:self-end split:reading:self-start">
      {/* behind: ultraviolet backlight, a graphite plane offset down-left, a drafting outline up-right */}
      <DepthLayer
        depth={14}
        sep={[-44, -36]}
        plane="back"
        className="portrait-spill-uv -top-[8%] -left-[18%] h-[70%] w-[80%]"
      />
      <DepthLayer
        depth={28}
        sep={[-56, 40]}
        plane="back"
        className="top-[9%] -left-[4%] right-[10%] -bottom-[3%] bg-[linear-gradient(135deg,var(--surface-2),var(--surface)_60%)] ring-1 ring-line split:-left-[7%]"
      />
      <DepthLayer
        depth={20}
        sep={[48, -40]}
        plane="back"
        className="top-[4%] left-[12%] -right-[3%] bottom-[16%] border border-control/60 split:-right-[5%]"
      />
      <DepthLayer
        depth={10}
        sep={[40, 0]}
        plane="back"
        className="portrait-spill-key top-[12%] -right-[6%] h-[58%] w-[14%]"
      />

      {/* the photograph */}
      <div className="depth relative z-10" style={{ "--depth": 4 } as CSSProperties}>
        <div
          data-stage-anchor
          className="portrait-chamfer relative aspect-square max-h-[max(14rem,calc(100svh-27rem))] w-full overflow-hidden bg-surface split:aspect-[9/10] split:max-h-none"
        >
          <picture>
            <source
              type="image/webp"
              srcSet="/hero-portrait-640.webp 640w, /hero-portrait-960.webp 960w, /hero-portrait-1200.webp 1200w"
              sizes="(min-width: 64rem) min(calc((100vh - 5.5rem) * 0.9), 58vw), (min-width: 48rem) and (orientation: landscape) 46vw, 100vw"
            />
            <img
              src="/hero-portrait-960.jpg"
              alt={`Portrait of ${displayName}`}
              data-face="0.325 0.195 0.57 0.5"
              data-subject="0.27 0.56 0.68 1"
              width={960}
              height={1066}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[45%_50%]"
            />
          </picture>
          <div
            aria-hidden
            data-overlay
            className="portrait-grade pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            data-overlay
            className="pointer-events-none absolute inset-0 ring-1 ring-white/[0.07] ring-inset"
          />
          <div
            aria-hidden
            data-overlay
            className="portrait-edge-key pointer-events-none absolute inset-y-0 right-0 w-px"
          />
        </div>
      </div>

      {/* in front: drafting accents at the edges only (corner bracket, scale, a lit shard) */}
      <DepthLayer
        depth={-10}
        sep={[-32, -32]}
        plane="front"
        className="-top-3 -left-3 h-12 w-12 border-t-2 border-l-2 border-accent split:-top-4 split:-left-4 split:h-16 split:w-16"
      />
      <DepthLayer
        depth={-12}
        sep={[36, -16]}
        plane="front"
        className="portrait-scale top-[14%] -right-5 h-[42%] w-3"
      />
      <DepthLayer
        depth={-24}
        sep={[-52, 48]}
        plane="front"
        className="top-[64%] -left-[7%] aspect-square w-[22%] rotate-45 border border-accent/50 bg-accent/[0.04] split:-left-[10%]"
      />
    </figure>
  );
}

/** Foreground glass card: the skill-focus tabs that steer the scene. */
function FocusHud({ focus, setFocus }: { focus: number; setFocus: (i: number) => void }) {
  return (
    <div className="rounded-lg bg-surface/85 p-4 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.85)] ring-1 ring-white/[0.06] backdrop-blur-xl">
      <FocusTabs focus={focus} setFocus={setFocus} />
    </div>
  );
}

function SkillChips({ items, compact = false }: { items: readonly string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "rounded-sm bg-surface-2 px-2.5 py-1 text-small text-text",
            compact && "px-2 py-0.5 text-[0.8125rem]",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function FocusTabs({ focus, setFocus }: { focus: number; setFocus: (i: number) => void }) {
  return (
    <Tabs
      label={heroScene.focusLabel}
      tabs={focusGroups.map((g) => ({ key: g.id, label: g.label }))}
      selected={focus}
      onSelect={setFocus}
      listClassName="grid-cols-1 min-[360px]:grid-cols-3 [&>button]:px-1 [&>button]:text-[0.8125rem] sm:[&>button]:px-2 sm:[&>button]:text-small wide:[&>button]:px-1 wide:[&>button]:text-[0.8125rem]"
      panelClassName="min-h-[3.75rem]"
    >
      <SkillChips compact items={focusGroups[focus].items} />
    </Tabs>
  );
}

/** Reading mode: every focus group in normal flow, no tabs. */
function AllFocusGroups() {
  return (
    <dl className="flex flex-col gap-5">
      {focusGroups.map((g: SkillGroup) => (
        <div key={g.id}>
          <dt className="mb-2 text-small font-semibold text-text">{g.label}</dt>
          <dd>
            <SkillChips items={g.items} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- below the hero: full summary + figures -------------------- */

function ProfessionalSummary() {
  const [first, ...rest] = summary.sentences;
  return (
    <div className="summary-seq relative mt-14 grid gap-10 border-t border-line pt-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
      {/* the identity hands off here: a light draws along the rule, then the summary rises */}
      <span aria-hidden className="summary-rule rule-glow -top-px left-0 w-2/5" />
      <div className="summary-rise lg:col-span-7">
        <h2 className="font-meta text-muted">{labels.summaryHeading}</h2>
        <p className="mt-4 max-w-[64ch] text-lede text-muted">
          <span className="text-text">{first.text}</span>{" "}
          {rest.map((sentence) => sentence.text).join(" ")}
        </p>
      </div>
      <div className="summary-rise lg:col-span-5" style={{ "--i": 1 } as CSSProperties}>
        <h3 className="font-meta text-muted">{labels.figuresHeading}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6">
          {highlights.map((h) => (
            <div key={h.source} className="flex flex-col gap-1">
              <dt className="order-2 text-small text-muted">
                {h.caption}
                {h.context && <span className="mt-0.5 block font-meta">{h.context}</span>}
              </dt>
              <dd className="order-1 text-h2 font-semibold tracking-[-0.02em] text-text tabular">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
