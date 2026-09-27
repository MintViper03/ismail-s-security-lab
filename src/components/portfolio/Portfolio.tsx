import { useCallback, useState } from "react";
import { useLenis } from "@/hooks/useLenis";
import { useDwell } from "@/hooks/useDwell";
import { exploration } from "@/lib/exploration";
import { ExplorePanel } from "./ExplorePanel";
import { CommandPalette } from "./CommandPalette";
import { ViewModeProvider } from "@/lib/ViewModeProvider";
import { useViewMode } from "@/lib/view-mode";
import { useActiveSection } from "@/hooks/useActiveSection";
import { nav } from "@/content/site";
import { SectionRail, SiteHeader } from "./Shell";
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
  const { motion, mode, ready } = useViewMode();
  useLenis(motion);
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

      <SiteHeader active={active} onOpenPalette={openPalette} />
      <SectionRail active={active} />

      <div id="page-content" className="lg:pl-rail">
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

      <ExplorePanel />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
