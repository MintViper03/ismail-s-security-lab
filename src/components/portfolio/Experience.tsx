import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Tabs } from "./Tabs";
import { BulletText, DisclosureToggle, Meta, SectionShell } from "./primitives";
import { onlyCollapsed, whenCollapsed } from "@/lib/disclosure";
import { exploration } from "@/lib/exploration";
import { useViewMode } from "@/lib/view-mode";
import { experience, type Role } from "@/content/resume";
import { incidentScope } from "@/content/highlights";
import { sourceRange, sourceRef } from "@/content/sources";
import {
  additionalSitesBullets,
  deliveryBullets,
  experienceView as ui,
  incidentStages,
} from "@/content/site";

const anchorId = (role: Role) => role.id.replace(/^exp\./, "role-");
const orgLine = (role: Role) =>
  role.affiliation ? `${role.organization}, ${role.affiliation}` : role.organization;

export function Experience() {
  const active = useActiveRole();
  const reached = useRolesReached();
  const [featured, ...others] = experience;

  return (
    <SectionShell id="experience" motif="timeline">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <RoleTimeline active={active} reached={reached} />
        <div className="flex flex-col gap-14 lg:col-span-8">
          <FeaturedRole role={featured} />
          {others.map((role) => (
            <RoleArticle key={role.id} role={role} reached={reached} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ---------- navigation ------------------------------------------------- */

/**
 * Which roles' content has reached the reading line (60% down the viewport). Measured
 * from geometry on scroll and resize rather than from intersection changes, so a jump
 * past a role (nav link, deep link, back button) still counts it, and scrolling back up
 * returns it to pending. `null` until measured, and always `null` with motion off or in
 * Reading mode: then nothing is ever shown in a "pending" state.
 */
function useRolesReached() {
  const { motion } = useViewMode();
  const [reached, setReached] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    if (!motion) {
      setReached(null);
      return;
    }
    const ids = experience.map(anchorId);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.6;
      const next: Record<string, boolean> = {};
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) next[id] = el.getBoundingClientRect().top < line;
      }
      setReached((prev) => (prev && ids.every((id) => prev[id] === next[id]) ? prev : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [motion]);
  return reached;
}

/** `data-activation` for a role: only set once measured, so no JS means the active look. */
const activation = (reached: Record<string, boolean> | null, id: string) =>
  reached && id in reached ? (reached[id] ? "reached" : "pending") : undefined;

/** Which role article sits under the reading line. */
function useActiveRole() {
  const [active, setActive] = useState(anchorId(experience[0]));
  useEffect(() => {
    const els = experience
      .map((r) => document.getElementById(anchorId(r)))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/**
 * Compact timeline of every role, drawn on the illuminated path that runs down from the
 * section's top edge: the lit part follows reading progress through the section, and each
 * role's node lights once its content has reached the reading line. Plain in-page links:
 * native scrolling, and focus moves to the role heading so keyboard users continue there.
 */
function RoleTimeline({
  active,
  reached,
}: {
  active: string;
  reached: Record<string, boolean> | null;
}) {
  // let the browser's anchor scroll run, then hand focus to the role heading
  const focusHeading = (id: string) =>
    requestAnimationFrame(() =>
      document.getElementById(`${id}-title`)?.focus({ preventScroll: true }),
    );

  return (
    <nav
      aria-label={ui.timelineLabel}
      className="relative lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-span-4 lg:self-start"
    >
      {/* the path continues here from the header's lead-in; lit portion = reading progress */}
      <span aria-hidden className="exp-track path-line top-0 bottom-0 left-0">
        <span className="path-glow" />
      </span>
      <span className="block pl-4 font-meta text-muted">{ui.timelineLabel}</span>
      <ol className="mt-3">
        {experience.map((role, i) => {
          const id = anchorId(role);
          const current = active === id;
          const state = activation(reached, id);
          return (
            <li key={role.id} className="relative">
              {/* node on the path: lights when the role's content is reached */}
              <span
                aria-hidden
                className={`role-node absolute top-[1.35rem] -left-[4px] z-10 h-[9px] w-[9px] rounded-full border ${
                  state === "pending" ? "border-control bg-bg" : "border-accent bg-accent"
                } ${current ? "scale-125 shadow-[0_0_12px_2px_var(--accent)]" : ""}`}
              />
              <a
                href={`#${id}`}
                onClick={() => {
                  focusHeading(id);
                  exploration.mark("experience");
                }}
                aria-current={current ? "true" : undefined}
                className={`block rounded-r-md border-l-2 py-3 pr-2 pl-5 transition-colors duration-150 ${
                  current
                    ? "border-accent bg-surface"
                    : "border-transparent hover:border-control hover:bg-surface/60"
                }`}
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Meta>{role.dates}</Meta>
                  {i === 0 && <FeaturedTag />}
                </span>
                <span className="mt-1 block text-small font-semibold text-text">{role.title}</span>
                <span className="block text-small text-muted">{orgLine(role)}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function FeaturedTag() {
  return (
    <span className="rounded-sm border border-accent px-1.5 font-meta text-accent">
      {ui.featured}
    </span>
  );
}

/* ---------- role building blocks --------------------------------------- */

function RoleHeader({ role, featured = false }: { role: Role; featured?: boolean }) {
  const id = anchorId(role);
  return (
    <header>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Meta>{role.dates}</Meta>
        {featured && <FeaturedTag />}
      </span>
      <h3
        id={`${id}-title`}
        tabIndex={-1}
        className="mt-2 text-h3 font-semibold tracking-[-0.01em] text-text"
      >
        {role.title}
      </h3>
      <p className="mt-1 text-body text-text">{orgLine(role)}</p>
      <Meta className="mt-0.5 block">{role.location}</Meta>
    </header>
  );
}

/** Verbatim resume bullets, each with its source reference. */
function SourcedBullets({ role, ids }: { role: Role; ids: readonly string[] }) {
  return (
    <ul className="border-t border-line">
      {ids.map((bid) => {
        const b = role.bullets.find((x) => x.id === bid)!;
        return (
          <li key={bid} className="flex flex-col gap-1.5 border-b border-line py-4">
            <p data-bullet={bid} className="text-body text-muted">
              <BulletText bullet={b} />
            </p>
            <Meta>{sourceRef(bid)}</Meta>
          </li>
        );
      })}
    </ul>
  );
}

function BlockHeading({
  children,
  as: As = "h4",
  meta,
}: {
  children: ReactNode;
  as?: "h4" | "h5";
  meta?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
      <As className="text-small font-semibold text-text">{children}</As>
      {meta && <Meta>{meta}</Meta>}
    </div>
  );
}

/* ---------- featured: BrandsKey ---------------------------------------- */

function FeaturedRole({ role }: { role: Role }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [stage, setStage] = useState(0);
  const sequenceId = `${id}-sequence`;
  const deliveryId = `${id}-delivery`;

  return (
    <article
      id={anchorId(role)}
      aria-labelledby={`${anchorId(role)}-title`}
      className="featured-timeline"
    >
      {/* stronger entrance than the other roles: rises from depth, then a light sweeps its edge */}
      <div className="featured-in relative rounded-lg border border-line bg-surface p-5 shadow-[0_50px_120px_-50px_rgb(34_225_255/0.22)] sm:p-8">
        <span aria-hidden className="featured-sweep rule-glow top-0 right-6 left-6" />
        <RoleHeader role={role} featured />

        {/* scope legend: keeps the prolonged primary compromise apart from the extra sites */}
        <dl className="featured-scope mt-7 grid gap-5 border-y border-line py-5 sm:grid-cols-3 sm:gap-6">
          {incidentScope.map((s, i) => (
            <div key={s.key} className="flex flex-col gap-1" style={{ "--i": i } as CSSProperties}>
              <dt className="font-meta text-muted">{ui.scopeLabels[s.key]}</dt>
              <dd className="text-small text-text">{s.text}</dd>
              <dd className="font-meta text-muted">{sourceRef(s.source)}</dd>
            </div>
          ))}
        </dl>

        {/* primary compromise: optional stage-by-stage view, or the whole sequence */}
        <section className="mt-8" aria-labelledby={`${id}-primary`}>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
            <h4 id={`${id}-primary`} className="text-small font-semibold text-text">
              {ui.primaryHeading}
            </h4>
            <Meta>{sourceRange(incidentStages.flatMap((s) => s.bullets))}</Meta>
          </div>

          <div className={onlyCollapsed(expanded)}>
            <Tabs
              label={ui.sequenceLabel}
              tabs={incidentStages.map((s, i) => ({
                key: s.id,
                label: (
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="font-meta text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </span>
                ),
              }))}
              selected={stage}
              onSelect={(i) => {
                setStage(i);
                exploration.mark("experience");
              }}
              listClassName="grid-cols-2 sm:grid-cols-4"
            >
              <SourcedBullets role={role} ids={incidentStages[stage].bullets} />
              {stage < incidentStages.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setStage(stage + 1);
                    exploration.mark("experience");
                  }}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-small font-medium text-text underline decoration-control underline-offset-[6px] hover:decoration-accent"
                >
                  {ui.nextStage}: {incidentStages[stage + 1].label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              )}
            </Tabs>
          </div>

          <div id={sequenceId} className={whenCollapsed(expanded)}>
            <ol className="flex flex-col gap-6">
              {incidentStages.map((s, i) => (
                <li key={s.id}>
                  <BlockHeading as="h5" meta={String(i + 1).padStart(2, "0")}>
                    {s.label}
                  </BlockHeading>
                  <SourcedBullets role={role} ids={s.bullets} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-10" aria-labelledby={`${id}-additional`}>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
            <h4 id={`${id}-additional`} className="text-small font-semibold text-text">
              {ui.additionalHeading}
            </h4>
          </div>
          <SourcedBullets role={role} ids={additionalSitesBullets} />
        </section>

        <section
          id={deliveryId}
          aria-labelledby={`${id}-delivery-title`}
          className={`mt-10 ${whenCollapsed(expanded)}`}
        >
          <div className="mb-3">
            <h4 id={`${id}-delivery-title`} className="text-small font-semibold text-text">
              {ui.deliveryHeading}
            </h4>
          </div>
          <SourcedBullets role={role} ids={deliveryBullets} />
        </section>

        <DisclosureToggle
          expanded={expanded}
          controls={`${sequenceId} ${deliveryId}`}
          onToggle={() => {
            setExpanded((x) => !x);
            exploration.mark("experience");
          }}
          label={ui.showFull}
          expandedLabel={ui.showLess}
          meta={`${role.bullets.length} bullets`}
          className="mt-6"
        />
      </div>
    </article>
  );
}

/* ---------- other roles ------------------------------------------------ */

function RoleArticle({ role, reached }: { role: Role; reached: Record<string, boolean> | null }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const ids = role.bullets.map((b) => b.id);
  const lengthy = ids.length > ui.previewLimit;
  const restId = `${id}-rest`;

  return (
    <article
      id={anchorId(role)}
      aria-labelledby={`${anchorId(role)}-title`}
      data-activation={activation(reached, anchorId(role))}
    >
      <div className="relative border-t border-line pt-8">
        {/* activates as the role's own content reaches the reading line (and reverses) */}
        <span aria-hidden className="role-rule rule-glow -top-px right-0 left-0" />
        <div className="role-head">
          <RoleHeader role={role} />
        </div>
        <div className="mt-5">
          <SourcedBullets role={role} ids={lengthy ? ids.slice(0, ui.previewLimit) : ids} />
          {lengthy && (
            <>
              <div id={restId} className={whenCollapsed(expanded)}>
                <SourcedBullets role={role} ids={ids.slice(ui.previewLimit)} />
              </div>
              <DisclosureToggle
                expanded={expanded}
                controls={restId}
                onToggle={() => {
                  setExpanded((x) => !x);
                  exploration.mark("experience");
                }}
                label={ui.showFull}
                expandedLabel={ui.showLess}
                meta={`${ids.length} bullets`}
                className="mt-6"
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
