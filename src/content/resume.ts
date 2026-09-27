/**
 * Professional content — the single source of truth for every fact shown on the site.
 *
 * Source: public/resume/Ismail_Murtaza_Resume.pdf (2 pages). All strings are verbatim
 * from the PDF; only line wrapping was normalised (see docs/resume-content-map.md for the
 * item-by-item map and the three wrapped hyphenated compounds). British spellings are
 * intentional. Do not paraphrase, shorten or "fix" wording here — change the PDF first,
 * then mirror it.
 *
 * Navigation, CTA and other interface labels live in ./site.ts, not here.
 */

export interface Link {
  /** Text exactly as printed on the resume. */
  display: string;
  /** Derived from `display` (scheme added); not printed on the resume. */
  href: string;
}

export interface Bullet {
  id: string;
  text: string;
  /** Leading run set in bold on the resume. Always a prefix of `text`. */
  emphasis?: string;
}

export interface Sentence {
  id: string;
  text: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: readonly string[];
}

export interface Role {
  id: string;
  title: string;
  organization: string;
  /** Parent body printed after the organization name, when present. */
  affiliation?: string;
  location: string;
  dates: string;
  bullets: readonly Bullet[];
}

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  stack: readonly string[];
  year: string;
  bullets: readonly Bullet[];
}

export interface Certification {
  id: string;
  name: string;
  /** Text after " - " on the resume line, verbatim (including final period). */
  description: string;
  /**
   * "certified" is supported by the summary ("Certified Android Pentester").
   * "in preparation" must always be shown wherever the credential is shown.
   */
  status: "certified" | "in preparation";
}

