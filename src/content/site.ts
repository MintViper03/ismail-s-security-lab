/**
 * Interface copy: navigation, section chrome, controls and asset paths.
 *
 * Nothing here is a professional claim — facts about Ismail live in ./resume.ts
 * and figures derived from them in ./highlights.ts.
 */

export const resumeDownload = {
  /** Byte-identical copy of the source resume (see docs/resume-content-map.md). */
  href: "/resume/Ismail_Murtaza_Resume.pdf",
  fileName: "Ismail_Murtaza_Resume.pdf",
  label: "Download Resume",
  meta: "PDF · 2 pages",
} as const;

/** Page order. `rail` is the short label used in the section rail and mobile menu. */
export const sections = [
  { id: "overview", num: "01", title: "Overview", rail: "Overview" },
  { id: "experience", num: "02", title: "Professional Experience", rail: "Experience" },
  { id: "projects", num: "03", title: "Security Projects", rail: "Projects" },
  { id: "skills", num: "04", title: "Technical Skills", rail: "Skills" },
  {
    id: "credentials",
    num: "05",
    title: "Certifications & Achievements",
    rail: "Certifications",
  },
  { id: "education", num: "06", title: "Education & Languages", rail: "Education" },
  { id: "contact", num: "07", title: "Contact", rail: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function section(id: SectionId) {
  return sections.find((s) => s.id === id)!;
}

export const nav = {
  skipLink: "Skip to content",
  railLabel: "Sections",
  menuOpen: "Menu",
  menuClose: "Close",
  menuLabel: "Site sections",
  backToTop: "Back to top",
} as const;

/** The header's motion switch (independent of Interactive/Reading). */
export const motionControl = {
  label: "Motion",
  on: "On",
  off: "Off",
  hintOn: "Motion is on — select to stop animation and the 3D loop",
  hintOff: "Motion is off — select to allow animation",
  paletteOff: "Turn motion off",
  paletteOn: "Turn motion on",
} as const;

export const viewModeControl = {
  groupLabel: "Display mode",
  interactive: "Interactive",
  reading: "Reading",
  interactiveHint: "Motion and the 3D scene are on",
  readingHint: "No motion, every detail expanded",
} as const;

export const cta = {
  experience: { label: "View Experience", href: "#experience" },
  contact: { label: "Contact", href: "#contact" },
  email: "Email me",
} as const;

export const labels = {
  location: "Location",
  availability: "Availability",
  summaryHeading: "Professional Summary",
  figuresHeading: "At a glance",
  project: "Project",
  securitySkills: "Security",
  engineeringSkills: "Engineering",
  certifications: "Certifications",
  achievements: "Achievements",
  education: "Education",
  languages: "Languages",
  statusCertified: "Certified",
  profileLink: "Profile",
  contactChannels: "Channels",
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  github: "GitHub",
  tryhackme: "TryHackMe",
  opensInNewTab: "(opens in a new tab)",
} as const;

/**
 * Hero "security architecture" sculpture. The three focus controls reuse resume skill-group
 * names; each changes the sculpture's arrangement, lighting and view, and reveals that
 * group's items.
 */
export const heroScene = {
  caption: "Security architecture",
  note: "Conceptual illustration",
  focusLabel: "Skill focus",
  pause: "Pause animation",
  play: "Play animation",
  focusGroups: ["skills.offensive", "skills.incident-response", "skills.development"],
} as const;

export type FocusGroupId = (typeof heroScene.focusGroups)[number];

/** Technical Skills view. Counts are computed from resume.ts; no levels or ratings exist. */
export const skillsView = {
  mapLabel: "Skill categories",
  showAll: "Show all skills",
  showByCategory: "Show by category",
  categories: "categories",
  skills: "skills",
} as const;

/** Skill group ids split into the two tiers shown on the page. */
export const skillTiers = [
  {
    label: labels.securitySkills,
    groups: ["skills.offensive", "skills.incident-response", "skills.tools", "skills.frameworks"],
  },
  {
    label: labels.engineeringSkills,
    groups: ["skills.programming", "skills.development", "skills.platforms"],
  },
] as const;

/**
 * Professional Experience view. Stage names and group headings are interface labels;
 * every bullet under them is rendered verbatim from resume.ts with its source reference.
 */
export const experienceView = {
  timelineLabel: "Roles",
  featured: "Featured",
  showFull: "Show full experience",
  showLess: "Show less",
  scopeHeading: "Scope",
  scopeLabels: {
    overall: "Overall",
    primary: "Primary compromise",
    additional: "Additional sites",
  },
  primaryHeading: "Primary compromise",
  additionalHeading: "Additional sites",
  sequenceLabel: "Incident sequence",
  nextStage: "Next stage",
  deliveryHeading: "Development and delivery",
  /** Roles with more bullets than this get an inline "Show full experience" disclosure. */
  previewLimit: 3,
} as const;

/** BrandsKey primary-compromise bullets grouped into the optional sequence. */
export const incidentStages = [
  {
    id: "investigation",
    label: "Investigation",
    bullets: ["exp.brandskey.b01", "exp.brandskey.b02", "exp.brandskey.b03"],
  },
  { id: "persistence", label: "Persistence Removal", bullets: ["exp.brandskey.b04"] },
  { id: "recovery", label: "Recovery", bullets: ["exp.brandskey.b05", "exp.brandskey.b06"] },
  { id: "hardening", label: "Hardening", bullets: ["exp.brandskey.b07"] },
] as const;

export const additionalSitesBullets = ["exp.brandskey.b08"] as const;
export const deliveryBullets = [
  "exp.brandskey.b09",
  "exp.brandskey.b10",
  "exp.brandskey.b11",
] as const;

/**
 * Security Projects view. Diagram labels are illustration captions built only from each
 * project's own resume wording (see comments); they are not telemetry or screenshots.
 */
export const projectsView = {
  details: "Project details",
  technology: "Technology",
  year: "Year",
  illustration: "Conceptual illustration",
  illustrationNote: "Not a screenshot or measured telemetry",
  links: "Links",
  demo: "Live demo",
  source: "Source on GitHub",
} as const;

export const projectDiagrams = {
  "proj.aigisai": {
    description:
      "Conceptual illustration: several detection signals feed one local heuristic engine that works on zero-trust principles and flags attack indicators, without relying on cloud signatures or external lookups.",
    signals: "Detection signals", // "Unified multiple detection signals"
    signal: "Signal",
    engine: ["Local heuristic", "engine"], // "local-first heuristic detection engine"
    zeroTrust: "Zero-trust", // "applying zero-trust principles"
    output: ["Attack indicators", "flagged"], // "flagging attack indicators"
    cloud: ["Cloud signatures,", "external lookups"], // "without relying on cloud signatures or external lookups"
    notUsed: "not relied on",
  },
  "proj.sentineltrace": {
    description:
      "Conceptual illustration: inside a controlled laboratory environment, a monitoring agent on a Windows endpoint writes encrypted-at-rest logs and sends encrypted data over a simulated command-and-control channel on Telegram, for authorised red-team simulation.",
    lab: "Controlled lab environment", // "within controlled laboratory environments"
    authorised: "Authorised red-team simulation", // "for authorised red-team simulation"
    endpoint: "Windows lab endpoint", // "Windows monitoring agent"
    agent: "Monitoring agent",
    encryption: "AES Encryption", // technology label, no key length stated
    c2: ["Simulated C2", "over Telegram"], // "C2 Simulation"; "exfiltration over Telegram"
    log: ["Encrypted-at-rest", "log"], // "encrypted-at-rest logging"
  },
} as const;

/**
 * Exploration layer. Progress counts what the visitor has opened on this page — it is
 * not a score, level or measure of Ismail's skills. Stored only in this browser.
 */
export const exploreView = {
  title: "Explore portfolio",
  progressLabel: "Portfolio exploration",
  progressNote:
    "Counts the areas you have opened on this page, in this browser only. It is not a measure of skills.",
  of: "of",
  opened: "opened",
  complete: "You have opened all four areas.",
  reset: "Reset progress",
  resetDone: "Exploration progress reset.",
  hide: "Hide explore panel",
  collapse: "Collapse",
  show: "Show explore panel",
  done: "Done",
  notYet: "Not yet",
  steps: {
    experience: {
      label: "Read professional experience",
      hint: "Stay on the section or open its details",
    },
    projects: { label: "Open both projects", hint: "Open each project's details" },
    skills: { label: "Explore technical skills", hint: "Pick a category or show all skills" },
    certifications: { label: "View certifications", hint: "Scroll to certifications" },
  },
} as const;

export const paletteView = {
  trigger: "Commands",
  title: "Command palette",
  description: "Type to filter. Use the arrow keys and Enter to run an action, Escape to close.",
  placeholder: "Type a command or section…",
  empty: "No matching action.",
  groups: {
    navigate: "Go to section",
    display: "Display",
    resume: "Resume",
    contact: "Contact",
    explore: "Exploration",
  },
  toReading: "Switch to Reading mode",
  toInteractive: "Switch to Interactive mode",
  openResume: "Open resume (PDF)",
  downloadResume: "Download resume (PDF)",
  email: "Email Ismail",
  call: "Call",
  contactSection: "View contact details",
  showExplore: "Show explore panel",
  resetExplore: "Reset exploration progress",
  hints: {
    move: "move",
    select: "select",
    close: "close",
    open: "open",
    or: "or",
  },
} as const;

/** Navigation dock: the desktop rail's tools and the mobile bottom dock. */
export const dockView = {
  label: "Quick actions",
  current: "Current section",
  email: "Email",
  reading: "Reading",
  readingMode: "Reading mode",
  commands: "Commands",
  toReading: "Switch to Reading mode",
  toInteractive: "Switch to Interactive mode",
} as const;
