/**
 * Inline disclosure classes. Collapsible content stays server-rendered and is hidden
 * with a class until expanded; in Reading mode the `reading:` variant shows it (and
 * `DisclosureToggle` hides itself) before first paint, so nothing shifts.
 */
export const whenCollapsed = (expanded: boolean) => (expanded ? "" : "hidden reading:block");

/** For content that is only shown while collapsed (e.g. a stage-by-stage preview). */
export const onlyCollapsed = (expanded: boolean) => (expanded ? "hidden" : "reading:hidden");
