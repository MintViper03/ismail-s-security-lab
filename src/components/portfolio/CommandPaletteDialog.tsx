import { useRef, type ReactNode, type RefObject } from "react";
import {
  BookOpen,
  Compass,
  Download,
  FileText,
  Hash,
  Mail,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useViewMode } from "@/lib/view-mode";
import { exploration, restoreExplorePanel, useExploration } from "@/lib/exploration";
import { goToSection, openHref } from "@/lib/navigate";
import { contact } from "@/content/resume";
import { motionControl, paletteView as ui, resumeDownload, sections } from "@/content/site";

/**
 * Predictable matching for a short, fixed action list: every typed word must appear in
 * the item text; matches at the start of the text or of a word rank higher. (cmdk's
 * fuzzy default ranked "Technical Skills" above "Call" for the query "call".)
 */
function filterActions(value: string, search: string, keywords?: string[]) {
  const hay = `${value} ${keywords?.join(" ") ?? ""}`.toLowerCase();
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 1;
  let score = 0;
  for (const t of terms) {
    const i = hay.indexOf(t);
    if (i < 0) return 0;
    score += i === 0 ? 3 : /[\s(+-]/.test(hay[i - 1]) ? 2 : 1;
  }
  return score / (terms.length * 3);
}

/**
 * Command palette dialog (lazy chunk; see CommandPalette.tsx for the shortcut host), built on the Radix dialog (focus trap, Escape,
 * focus return) and cmdk (filtering, arrow keys, Enter). Everything here is also reachable
 * through ordinary links and buttons on the page.
 */
export function CommandPaletteDialog({
  open,
  onOpenChange,
  opener,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element focused when the palette was requested; focus returns there on close. */
  opener: RefObject<HTMLElement | null>;
}) {
  const { mode, setMode, reducedMotion, setReducedMotion } = useViewMode();
  const explore = useExploration();
  // action to run once the dialog has closed; `moveFocus` means it places focus itself
  const pending = useRef<{ fn: () => void; moveFocus: boolean } | null>(null);

  const run = (fn: () => void, moveFocus = false) => {
    pending.current = { fn, moveFocus };
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12vh] max-w-[calc(100vw-2rem)] translate-y-0 gap-0 overflow-hidden border-line bg-surface p-0 text-text sm:max-w-xl [&>button:last-child]:right-1 [&>button:last-child]:top-0.5 [&>button:last-child]:grid [&>button:last-child]:h-11 [&>button:last-child]:w-11 [&>button:last-child]:place-items-center [&>button:last-child]:opacity-100 [&>button:last-child]:text-muted"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const p = pending.current;
          pending.current = null;
          if (!p?.moveFocus) {
            const back = opener.current;
            const target =
              back && back !== document.body && document.contains(back)
                ? back
                : document.getElementById("command-palette-trigger");
            target?.focus({ preventScroll: true });
          }
          p?.fn();
        }}
      >
        <DialogTitle className="sr-only">{ui.title}</DialogTitle>
        <DialogDescription className="sr-only">{ui.description}</DialogDescription>
        <Command
          loop
          filter={filterActions}
          className="bg-surface text-text [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.8125rem] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-input-wrapper]]:border-line [&_[cmdk-item]]:min-h-11 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:text-small"
        >
          <CommandInput placeholder={ui.placeholder} className="h-12 pr-10 text-small" />
          <CommandList className="max-h-[min(60vh,28rem)] p-1">
            <CommandEmpty className="py-8 text-center text-small text-muted">
              {ui.empty}
            </CommandEmpty>

            <CommandGroup heading={ui.groups.navigate}>
              {sections.map((s) => (
                <Item
                  key={s.id}
                  value={`${s.num} ${s.title} ${s.rail}`}
                  icon={<Hash />}
                  meta={s.num}
                  onSelect={() => run(() => goToSection(s.id), true)}
                >
                  {s.title}
                </Item>
              ))}
            </CommandGroup>
            <CommandSeparator className="bg-line" />

            <CommandGroup heading={ui.groups.display}>
              <Item
                value={mode === "reading" ? ui.toInteractive : ui.toReading}
                icon={mode === "reading" ? <Sparkles /> : <BookOpen />}
                onSelect={() => run(() => setMode(mode === "reading" ? "interactive" : "reading"))}
              >
                {mode === "reading" ? ui.toInteractive : ui.toReading}
              </Item>
              <Item
                value={reducedMotion ? motionControl.paletteOn : motionControl.paletteOff}
                icon={reducedMotion ? <Play /> : <Pause />}
                onSelect={() => run(() => setReducedMotion(!reducedMotion))}
              >
                {reducedMotion ? motionControl.paletteOn : motionControl.paletteOff}
              </Item>
            </CommandGroup>

            <CommandGroup heading={ui.groups.resume}>
              <Item
                value={ui.openResume}
                icon={<FileText />}
                onSelect={() => run(() => openHref(resumeDownload.href, { newTab: true }))}
              >
                {ui.openResume}
              </Item>
              <Item
                value={ui.downloadResume}
                icon={<Download />}
                onSelect={() =>
                  run(() => openHref(resumeDownload.href, { download: resumeDownload.fileName }))
                }
              >
                {ui.downloadResume}
              </Item>
            </CommandGroup>

            <CommandGroup heading={ui.groups.contact}>
              <Item
                value={`${ui.email} ${contact.email.display}`}
                icon={<Mail />}
                meta={contact.email.display}
                onSelect={() => run(() => openHref(contact.email.href))}
              >
                {ui.email}
              </Item>
              <Item
                value={`${ui.call} ${contact.phone.display}`}
                icon={<Phone />}
                meta={contact.phone.display}
                onSelect={() => run(() => openHref(contact.phone.href))}
              >
                {ui.call}
              </Item>
              <Item
                value={ui.contactSection}
                icon={<Hash />}
                onSelect={() => run(() => goToSection("contact"), true)}
              >
                {ui.contactSection}
              </Item>
            </CommandGroup>

            <CommandGroup heading={ui.groups.explore}>
              {explore.dismissed && (
                <Item
                  value={ui.showExplore}
                  icon={<Compass />}
                  onSelect={() => run(restoreExplorePanel, true)}
                >
                  {ui.showExplore}
                </Item>
              )}
              <Item
                value={ui.resetExplore}
                icon={<RotateCcw />}
                onSelect={() => run(() => exploration.reset())}
              >
                {ui.resetExplore}
              </Item>
            </CommandGroup>
          </CommandList>
          {/* the keyboard model, always visible (not only in the sr-only description) */}
          <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-3 py-2.5 font-meta text-muted">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> {ui.hints.move}
            </span>
            <span>
              <Kbd>Enter</Kbd> {ui.hints.select}
            </span>
            <span>
              <Kbd>Esc</Kbd> {ui.hints.close}
            </span>
            <span>
              <Kbd>Ctrl K</Kbd> {ui.hints.or} <Kbd>/</Kbd> {ui.hints.open}
            </span>
          </p>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function Item({
  value,
  icon,
  meta,
  onSelect,
  children,
}: {
  value: string;
  icon: ReactNode;
  meta?: string;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect} className="gap-3 rounded-md">
      <span aria-hidden className="text-muted [[data-selected=true]_&]:text-accent-ink">
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {meta && (
        <span className="font-mono text-[0.8125rem] text-muted [[data-selected=true]_&]:text-accent-ink">
          {meta}
        </span>
      )}
    </CommandItem>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-[3px] border border-control px-1 text-text">{children}</kbd>;
}
