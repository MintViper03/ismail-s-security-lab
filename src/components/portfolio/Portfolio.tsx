import { useCallback, useState } from "react";
import { useDwell } from "@/hooks/useDwell";
import { useScrollAnchor } from "@/hooks/useScrollAnchor";
import { exploration } from "@/lib/exploration";
import { ExplorePanel } from "./ExplorePanel";
import { CommandPalette } from "./CommandPalette";
import { ViewModeProvider } from "@/lib/ViewModeProvider";
import { useViewMode } from "@/lib/view-mode";
import { useActiveSection } from "@/hooks/useActiveSection";
import { dockView, nav } from "@/content/site";
import { MobileDock, SectionRail, SiteHeader } from "./Shell";
import { Overview } from "./Overview";
import { Experience } from "./Experience";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { ContactSection, Credentials, EducationSection, Footer } from "./Sections";

export function Portfolio() {
  return (
    <ViewModeProvider>
      <Page />
    </ViewModeProvider>
  );
}

function Page() {
  const { mode, ready, setMode } = useViewMode();
  // keep the reader's place across rotation / width changes
  useScrollAnchor();
  const active = useActiveSection();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);

  // exploration: sections count as read/viewed once they have actually been on screen
  useDwell("experience", 5000, () => exploration.mark("experience"));
  useDwell("credentials", 2000, () => exploration.mark("certifications"));
  // Reading mode shows every skill with nothing to click, so viewing counts there
  useDwell("skills", 2500, () => exploration.mark("skills"), ready && mode === "reading");

  return (
    <div className="min-h-screen bg-bg text-text">
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-3 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-accent focus-visible:px-4 focus-visible:py-2 focus-visible:text-small focus-visible:font-medium focus-visible:text-accent-ink"
      >
        {nav.skipLink}
      </a>
      {/* second skip control: Reading mode is a first-class way to read the page */}
      <button
        type="button"
        onClick={() => setMode(mode === "reading" ? "interactive" : "reading")}
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-16 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-surface-2 focus-visible:px-4 focus-visible:py-2 focus-visible:text-small focus-visible:font-medium focus-visible:text-text focus-visible:ring-1 focus-visible:ring-control"
      >
        {mode === "reading" ? dockView.toInteractive : dockView.toReading}
      </button>

      <SiteHeader active={active} onOpenPalette={openPalette} />
      <SectionRail active={active} />

      {/* bottom padding on phones: the fixed dock never covers the end of the page */}
      <div id="page-content" className="pb-[var(--dock-h)] lg:pb-0 lg:pl-rail">
        <main id="main" tabIndex={-1} className="outline-none">
          <Overview />
          <Experience />
          <Projects />
          <Skills />
          <Credentials />
          <EducationSection />
          <ContactSection />
        </main>
        <Footer />
      </div>

      <MobileDock active={active} />
      <ExplorePanel />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