export interface Education {
  id: string;
  qualification: string;
  field: string;
  institution: string;
  location: string;
  dates: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export const identity = {
  /** Set in capitals on the resume heading. */
  name: "ISMAIL MURTAZA",
  headline: ["Penetration Tester", "Security Engineer", "Red Teamer"],
  location: "Udaipur, Rajasthan, India",
} as const;

/** `identity.name` in title case for headings; same words, typographic casing only. */
export const displayName = identity.name
  .split(" ")
  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
  .join(" ");

export const contact = {
  phone: { display: "+91-9587053147", href: "tel:+919587053147" },
  email: { display: "ismailsuwasra@gmail.com", href: "mailto:ismailsuwasra@gmail.com" },
  linkedin: {
    display: "linkedin.com/in/ismail-murtaza",
    href: "https://linkedin.com/in/ismail-murtaza",
  },
  github: { display: "github.com/MintViper03", href: "https://github.com/MintViper03" },
  tryhackme: {
    display: "tryhackme.com/p/s0apEclipse",
    href: "https://tryhackme.com/p/s0apEclipse",
  },
} as const satisfies Record<string, Link>;

export const summary: {
  sentences: readonly Sentence[];
  availability: { label: string; text: string };
} = {
  sentences: [
    {
      id: "summary.s1",
      text: "Offensive security practitioner with hands-on experience in penetration testing, red teaming, and web, mobile, and network security.",
    },
    {
      id: "summary.s2",
      text: "Investigated and remediated four compromised production environments, identifying attacker entry points, persistence mechanisms, and injected malicious code.",
    },
    {
      id: "summary.s3",
      text: "Combines an attacker mindset with full-stack development experience to find, exploit, and fix vulnerabilities at the code level.",
    },
    {
      id: "summary.s4",
      text: "Certified Android Pentester, ranked in the top 8% on TryHackMe, and currently completing a BCA specialising in Cybersecurity.",
    },
  ],
  availability: {
    label: "Availability:",
    text: "Open to full-time and internship opportunities from December 2026 (currently serving notice period, ending 30 November 2026).",
  },
};

export const skills: readonly SkillGroup[] = [
  {
    id: "skills.offensive",
    label: "Offensive Security",
    items: [
      "Web Application Penetration Testing",
      "Network Penetration Testing",
      "Android and Mobile Penetration Testing",
      "Red Teaming",
      "Vulnerability Assessment",
      "Linux Privilege Escalation",
    ],
  },
  {
    id: "skills.incident-response",
    label: "Incident Response",
    items: [
      "Malware Removal",
      "Log Analysis",
      "Threat Hunting",
      "Root Cause Analysis",
      "Post-Incident Hardening",
    ],
  },
  {
    id: "skills.tools",
    label: "Security Tools",
    items: [
      "Burp Suite",
      "Metasploit",
      "Nmap",
      "Wireshark",
      "Nessus",
      "SQLmap",
      "OWASP ZAP",
      "Nikto",
      "Hydra",
      "GoBuster",
    ],
  },
  {
    id: "skills.frameworks",
    label: "Frameworks and Standards",
    items: [
      "OWASP Top 10",
      "OWASP Testing Guide",
      "PTES",
      "MITRE ATT&CK",
      "CVSS Scoring",
      "Threat Modeling",
      "Secure SDLC",
    ],
  },
  {
    id: "skills.programming",
    label: "Programming and Scripting",
    items: ["Python", "Bash", "JavaScript", "PHP", "SQL", "C"],
  },
  {
    id: "skills.development",
    label: "Development",
    items: [
      "React.js",
      "Next.js",
      "Node.js",
      "REST API Design",
      "HTML",
      "CSS",
      "WordPress",
      "Shopify",
      "Git",
      "GitHub",
    ],
  },
  {
    id: "skills.platforms",
    label: "Platforms and Systems",
    items: [
      "Kali Linux",
      "BlackArch",
      "CSI Linux",
      "Ubuntu",
      "Windows",
      "cPanel and WHM",
      "WP-CLI",
      "MySQL",
      "Apache",
      "Nginx",
    ],
  },
];

/** "PROFESSIONAL EXPERIENCE" section, in resume order. */
export const experience: readonly Role[] = [
  {
    id: "exp.brandskey",
    title: "Full Stack Developer and Security Engineer",
    organization: "BrandsKey Creative Studio",
    location: "Udaipur, India",
    dates: "December 2025 - Present",
    bullets: [
      {
        id: "exp.brandskey.b01",
        emphasis: "Investigated and remediated a production WordPress environment",
        text: "Investigated and remediated a production WordPress environment compromised for approximately ten months, removing a self-reinstalling malware kit that had survived multiple prior cleanup attempts by external parties.",
      },
      {
        id: "exp.brandskey.b02",
        emphasis: "Traced the reinfection source",
        text: "Traced the reinfection source by correlating antivirus quarantine timestamps with server access logs, isolating a scheduled-task loader that rebuilt four interdependent payload copies within minutes of each removal.",
      },
      {
        id: "exp.brandskey.b03",
        emphasis: "Analysed an obfuscated PHP dropper",
        text: "Analysed an obfuscated PHP dropper that used dynamic function-name construction and gzip and base64 payload staging, identifying the malware family, its command-and-control behaviour, and the indicators needed to detect it.",
      },
      {
        id: "exp.brandskey.b04",
        emphasis: "Removed attacker persistence",
        text: "Removed attacker persistence across the filesystem and database, including a REST API backdoor, 22 webshell-bearing fake themes, 11 fake plugin directories, a rogue administrator account, and a stolen application password with five months of active use.",
      },
      {
        id: "exp.brandskey.b05",
        emphasis: "Recovered organic search integrity",
        text: "Recovered organic search integrity by removing an SEO spam layer of 182 injected multilingual articles, 132 spam taxonomy terms, 2,895 spam comments, and hidden outbound link blocks, then cleaning affected sitemap entries.",
      },
      {
        id: "exp.brandskey.b06",
        emphasis: "Verified the cleanup",
        text: "Verified the cleanup through WP-CLI checksum validation of WordPress core and 16 plugins against official releases, confirming a clean state and zero reinfection over a sustained monitoring window.",
      },
      {
        id: "exp.brandskey.b07",
        emphasis: "Hardened the environment afterwards",
        text: "Hardened the environment afterwards with full credential rotation across hosting, database, email, and application layers, XML-RPC disabled at multiple layers, two-factor authentication, and an off-server backup strategy.",
      },
      {
        id: "exp.brandskey.b08",
        text: "Remediated three additional compromised WordPress sites: identified outdated-plugin and XML-RPC based entry points, removed a root-directory webshell and 10 unauthorised administrator accounts, and eliminated a script exfiltrating site data to a remote server.",
      },
      {
        id: "exp.brandskey.b09",
        text: "Delivered 15+ production websites across real estate, finance, marketing, wedding planning, retail, and food sectors using React, Next.js, WordPress, and Shopify, including the company platform at brandskey.in.",
      },
      {
        id: "exp.brandskey.b10",
        text: "Owned client communication, scoping, and delivery timelines while mentoring a junior developer on secure coding practices.",
      },
      {
        id: "exp.brandskey.b11",
        text: "Integrated lead-capture automation with Google Sheets, Google Drive, and email workflows, alongside CMS integrations, custom animations, and front-end performance optimisation.",
      },
    ],
  },
  {
    id: "exp.syncasist",
    title: "Back End Developer (Freelance)",
    organization: "Syncasist Business Solutions",
    location: "Udaipur, India",
    dates: "August 2025 - April 2026",
    bullets: [
      {
        id: "exp.syncasist.b01",
        text: "Collaborated within a development team to build the backend for a grocery delivery application, implementing secure RESTful APIs with authentication, role-based authorisation, and server-side input validation.",
      },
      {
        id: "exp.syncasist.b02",
        text: "Independently owned the security review and audit of the application, applying secure coding practices to identify and remediate injection and access-control flaws before release.",
      },
      {
        id: "exp.syncasist.b03",
        text: "Independently managed deployment of the application to the Google Play Store, handling release configuration and store compliance requirements.",
      },
    ],
  },
  {
    id: "exp.konstent",
    title: "Penetration Tester Intern",
    organization: "KONSTENT",
    location: "Udaipur, India",
    dates: "June 2025 - October 2025",
    bullets: [
      {
        id: "exp.konstent.b01",
        text: "Conducted black-box and grey-box web application penetration tests, identifying critical vulnerabilities including SQL injection, cross-site scripting, IDOR, and broken authentication using Burp Suite, Nmap, and Metasploit.",
      },
      {
        id: "exp.konstent.b02",
        text: "Produced CVSS-scored vulnerability reports with reproducible proof-of-concept exploits and prioritised remediation guidance aligned with OWASP and PTES methodologies.",
      },
      {
        id: "exp.konstent.b03",
        text: "Communicated technical findings to non-technical stakeholders and supported developers through remediation and retesting.",
      },
    ],
  },
  {
    id: "exp.l33tl3g10n",
    title: "Member, Coding and Programming Club",
    organization: "L33tL3g10n",
    affiliation: "Sir Padampat Singhania University",
    location: "Udaipur, India",
    dates: "September 2024 - May 2026",
    bullets: [
      {
        id: "exp.l33tl3g10n.b01",
        text: "Competed in Capture The Flag challenges spanning binary exploitation, cryptography, web exploitation, and algorithmic problem-solving; advanced to the National Coding League semi-finals.",
      },
    ],
  },
];

/** "SECURITY PROJECTS" section, in resume order. */
export const projects: readonly Project[] = [
  {
    id: "proj.aigisai",
    name: "AigisAI",
    subtitle: "A Zero-Trust Local Heuristic Engine for Unified Cyber Threat Detection",
    stack: ["Python", "Machine Learning", "Threat Intelligence"],
    year: "2026",
    bullets: [
      {
        id: "proj.aigisai.b01",
        text: "Built a local-first heuristic detection engine applying zero-trust principles to identify malicious behaviour without relying on cloud signatures or external lookups.",
      },
      {
        id: "proj.aigisai.b02",
        text: "Unified multiple detection signals into a single engine achieving 95% accuracy in flagging attack indicators in real time, modelling pipelines used in enterprise SOC environments.",
      },
    ],
  },
  {
    id: "proj.sentineltrace",
    name: "SentinelTrace",
    subtitle: "A Windows Red-Team Endpoint Monitoring and Exfiltration Simulator",
    stack: ["Python", "AES Encryption", "C2 Simulation"],
    year: "2024",
    bullets: [
      {
        id: "proj.sentineltrace.b01",
        text: "Developed a Windows monitoring agent replicating real-world attacker tradecraft, including keystroke capture, clipboard interception, and encrypted command-and-control exfiltration over Telegram, for authorised red-team simulation.",
      },
      {
        id: "proj.sentineltrace.b02",
        text: "Implemented encrypted-at-rest logging and covert operation to model data-theft techniques used in adversary emulation and detection testing within controlled laboratory environments.",
      },
    ],
  },
];

export const certifications: readonly Certification[] = [
  {
    id: "cert.defronix",
    name: "Defronix Certified Android Pentester",
    description:
      "Android application security, covering static and dynamic analysis, vulnerability assessment, and exploitation techniques.",
    status: "certified",
  },
  {
    id: "cert.ceh-oscp",
    name: "Certified Ethical Hacker (CEH) and Offensive Security Certified Professional (OSCP)",
    description: "in preparation.",
    status: "in preparation",
  },
];

export const achievements: readonly Bullet[] = [
  {
    id: "ach.tryhackme",
    text: "Ranked in the top 8% globally on TryHackMe, completing 51 rooms across offensive security, privilege escalation, and CTF-style challenges.",
  },
  {
    id: "ach.ncl",
    text: "National Coding League Semi-Finalist in a national-level competitive programming competition.",
  },
  {
    id: "ach.rbi90",
    text: "Selected as a state-level representative for Sir Padampat Singhania University at the Reserve Bank of India 90th anniversary quiz.",
  },
];

export const education: readonly Education[] = [
  {
    id: "edu.bca",
    qualification: "Bachelor of Computer Applications (BCA)",
    field: "Specialisation in Cybersecurity",
    institution: "Sir Padampat Singhania University",
    location: "Udaipur, India",
    dates: "August 2023 - July 2026",
  },
  {
    id: "edu.hsc",
    qualification: "Higher Secondary Certificate (Class 12)",
    field: "Commerce",
    institution: "Central Academy",
    location: "Udaipur, India",
    dates: "April 2022 - March 2023",
  },
];

export const languages: readonly Language[] = [
  { id: "lang.en", language: "English", proficiency: "Professional" },
  { id: "lang.hi", language: "Hindi", proficiency: "Native" },
];

export const resume = {
  identity,
  contact,
  summary,
  skills,
  experience,
  projects,
  certifications,
  achievements,
  education,
  languages,
} as const;
