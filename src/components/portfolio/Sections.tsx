import type { ReactNode } from "react";
import { ArrowUpRight, BadgeCheck, Clock, Download, Mail, Phone } from "lucide-react";
import { Reveal } from "./Reveal";
import { ActionLink, Container, FigureText, Meta, SectionShell } from "./primitives";
import {
  achievements,
  certifications,
  contact,
  displayName,
  education,
  identity,
  languages,
  summary,
} from "@/content/resume";
import { cta, exploreView, labels, nav, resumeDownload } from "@/content/site";
import { restoreExplorePanel, useExploration } from "@/lib/exploration";

const pad = (n: number) => String(n).padStart(2, "0");

function SubHeading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="mb-5 flex items-baseline gap-3 text-small font-semibold text-text">
      {children}
      {count !== undefined && <Meta>{count}</Meta>}
    </h3>
  );
}

/* ---------- 05 Certifications & Achievements: clean list --------------- */

export function Credentials() {
  return (
    <SectionShell id="credentials">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <SubHeading count={certifications.length}>{labels.certifications}</SubHeading>
          <ul className="flex flex-col gap-4">
            {certifications.map((c) => {
              const earned = c.status === "certified";
              const isDCAP = c.id === "cert.defronix";
              return (
                <li
                  key={c.id}
                  data-cert={c.id}
                  data-status={c.status}
                  className={`rounded-lg p-5 ${
                    earned
                      ? "border border-line border-l-2 border-l-accent bg-surface"
                      : "border border-dashed border-control"
                  }`}
                >
                  <p className="text-body font-semibold text-text">{c.name}</p>
                  {earned ? (
                    <>
                      {/* earned: the only place a "Certified" badge appears */}
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-accent px-2 py-0.5 font-meta text-accent">
                        <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                        {labels.statusCertified}
                      </span>
                      <p className="mt-3 text-small text-muted">{c.description}</p>
                      {isDCAP && (
                        <div className="mt-4 flex flex-col gap-4">
                          {/* DCAP certificate image */}
                          <a
                            href="/certificate-DCAP156.webp"
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block overflow-hidden rounded-md border border-line transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_rgba(34,225,255,0.15)]"
                          >
                            <img
                              src="/certificate-DCAP156.webp"
                              alt="DCAP-156 – Defronix Certified Android Pentester certificate"
                              className="w-full rounded-md transition-transform duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </a>
                          {/* DCAP highlights */}
                          <div className="rounded-md border border-line bg-surface-2 px-4 py-3">
                            <p className="mb-2 font-meta text-accent">Key Competencies</p>
                            <ul className="flex flex-col gap-1.5 text-small text-muted">
                              <li className="flex items-start gap-2">
                                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                APK reverse engineering &amp; static analysis
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                Runtime hooking with Frida &amp; dynamic instrumentation
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                OWASP Mobile Top 10 vulnerability assessment
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                Android exploitation &amp; privilege escalation
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* not earned: no badge; the resume's own wording is the status */
                    <p className="mt-3 inline-flex items-center gap-2 text-small text-muted">
                      <Clock aria-hidden className="h-4 w-4 shrink-0" />
                      <span>{c.description}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <SubHeading count={achievements.length}>{labels.achievements}</SubHeading>
          <ol className="border-t border-line">
            {achievements.map((a, i) => (
              <li
                key={a.id}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-line py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]"
              >
                <Meta className="pt-1 text-accent">{pad(i + 1)}</Meta>
                <div>
                  <p className="text-body text-text">
                    <FigureText text={a.text} />
                  </p>
                  {a.id === "ach.tryhackme" && (
                    <ActionLink
                      href={contact.tryhackme.href}
                      external
                      variant="quiet"
                      className="mt-2"
                    >
                      {labels.tryhackme} {labels.profileLink}
                      <ArrowUpRight aria-hidden className="h-4 w-4" />
                    </ActionLink>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ---------- 06 Education & Languages ---------------------------------- */

export function EducationSection() {
  return (
    <SectionShell id="education">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-8">
          <SubHeading count={education.length}>{labels.education}</SubHeading>
          <ol className="border-t border-line">
            {education.map((e) => (
              <li
                key={e.id}
                className="grid gap-2 border-b border-line py-6 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
              >
                <Meta className="pt-0.5">{e.dates}</Meta>
                <div>
                  <p className="text-body font-semibold text-text">
                    {e.qualification}
                    <span className="font-normal text-muted">, {e.field}</span>
                  </p>
                  <p className="mt-1 text-small text-muted">
                    {e.institution}, {e.location}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="lg:col-span-4">
          <SubHeading count={languages.length}>{labels.languages}</SubHeading>
          {/* reads exactly as the resume: "English (Professional)", "Hindi (Native)" */}
          <ul className="border-t border-line">
            {languages.map((l) => (
              <li key={l.id} className="border-b border-line py-5 text-body">
                <span className="font-semibold text-text">{l.language}</span>{" "}
                <span className="text-muted">({l.proficiency})</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ---------- 07 Contact ------------------------------------------------- */

export function ContactSection() {
  const channels = [
    { label: labels.email, link: contact.email, external: false },
    { label: labels.phone, link: contact.phone, external: false },
    { label: labels.linkedin, link: contact.linkedin, external: true },
    { label: labels.github, link: contact.github, external: true },
    { label: labels.tryhackme, link: contact.tryhackme, external: true },
  ];

  return (
    <SectionShell id="contact">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7">
          <Meta>{labels.availability}</Meta>
          <p className="mt-3 max-w-[34ch] text-h3 font-medium tracking-[-0.01em] text-text">
            {summary.availability.text}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ActionLink href={contact.email.href}>
              <Mail aria-hidden className="h-4 w-4" />
              {cta.email}
            </ActionLink>
            <ActionLink
              href={resumeDownload.href}
              download={resumeDownload.fileName}
              variant="secondary"
            >
              <Download aria-hidden className="h-4 w-4" />
              {resumeDownload.label}
            </ActionLink>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5">
          <SubHeading>{labels.contactChannels}</SubHeading>
          <ul className="border-t border-line">
            {channels.map((c) => (
              <li key={c.label} className="border-b border-line">
                <a
                  href={c.link.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 rounded-sm py-4"
                >
                  <span className="flex min-w-0 flex-col">
                    <Meta>{c.label}</Meta>
                    <span className="truncate text-body text-text group-hover:text-accent">
                      {c.link.display}
                    </span>
                  </span>
                  {c.external ? (
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text"
                    />
                  ) : c.link.href.startsWith("tel:") ? (
                    <Phone
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted group-hover:text-text"
                    />
                  ) : (
                    <Mail
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted group-hover:text-text"
                    />
                  )}
                  {c.external && <span className="sr-only">{labels.opensInNewTab}</span>}
                </a>
              </li>
            ))}
            <li className="flex flex-col border-b border-line py-4">
              <Meta>{labels.location}</Meta>
              <span className="text-body text-text">{identity.location}</span>
            </li>
          </ul>
        </Reveal>
      </div>
    </SectionShell>
  );
}

export function Footer() {
  const explore = useExploration();
  return (
    <footer className="border-t border-line pb-[max(6rem,env(safe-area-inset-bottom))] pt-8">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <Meta>
          © {new Date().getFullYear()} {displayName}
        </Meta>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {explore.dismissed && (
            <button
              type="button"
              onClick={restoreExplorePanel}
              className="inline-flex min-h-11 items-center rounded-sm text-small text-muted underline decoration-control underline-offset-4 hover:text-text"
            >
              {exploreView.show}
            </button>
          )}
          <a
            href="#overview"
            className="inline-flex min-h-11 items-center rounded-sm text-small text-muted hover:text-text"
          >
            {nav.backToTop}
          </a>
        </span>
      </Container>
    </footer>
  );
}
