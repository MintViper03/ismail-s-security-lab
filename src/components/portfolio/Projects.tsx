import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { Reveal } from "./Reveal";
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

export function Projects() {
  return (
    <SectionShell id="projects">
      <div className="flex flex-col gap-10">
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
  const { mode, ready } = useViewMode();
  const Diagram = diagrams[p.id];

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

  return (
    <article ref={articleRef} aria-labelledby={titleId}>
      <Reveal className="grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-12">
        {/* identity + details */}
        <div className={`flex flex-col gap-6 p-6 sm:p-9 lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          <Meta>
            {labels.project} {String(index + 1).padStart(2, "0")} · {p.year}
          </Meta>

          {/* text content is the resume's full project name, e.g. "AigisAI: A Zero-Trust …" */}
          <h3 id={titleId} className="text-text">
            <span className="block text-feature font-semibold tracking-[-0.03em]">
              {p.name}
              <span className="text-muted">:</span>
            </span>{" "}
            <span className="mt-3 block text-lede font-medium">{p.subtitle}</span>
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

        {/* conceptual diagram */}
        <figure
          ref={figureRef}
          className={`flex flex-col border-t border-line bg-bg/50 lg:col-span-7 lg:border-t-0 ${
            flip ? "lg:order-1 lg:border-r" : "lg:border-l"
          }`}
        >
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
            <Meta className="text-text">{ui.illustration}</Meta>
            <Meta>{ui.illustrationNote}</Meta>
          </figcaption>
          <div className="grid-field flex flex-1 items-center p-4 sm:p-8">
            <div className="w-full">{Diagram && <Diagram />}</div>
          </div>
        </figure>
      </Reveal>
    </article>
  );
}
