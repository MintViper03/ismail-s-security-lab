import { useEffect, useState } from "react";
import { sections, type SectionId } from "@/content/site";

const sectionIds = sections.map((s) => s.id);

/** Tracks which section sits under the reading line (just below the header). */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>(sectionIds[0]);

  useEffect(() => {
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id as SectionId);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));

    // the last section may be too short to ever reach the reading line
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActive(sectionIds[sectionIds.length - 1]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return active;
}
