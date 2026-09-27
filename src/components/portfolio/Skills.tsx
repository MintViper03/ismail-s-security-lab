import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { Tabs } from "./Tabs";
import { DisclosureToggle, Meta, SectionShell } from "./primitives";
import { onlyCollapsed, whenCollapsed } from "@/lib/disclosure";
import { exploration } from "@/lib/exploration";
import { skills, type SkillGroup } from "@/content/resume";
import { skillTiers, skillsView as ui } from "@/content/site";

const total = skills.reduce((n, g) => n + g.items.length, 0);

/**
 * Capability map: every category and skill exactly as on the resume — no levels, ratings
 * or years. Desktop picks a category from a vertical tab list; mobile uses stacked
 * disclosures. "Show all skills" (and Reading mode, via CSS) lists everything grouped.
 */
export function Skills() {
  const id = useId();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(0);
  const allId = `${id}-all`;

  return (
    <SectionShell id="skills">
      <Reveal>
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

        {/* by category: tabs on desktop, disclosures on mobile */}
        <div className={onlyCollapsed(showAll)}>
          <div className="hidden lg:block">
            <Tabs
              vertical
              label={ui.mapLabel}
              tabs={skills.map((g) => ({
                key: g.id,
                label: (
                  <span className="flex w-full items-baseline justify-between gap-3 px-1.5">
                    {g.label}
                    <span className="font-meta text-muted">
                      {g.items.length}
                      <span className="sr-only"> {ui.skills}</span>
                    </span>
                  </span>
                ),
              }))}
              selected={selected}
              onSelect={(i) => {
                setSelected(i);
                exploration.mark("skills");
              }}
              listClassName="grid-cols-1"
              panelClassName="rounded-lg border border-line bg-surface p-8"
            >
              <h3 className="text-h3 font-semibold tracking-[-0.01em] text-text">
                {skills[selected].label}
              </h3>
              <Meta className="mt-1 block">
                {skills[selected].items.length} {ui.skills}
              </Meta>
              <Chips items={skills[selected].items} className="mt-6" large />
            </Tabs>
          </div>

          <div className="border-t border-line lg:hidden">
            {skills.map((g, i) => (
              <CategoryDisclosure key={g.id} group={g} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        {/* everything, grouped into the two tiers */}
        <div id={allId} className={whenCollapsed(showAll)}>
          <AllSkills />
        </div>
      </Reveal>
    </SectionShell>
  );
}

function Chips({
  items,
  className = "",
  large = false,
}: {
  items: readonly string[];
  className?: string;
  large?: boolean;
}) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          data-skill={item}
          className={`rounded-sm border border-line bg-surface-2 text-text ${
            large ? "px-3 py-1.5 text-body" : "px-2.5 py-1 text-small"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Accordion item: heading + button (aria-expanded) controlling the chip list. */
function CategoryDisclosure({ group, defaultOpen }: { group: SkillGroup; defaultOpen: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => {
            setOpen((o) => !o);
            exploration.mark("skills");
          }}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
        >
          <span className="text-body font-semibold text-text">{group.label}</span>
          <span className="flex items-center gap-3">
            <Meta>
              {group.items.length}
              <span className="sr-only"> {ui.skills}</span>
            </Meta>
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </h3>
      <div id={`${id}-panel`} className={open ? "pb-5" : "hidden"}>
        <Chips items={group.items} />
      </div>
    </div>
  );
}

function AllSkills() {
  return (
    <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
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
