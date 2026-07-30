import { useEffect, useState } from "react";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ChevronRight,
  Download,
  ArrowUpRight,
  Terminal,
  Shield,
  Zap,
  AlertTriangle,
  Award,
  FileWarning,
} from "lucide-react";
import { Hero3D } from "./Hero3D";
import { ProfilePhoto } from "./ProfilePhoto";
import { Reveal } from "./Reveal";
import { ModeToggle } from "./ModeToggle";
import { useLenis } from "@/hooks/useLenis";

type Mode = "attack" | "defend";

const skills = {
  "Offensive Security": [
    { name: "Penetration Testing", sev: "critical" },
    { name: "Red Teaming", sev: "critical" },
    { name: "Web Exploitation", sev: "critical" },
    { name: "Network Pentesting", sev: "high" },
    { name: "Android Pentesting", sev: "high" },
    { name: "Privilege Escalation", sev: "high" },
    { name: "Post-Exploitation", sev: "medium" },
  ],
  "Security Tools": [
    { name: "Burp Suite", sev: "high" },
    { name: "Metasploit", sev: "high" },
    { name: "Nmap", sev: "medium" },
    { name: "Wireshark", sev: "medium" },
    { name: "Nessus", sev: "medium" },
    { name: "SQLmap", sev: "medium" },
    { name: "OWASP ZAP", sev: "medium" },
  ],
  "Security Concepts": [
    { name: "OWASP Top 10", sev: "critical" },
    { name: "Threat Modeling", sev: "high" },
    { name: "Incident Response", sev: "high" },
    { name: "Malware Analysis", sev: "medium" },
    { name: "Cryptography (AES)", sev: "medium" },
  ],
  Programming: [
    { name: "Python", sev: "high" },
    { name: "JavaScript / TypeScript", sev: "high" },
    { name: "Bash", sev: "medium" },
    { name: "SQL", sev: "medium" },
  ],
  "Web Development": [
    { name: "React", sev: "medium" },
    { name: "Node.js", sev: "medium" },
    { name: "WordPress Hardening", sev: "medium" },
    { name: "REST APIs", sev: "low" },
  ],
} as const;

const timeline = [
  {
    role: "Penetration Tester Intern",
    org: "KONSTENT",
    period: "June 2025 — October 2025",
    tag: "OFFENSIVE",
    bullets: [
      "Conducted web application penetration testing; identified critical vulnerabilities including SQLi, XSS, IDOR, and broken authentication using Burp Suite, Nmap, and Metasploit.",
      "Delivered CVSS-scored vulnerability reports with proof-of-concept exploits and remediation guidance aligned with OWASP and PTES frameworks.",
    ],
  },
  {
    role: "Back End Developer",
    org: "Syncasist Business Solutions",
    period: "August 2025 — April 2026",
    tag: "BUILD",
    bullets: [
      "Built secure RESTful APIs implementing authentication, authorization, and input validation; applied secure coding practices and code reviews to remediate vulnerabilities pre-deployment.",
    ],
  },
  {
    role: "Full Stack Developer & Security Engineer",
    org: "BrandsKey Creative Studio",
    period: "December 2025 — Present",
    tag: "BUILD + DEFEND",
    bullets: [
      "Delivered 15+ production websites across Real Estate, Finance, Marketing, Wedding Planning, Marble/Hardware retail, and Food industries using React, Next.js, and WordPress/Shopify, deployed via Hostinger.",
      "Led projects independently and as part of a team, owning client communication, timeline management, and mentoring a junior colleague.",
      "Investigated and remediated 3 compromised WordPress sites: outdated-plugin and XML-RPC based exploitation, a root-directory webshell granting admin access, 10 unauthorized admin accounts, and a data-harvesting script exfiltrating site data — removed all malicious files, revoked access, and hardened sites against re-infection.",
      "Integrated custom forms with Google Sheets, Google Drive, and email automation to streamline client lead-capture workflows.",
    ],
  },
  {
    role: "Member — Coding & Programming Club",
    org: "L33tL3g10n — SPSU Udaipur",
    period: "September 2024 — May 2026",
    tag: "COMMUNITY",
    bullets: [
      "Competed in CTF challenges focused on binary exploitation, cryptography, and algorithmic problem-solving; advanced to National Coding League Semi-Finals.",
    ],
  },
];

