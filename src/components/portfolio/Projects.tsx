import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { ExternalLink, Github } from "lucide-react";
import { ActionLink, BulletText, DisclosureToggle, Meta, SectionShell } from "./primitives";
import { AigisDiagram, SentinelDiagram } from "./projects/ProjectDiagrams";
import { whenCollapsed } from "@/lib/disclosure";
import { OPEN_PROJECTS_EVENT, exploration } from "@/lib/exploration";
import { useViewMode } from "@/lib/view-mode";
import { useDwell } from "@/hooks/useDwell";
import { projects, type Project } from "@/content/resume";
import { labels, projectsView as ui } from "@/content/site";
import { projectLinks } from "@/content/links";

const diagrams: Record<string, ComponentType> = {
  "proj.aigisai": AigisDiagram,
  "proj.sentineltrace": SentinelDiagram,
};

/**
 * Two large project presentations. The spatial change after the experience timeline:
 * big type and each diagram on a layered CSS 3D plane (back plate, card, front frame)
 * that swings in and separates in depth as it enters, while the copy rises at its own rate.
 */
export function Projects() {
  return (
    <SectionShell id="projects" motif="stage">
      <div className="flex flex-col gap-24 lg:gap-36">
        {projects.map((p, i) => (
          <ProjectFeature key={p.id} project={p} index={i} />
        ))}
      </div>
    </SectionShell>
  );
}

function ProjectFeature({ project: p, index }: { project: Project; index: number }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);

  // diagram flow dashes animate only while the diagram is on screen (attribute, no re-render)
  useEffect(() => {
    const fig = figureRef.current;
    if (!fig) return;
    const io = new IntersectionObserver(([e]) =>
      fig.toggleAttribute("data-inview", e.isIntersecting),
    );
    io.observe(fig);
    return () => io.disconnect();
  }, []);
  const { mode, ready, motion } = useViewMode();
  const Diagram = diagrams[p.id];

  // depth response: the plane tilts a few degrees toward a mouse cursor (fine pointers,
  // motion on); keyboard focus inside the project lifts it instead (styles.css .proj-tilt)
  useEffect(() => {
    const fig = figureRef.current;
    if (!fig || !motion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = fig.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      fig.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
      fig.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
    };
    const onLeave = () => {
      fig.style.removeProperty("--tilt-x");
      fig.style.removeProperty("--tilt-y");
    };
    fig.addEventListener("pointermove", onMove);
    fig.addEventListener("pointerleave", onLeave);
    return () => {
      fig.removeEventListener("pointermove", onMove);
      fig.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [motion]);

  // opening the details is the interaction the exploration panel counts
  useEffect(() => {
    if (open) exploration.markProject(p.id);
  }, [open, p.id]);
  // the panel's "Open both projects" action
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PROJECTS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PROJECTS_EVENT, onOpen);
  }, []);
  // Reading mode shows the details with nothing to click: count them once actually on screen
  useDwell(
    () => articleRef.current,
    2500,
    () => exploration.markProject(p.id),
    ready && mode === "reading",
  );
  const flip = index % 2 === 1;
  const detailsId = `${id}-details`;
  const titleId = `${id}-title`;

  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={articleRef}
      aria-labelledby={titleId}
      className={`proj-article relative grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14 ${flip ? "proj-flip" : ""}`}
    >
      <span
        aria-hidden
        className={`index-numeral pointer-events-none absolute -top-[0.42em] -z-10 text-[clamp(7rem,3rem+14vw,18rem)] leading-none font-bold tracking-[-0.06em] select-none ${
          flip ? "right-0" : "left-0"
        }`}
      >
        {num}
      </span>

      {/* identity + details */}
      <div className={`proj-copy flex flex-col gap-6 lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <Meta>
          {labels.project} {num} · {p.year}
        </Meta>

        {/* text content is the resume's full project name, e.g. "AigisAI: A Zero-Trust …" */}
        <h3 id={titleId} className="text-text">
          <span className="block text-h1 font-semibold tracking-[-0.04em]">
            {p.name}
            <span className="text-muted">:</span>
          </span>{" "}
          <span className="mt-4 block text-lede font-medium text-muted">{p.subtitle}</span>
        </h3>

        <div>
          <Meta>{ui.technology}</Meta>
          <ul className="mt-2 flex flex-wrap gap-2">
            {p.stack.map((t) => (
              <li
                key={t}
                className="rounded-sm border border-control px-2.5 py-1 text-small text-text"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* supplied by Ismail, verified (see content/links.ts); always visible, never behind hover */}
        {projectLinks[p.id]?.length ? (
          <div>
            <Meta>{ui.links}</Meta>
            <div className="mt-2 flex flex-wrap gap-2">
              {projectLinks[p.id].map((l) => (
                <ActionLink key={l.href} href={l.href} external variant="secondary" size="sm">
                  {l.kind === "demo" ? (
                    <ExternalLink aria-hidden className="h-4 w-4" />
                  ) : (
                    <Github aria-hidden className="h-4 w-4" />
                  )}
                  <span className="sr-only">{p.name} </span>
                  {l.kind === "demo" ? ui.demo : ui.source}
                </ActionLink>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <DisclosureToggle
            expanded={open}
            controls={detailsId}
            onToggle={() => setOpen((o) => !o)}
            label={ui.details}
          />
          <div
            id={detailsId}
            role="region"
            aria-label={`${p.name} ${ui.details}`}
            className={whenCollapsed(open)}
          >
            <ul className="mt-5 flex flex-col gap-4 border-t border-line pt-5 reading:mt-0">
              {p.bullets.map((b) => (
                <li key={b.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-accent"
                  />
                  <p data-bullet={b.id} className="text-body text-muted">
                    <BulletText bullet={b} />
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 border-t border-line pt-4 text-small">
              <dt className="font-meta text-muted">{ui.technology}</dt>
              <dd className="text-text" data-stack>
                {p.stack.join(", ")}
              </dd>
              <dt className="font-meta text-muted">{ui.year}</dt>
              <dd className="text-text">{p.year}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* conceptual diagram, presented on a layered 3D plane */}
      <figure
        ref={figureRef}
        className={`proj-visual relative lg:col-span-7 ${flip ? "lg:order-1" : ""}`}
      >
        <div className="proj-tilt">
          <div className="proj-rig relative">
            <div
              aria-hidden
              className="proj-plate absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-line"
            />
            <div className="relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_60px_120px_-60px_rgb(0_0_0/0.9)]">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
                <Meta className="text-text">{ui.illustration}</Meta>
                <Meta>{ui.illustrationNote}</Meta>
              </figcaption>
              <div className="grid-field flex flex-1 items-center p-4 sm:p-8">
                <div className="w-full">{Diagram && <Diagram />}</div>
              </div>
            </div>
            <div
              aria-hidden
              className="proj-frame pointer-events-none absolute -inset-3 rounded-xl border border-accent/35"
            />
          </div>
        </div>
      </figure>
    </article>
  );
}
