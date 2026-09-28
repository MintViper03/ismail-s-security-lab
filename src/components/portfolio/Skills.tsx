import { useId, useState } from "react";
import { SkillConstellation } from "./SkillConstellation";
import { Tabs } from "./Tabs";
import { DisclosureToggle, Meta, SectionShell } from "./primitives";
import { onlyCollapsed, whenCollapsed } from "@/lib/disclosure";
import { exploration } from "@/lib/exploration";
import { skills } from "@/content/resume";
import { skillTiers, skillsView as ui } from "@/content/site";

const total = skills.reduce((n, g) => n + g.items.length, 0);

/**
 * Capability map: every category and skill exactly as on the resume — no levels, ratings,
 * years or weighting (every point in the constellation is the same size).
 *
 * One control drives everything: WAI-ARIA tabs for the seven categories (arrow keys in
 * both directions, Home/End). On phones they are a two-column grid of large touch
 * targets above the list; from 1024px a column beside it. The selected category's
 * complete skill list is always shown in HTML, its cluster lights in the constellation,
 * and hovering a skill lights its point. Tapping a cluster selects that category too.
 * "Show all skills" (and Reading mode, via CSS) lists everything grouped.
 */
export function Skills() {
  const id = useId();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<string | undefined>();
  const allId = `${id}-all`;
  const group = skills[selected];

  const select = (i: number) => {
    setSelected(i);
    setShowAll(false);
    setHovered(undefined);
    exploration.mark("skills");
  };

  return (
    <SectionShell id="skills" motif="constellation">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-small text-muted">
          <span className="text-text">{skills.length}</span> {ui.categories} ·{" "}
          <span className="text-text">{total}</span> {ui.skills}
        </p>
        <DisclosureToggle
          expanded={showAll}
          controls={allId}
          onToggle={() => {
            setShowAll((v) => !v);
            exploration.mark("skills");
          }}
          label={ui.showAll}
          expandedLabel={ui.showByCategory}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <SkillConstellation
          active={showAll ? -1 : selected}
          onSelect={select}
          highlight={hovered}
          className="mx-auto w-full max-w-[34rem] lg:col-span-6 lg:max-w-none lg:self-start"
        />

        <div className="lg:col-span-6">
          {/* by category: one tab set — touch grid on phones, a column beside the list on desktop */}
          <div className={onlyCollapsed(showAll)}>
            {/* visibility and layout on separate elements: `lg:grid` would override "hidden" */}
            <div className="lg:grid lg:grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)] lg:gap-x-6 lg:[&>[role=tabpanel]]:col-start-2 lg:[&>[role=tabpanel]]:row-span-2 lg:[&>[role=tabpanel]]:row-start-1 lg:[&>[role=tabpanel]]:mt-0">
              <Tabs
                bothAxes
                label={ui.mapLabel}
                tabs={skills.map((g) => ({
                  key: g.id,
                  label: (
                    <span className="flex w-full items-baseline justify-between gap-2 text-left">
                      {g.label}
                      <span className="font-meta text-muted">
                        {g.items.length}
                        <span className="sr-only"> {ui.skills}</span>
                      </span>
                    </span>
                  ),
                }))}
                selected={selected}
                onSelect={select}
                listClassName="grid-cols-2 lg:mt-3 lg:grid-cols-1 [&>button]:min-h-12 [&>button]:px-3 [&>button]:py-2"
                panelClassName="rounded-lg border border-line bg-surface p-5 sm:p-6"
              >
                <h3 className="text-h3 font-semibold tracking-[-0.01em] text-text">
                  {group.label}
                </h3>
                <Meta className="mt-1 block">
                  {group.items.length} {ui.skills}
                </Meta>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      data-skill={item}
                      // mouse: hover lights the skill's point; touch/pen: a tap toggles it
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(item)}
                      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(undefined)}
                      onPointerDown={(e) =>
                        e.pointerType !== "mouse" &&
                        setHovered((h) => (h === item ? undefined : item))
                      }
                      className={`rounded-sm border px-2.5 py-1 text-small text-text transition-colors duration-150 ${
                        hovered === item ? "border-accent bg-surface-2" : "border-line bg-surface-2"
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Tabs>
            </div>
          </div>

          {/* everything, grouped into the two tiers */}
          <div id={allId} className={whenCollapsed(showAll)}>
            <AllSkills />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          data-skill={item}
          className="rounded-sm border border-line bg-surface-2 px-2.5 py-1 text-small text-text"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function AllSkills() {
  return (
    <div className="grid gap-14">
      {skillTiers.map((tier) => {
        const ids: readonly string[] = tier.groups;
        const groups = skills.filter((g) => ids.includes(g.id));
        return (
          <div key={tier.label}>
            <h3 className="mb-5 flex items-baseline gap-3 text-small font-semibold text-text">
              {tier.label}
              <Meta>{groups.length}</Meta>
            </h3>
            <dl className="border-t border-line">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="grid gap-3 border-b border-line py-6 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="flex items-baseline gap-2 text-small font-semibold text-text sm:flex-col sm:gap-1">
                    {g.label}
                    <Meta>{g.items.length}</Meta>
                  </dt>
                  <dd>
                    <Chips items={g.items} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