const sevColor: Record<string, string> = {
  critical: "var(--critical)",
  high: "var(--high)",
  medium: "var(--medium)",
  low: "var(--low)",
};

export function Portfolio() {
  const [mode, setMode] = useState<Mode>("defend");
  useLenis();

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30">
      <Nav mode={mode} setMode={setMode} />
      <Hero mode={mode} />
      <Recon />
      <Exploit />
      <Report />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/70 border-b border-border-hair">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <a
          href="#top"
          className="flex min-w-0 items-center gap-2 font-mono-tech text-[12px] uppercase tracking-[0.18em] text-text"
        >
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
          />
          <span className="truncate">im.sec // ismail_murtaza</span>
        </a>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-6 font-mono-tech text-[11px] uppercase tracking-[0.18em] text-muted">
            <a href="#recon" className="hover:text-text transition-colors">01 · Recon</a>
            <a href="#exploit" className="hover:text-text transition-colors">02 · Exploit</a>
            <a href="#report" className="hover:text-text transition-colors">03 · Report</a>
            <a href="#contact" className="hover:text-text transition-colors">04 · Contact</a>
          </nav>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>
    </header>
  );
}

function Hero({ mode }: { mode: Mode }) {
  return (
    <section id="top" className="relative min-h-screen pt-14 overflow-hidden">
      <div className="absolute inset-0">
        <Hero3D mode={mode} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 0%, var(--bg) 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32 pb-24 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)] lg:items-center">
        <div className="min-w-0">
        <Reveal delay={50}>
          <div className="flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.22em] text-muted">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span>Recon · Handshake · 0x01</span>
          </div>
        </Reveal>


        <Reveal delay={120}>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tight">
            Ismail{" "}
            <span
              style={{
                background:
                  "linear-gradient(180deg, var(--text) 0%, color-mix(in oklab, var(--accent) 60%, var(--text)) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Murtaza
            </span>
            <span
              className="inline-block ml-2 h-[0.9em] w-[0.14em] align-baseline animate-pulse"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted">
            Penetration Tester &amp; Full-Stack Security Engineer.{" "}
            <span className="text-text">
              I break systems, then rebuild them stronger.
            </span>
          </p>
        </Reveal>

        <Reveal delay={340}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#report"
              className="group inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono-tech text-[12px] uppercase tracking-[0.18em] text-bg transition-all accent-glow"
              style={{ background: "var(--accent)" }}
            >
              View Work
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono-tech text-[12px] uppercase tracking-[0.18em] text-text hair-border hover:bg-surface transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Resume
            </a>
          </div>
        </Reveal>

        <Reveal delay={480}>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            {[
              { k: "Rooms", v: "51", s: "TryHackMe" },
              { k: "Recovered", v: "3", s: "Prod Sites" },
              { k: "Detection", v: "95%", s: "AigisAI" },
              { k: "Rank", v: "Top 8%", s: "THM Global" },
            ].map((m) => (
              <div
                key={m.k}
                className="rounded-md hair-border bg-surface/60 backdrop-blur-sm p-4"
              >
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.18em] text-muted">
                  {m.k}
                </div>
                <div className="mt-1 font-display text-2xl font-semibold">
                  {m.v}
                </div>
                <div className="font-mono-tech text-[10px] text-muted mt-0.5">
                  {m.s}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionLabel({
  num,
  name,
  title,
}: {
  num: string;
  name: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      <div className="font-mono-tech text-[11px] uppercase tracking-[0.22em] text-muted">
        {num} · {name}
      </div>
      <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function Recon() {
  return (
    <section id="recon" className="relative py-28 border-t border-border-hair">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel num="01" name="Recon" title="About the operator" />
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <article className="rounded-lg hair-border bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-border-hair">
                <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.18em] text-muted">
                  <Terminal className="h-3.5 w-3.5" />
                  recon_report.md
                </div>
                <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-muted">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--defend)" }}
                  />
                  Signed
                </div>
              </div>

              <p className="text-[15px] sm:text-base leading-relaxed text-text/90">
                Offensive security practitioner focused on penetration testing
                and red teaming, with hands-on experience exploiting
                vulnerabilities across web, mobile, and network attack surfaces
                — and remediating live compromises in production environments.
              </p>
              <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-muted">
                Independently investigated and recovered{" "}
                <span className="text-text">3 hacked production websites</span>.
                Builds offensive tooling and detection systems. Ranked{" "}
                <span className="text-text">top 8% on TryHackMe</span> with 51
                rooms solved.
              </p>
            </article>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col gap-6">
              <ProfilePhoto
                src="/photo.jpg"
                alt="Ismail Murtaza"
                variant="featured"
                className="aspect-[4/5] w-full"
              />

              <aside className="rounded-lg hair-border bg-surface p-6 sm:p-8 font-mono-tech text-[12px] leading-relaxed">
                <MetaRow k="host" v="ismail.murtaza" />
                <MetaRow k="location" v="Udaipur, India" />
                <MetaRow k="status" v="available" dot="var(--defend)" />
                <MetaRow k="role" v="pentester / red team" />
                <MetaRow k="stack" v="python · ts · react" />
                <MetaRow k="education" v="BCA — Cybersecurity, SPSU" />
                <MetaRow k="uptime" v="24/7" />
              </aside>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MetaRow({ k, v, dot }: { k: string; v: string; dot?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-border-hair last:border-b-0">
      <span className="text-muted w-20 shrink-0">{k}</span>
      <span className="text-muted">::</span>
      <span className="text-text flex items-center gap-2 min-w-0 truncate">
        {dot && (
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
          />
        )}
        {v}
      </span>
    </div>
  );
}

function Exploit() {
  return (
    <section id="exploit" className="relative py-28 border-t border-border-hair">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel num="02" name="Exploit" title="Capabilities & timeline" />
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Skills */}
          <div className="space-y-8">
            {(Object.keys(skills) as Array<keyof typeof skills>).map(
              (group, i) => (
                <Reveal key={group} delay={i * 60}>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-mono-tech text-[11px] uppercase tracking-[0.22em] text-muted">
                        {group}
                      </h3>
                      <span className="font-mono-tech text-[10px] text-muted">
                        {skills[group].length} items
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills[group].map((s) => (
                        <span
                          key={s.name}
                          className="group inline-flex items-center gap-2 rounded-md hair-border bg-surface px-3 py-1.5 font-mono-tech text-[11px] transition-all hover:bg-surface-2 hover:-translate-y-0.5"
                          style={{
                            boxShadow: `inset 3px 0 0 0 ${sevColor[s.sev]}`,
                          }}
                        >
                          <span
                            className="text-[9px] uppercase tracking-[0.2em] shrink-0"
                            style={{ color: sevColor[s.sev] }}
                          >
                            {s.sev}
                          </span>
                          <span className="text-text">{s.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>

          {/* Timeline */}
          <div>
            <Reveal>
              <h3 className="mb-6 font-mono-tech text-[11px] uppercase tracking-[0.22em] text-muted">
                Engagement Timeline
              </h3>
            </Reveal>
            <ol className="relative border-l border-border-hair pl-6 space-y-6">
              {timeline.map((item, i) => (
                <Reveal key={item.role} delay={i * 80}>
                  <TimelineItem item={item} />
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item }: { item: (typeof timeline)[number] }) {
  return (
    <li className="relative group">
      <span
        className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full transition-all group-hover:scale-125"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 0 4px var(--bg), 0 0 12px var(--accent)",
        }}
      />
      <details className="rounded-md hair-border bg-surface transition-colors open:bg-surface-2">
        <summary className="cursor-pointer list-none p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg font-semibold text-text">
                {item.role}
              </div>
              <div className="font-mono-tech text-[11px] text-muted mt-0.5">
                {item.org}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="font-mono-tech text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                style={{
                  color: "var(--accent)",
                  border: "1px solid color-mix(in oklab, var(--accent) 50%, transparent)",
                }}
              >
                {item.tag}
              </span>
              <span className="font-mono-tech text-[10px] text-muted">
                {item.period}
              </span>
            </div>
          </div>
        </summary>
        <ul className="px-4 sm:px-5 pb-5 space-y-2 text-sm text-muted">
          {item.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span
                className="mt-2 h-1 w-1 rounded-full shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

function Report() {
  return (
    <section id="report" className="relative py-28 border-t border-border-hair">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel num="03" name="Report" title="Proof of work" />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <ProjectCard
              tag="DETECTION"
              icon={<Shield className="h-4 w-4" />}
              title="AigisAI"
              desc="AI-powered threat detection system that classifies malicious traffic and anomalous behavior in real time. Achieved 95% detection accuracy on the evaluation dataset."
              stack={["Python", "Machine Learning", "Threat Intel", "Feature Eng."]}
              stat={{ k: "Accuracy", v: "95%" }}
            />
          </Reveal>
          <Reveal delay={80}>
            <ProjectCard
              tag="RED TEAM"
              icon={<Zap className="h-4 w-4" />}
              title="SentinelTrace"
              desc="Python-based endpoint monitoring & telemetry tool built for red team simulation. Records host activity with AES-encrypted transport back to the operator."
              stack={["Python", "AES", "Endpoint", "Telemetry"]}
              stat={{ k: "Payload", v: "AES-256" }}
            />
          </Reveal>
        </div>

        <Reveal delay={80}>
          <IncidentCase />
        </Reveal>

        <Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Achievement
              title="TryHackMe — Top 8%"
              meta="51 rooms solved"
            />
            <Achievement
              title="National Coding League"
              meta="Semi-Finalist"
            />
            <Achievement
              title="RBI90 Quiz"
              meta="State-Level Representative"
            />
            <Achievement
              title="Defronix Certified"
              meta="Android Pentester"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProjectCard({
  tag,
  icon,
  title,
  desc,
  stack,
  stat,
}: {
  tag: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  stack: string[];
  stat: { k: string; v: string };
}) {
  return (
    <article className="group relative rounded-lg hair-border bg-surface p-6 sm:p-8 transition-all hover:-translate-y-1 hover:bg-surface-2">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "var(--accent)" }}
        >
          {icon}
          {tag}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted transition-all group-hover:text-text group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-6 font-display text-2xl sm:text-3xl font-bold">
        {title}
      </h3>
      <p className="mt-3 text-sm sm:text-[15px] text-muted leading-relaxed">
        {desc}
      </p>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {stack.map((s) => (
          <span
            key={s}
            className="font-mono-tech text-[10px] px-2 py-0.5 rounded hair-border text-muted"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border-hair flex items-baseline gap-3">
        <div
          className="font-display text-3xl font-bold"
          style={{ color: "var(--accent)" }}
        >
          {stat.v}
        </div>
        <div className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted">
          {stat.k}
        </div>
      </div>
    </article>
  );
}

function IncidentCase() {
  return (
    <div className="mt-8 rounded-lg overflow-hidden hair-border bg-[color:var(--surface)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-hair bg-surface-2">
        <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.18em]">
          <FileWarning className="h-3.5 w-3.5" style={{ color: "var(--critical)" }} />
          <span className="text-text">incident_response.log</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted">
          <AlertTriangle className="h-3 w-3" style={{ color: "var(--critical)" }} />
          Severity: Critical · Recovered
        </div>
      </div>
      <div className="p-6 sm:p-8 font-mono-tech text-[13px] leading-relaxed">
        <div className="grid gap-1 text-muted">
          <div><span className="text-text">$</span> case: brandskey_site_recovery</div>
          <div><span className="text-text">$</span> targets: 3 × WordPress prod</div>
          <div><span className="text-text">$</span> client: <span className="px-1 mx-0.5" style={{ background: "#2b2f3a", color: "#2b2f3a", borderRadius: "2px" }}>[REDACTED]</span></div>
        </div>

        <div className="mt-6 space-y-2 text-text/90">
          <LogLine time="00:01" k="RECON" text="outdated plugins and exposed XML-RPC endpoint identified as initial entry vector" />
          <LogLine time="00:15" k="FIND" text="webshell planted in site root granting full admin-panel access" color="var(--critical)" />
          <LogLine time="00:30" k="FIND" text="10 unauthorized admin accounts created by attacker across the 3 sites" color="var(--critical)" />
          <LogLine time="00:50" k="FIND" text="hidden script scanning full site and exfiltrating data to a remote endpoint" color="var(--high)" />
          <LogLine time="01:20" k="CONT" text="revoked unauthorized admin access, disabled XML-RPC" />
          <LogLine time="01:45" k="ERAD" text="removed webshells and every malicious/injected file found" />
          <LogLine time="02:10" k="HARD" text="patched plugins, hardened admin access, monitored for re-infection" color="var(--defend)" />
          <LogLine time="02:30" k="DONE" text="3/3 sites restored and secured" color="var(--defend)" />
        </div>

        <div className="mt-6 pt-4 border-t border-border-hair flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-muted">
          <span>Sites: <span className="text-text">3/3 recovered</span></span>
          <span>Attack vectors: <span className="text-text">outdated plugins · XML-RPC</span></span>
          <span>Persistence found: <span style={{ color: "var(--critical)" }}>webshell · rogue admins · exfil script</span></span>
        </div>
      </div>
    </div>
  );
}

function LogLine({
  time,
  k,
  text,
  color = "var(--muted)",
}: {
  time: string;
  k: string;
  text: string;
  color?: string;
}) {
  return (
    <div className="grid grid-cols-[auto_auto_1fr] gap-3 items-baseline">
      <span className="text-muted">[{time}]</span>
      <span
        className="uppercase text-[10px] tracking-[0.18em] px-1.5 py-0.5 rounded"
        style={{ color, border: `1px solid color-mix(in oklab, ${color} 40%, transparent)` }}
      >
        {k}
      </span>
      <span>{text}</span>
    </div>
  );
}

function Achievement({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-md hair-border bg-surface p-5 flex items-start gap-4 hover:bg-surface-2 transition-colors">
      <div
        className="h-9 w-9 rounded-md grid place-items-center shrink-0"
        style={{
          background: "color-mix(in oklab, var(--accent) 12%, transparent)",
          border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
          color: "var(--accent)",
        }}
      >
        <Award className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="font-display font-semibold text-text">{title}</div>
        <div className="font-mono-tech text-[11px] text-muted mt-0.5">{meta}</div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-28 border-t border-border-hair">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionLabel num="04" name="Contact" title="Initiate contact" />
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          <Reveal>
            <div>
              <p className="text-lg sm:text-xl text-muted max-w-xl">
                Open for penetration testing engagements, red team
                collaboration, and full-stack security work.
              </p>
              <a
                href="mailto:ismailsuwasra@gmail.com"
                className="mt-8 inline-flex items-center gap-3 rounded-md px-6 py-4 font-mono-tech text-[12px] uppercase tracking-[0.22em] text-bg accent-glow"
                style={{ background: "var(--accent)" }}
              >
                Initiate Contact
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ul className="rounded-lg hair-border bg-surface divide-y divide-[color:var(--border-hair)]">
              <ContactRow icon={<Mail className="h-4 w-4" />} label="email" value="ismailsuwasra@gmail.com" href="mailto:ismailsuwasra@gmail.com" />
              <ContactRow icon={<Linkedin className="h-4 w-4" />} label="linkedin" value="/in/ismailmurtaza" href="https://linkedin.com/in/ismailmurtaza" />
              <ContactRow icon={<Github className="h-4 w-4" />} label="github" value="/MintViper03" href="https://github.com/MintViper03" />
              <ContactRow icon={<MapPin className="h-4 w-4" />} label="location" value="Udaipur, India" />
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 group">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="h-8 w-8 rounded-md grid place-items-center shrink-0 text-muted group-hover:text-[color:var(--accent)] transition-colors"
          style={{ background: "var(--surface-2)" }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-muted">
            {label}
          </div>
          <div className="truncate text-text">{value}</div>
        </div>
      </div>
      {href && (
        <ArrowUpRight className="h-4 w-4 text-muted shrink-0 group-hover:text-text transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      )}
    </div>
  );
  return (
    <li>
      {href ? (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-hair py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[10px] uppercase tracking-[0.22em] text-muted">
        <span>© {new Date().getFullYear()} Ismail Murtaza · All engagements authorized.</span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--defend)", boxShadow: "0 0 8px var(--defend)" }}
          />
          session · secure
        </span>
      </div>
    </footer>
  );
}
