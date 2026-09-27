# Resume content map

Every item on the resume, where it lives in the content module, and which site section will render it.

## Source

|                       |                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Authority             | `Ismail_Murtaza_Resume.pdf`, 2 pages (local original: `D:\Ismail_Murtaza_Resume.pdf`)     |
| Published copy        | `public/resume/Ismail_Murtaza_Resume.pdf` → served at `/resume/Ismail_Murtaza_Resume.pdf` |
| MD5 (original = copy) | `4b26b3d4d2952365fef98b3627e99dc3`                                                        |
| Facts module          | `src/content/resume.ts`                                                                   |
| UI labels module      | `src/content/site.ts` (nav, section chrome, CTAs, download path; no professional facts)   |

Other resume PDFs on disk (`C:\Users\ISMAIL\Downloads\…`, `D:\New folder\Ismail_Murtaza_Resume.pdf`, `D:\New folder\ismailmurtaza-portfolio\public\resume\…`) are **older versions**. They say "3 sites", "keylogger" and have no availability line. Do not use them.

### Transcription rules applied

- Text is verbatim. The only normalisation is joining PDF line wraps. Three hyphens fall at a line break and are kept because they are real compound hyphens: `self-reinstalling` (exp.brandskey.b01), `XML-RPC` (exp.brandskey.b07; spelled the same way unbroken in b08), `problem-solving` (exp.l33tl3g10n.b01).
- Date ranges keep the PDF's plain `-` separator. British spellings (`Analysed`, `behaviour`, `authorisation`, `optimisation`, `Specialisation`, `modelling`, `prioritised`, `unauthorised`) are intentional.
- The name is set in capitals on the PDF (`ISMAIL MURTAZA`) and is stored that way.
- `emphasis` marks the bold lead phrase on BrandsKey bullets b01–b07. This was read from the rendered page, because the text layer carries no font weight.
- Split fields (`title` / `organization` / `location` / `dates`, `name` / `subtitle` / `stack` / `year`, `qualification` / `field`) are mechanical splits of one printed line on `, `, `|`, `: ` or `-`. They reassemble to the printed line exactly.
- Link `href`s and `tel:` are derived by adding a scheme. The resume prints only the `display` text.

### Verification (2026-09-27)

A script normalised the `pdftotext` output of both pages, rebuilt every printed line from the module and checked each one as an exact substring. Result: **24/24 blocks verbatim, 27/27 bullets matched.** After removing all module text, only the 8 section headings remained, so nothing on either page is unmapped. It also confirmed that `AES-256`, `3 hacked` and `three compromised production` do not appear anywhere in the module.

## Sections

Implemented in step 2. The old anchors (`#top`, `#recon`, `#exploit`, `#report`) were replaced. The coverage tables below still use the step-1 keys; this is where each key now renders.

| Step-1 key    | Section (anchor)                                       | What renders it                                                                                             |
| ------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `hero`        | 01 Overview (`#overview`)                              | Name, headline, summary.s1, CTAs, availability, figures panel                                               |
| `about`       | 01 Overview profile strip; 06 Education (`#education`) | summary.s2–s4 next to the portrait; education and languages                                                 |
| `experience`  | 02 Professional Experience (`#experience`)             | Lead role header, "Development and delivery" (b09–b11), other roles with all bullets                        |
| `case-study`  | 02 Professional Experience                             | Featured BrandsKey entry: scope legend, then the optional sequence and additional sites (below)             |
| `projects`    | 03 Security Projects (`#projects`)                     | Large feature per project; AigisAI shows its 95% figure; verified demo/source links from `content/links.ts` |
| `skills`      | 04 Technical Skills (`#skills`)                        | Security tier (4 groups) and Engineering tier (3 groups), unrated                                           |
| `credentials` | 05 Certifications & Achievements (`#credentials`)      | Certifications with status badge; achievements; TryHackMe profile link                                      |
| `contact`     | 07 Contact (`#contact`)                                | Availability, email CTA, resume download, channels, location                                                |
| `global`      | `<head>`, header, footer                               | Title and description from identity/summary; header resume button                                           |

Rendering notes:

- The CEH/OSCP description ("in preparation.") is shown as its **In preparation** status badge rather than repeated as body text.
- `FigureText` sets stand-alone numbers (22, 2,895, 15+, 8%) in the primary text colour. The wording is never altered.
- `contact.phone` is rendered with a `tel:` link (Step 6). Every item in this map is now rendered; the Step 6 verifier found 144/144 required strings on the page.

## Coverage

P = page. Primary = where the full text is rendered. Secondary = may be excerpted there, verbatim, linking back.

### Header (P1)

| Resume item                                                  | Module              | Primary | Secondary                              |
| ------------------------------------------------------------ | ------------------- | ------- | -------------------------------------- |
| `ISMAIL MURTAZA`                                             | `identity.name`     | hero    | global (title, footer)                 |
| Penetration Tester \| Security Engineer \| Incident Response | `identity.headline` | hero    | global (meta title)                    |
| Udaipur, Rajasthan, India                                    | `identity.location` | contact | about                                  |
| +91-9587053147                                               | `contact.phone`     | contact | — (publishing is a decision, see plan) |
| ismailsuwasra@gmail.com                                      | `contact.email`     | contact | hero CTA                               |
| linkedin.com/in/ismail-murtaza                               | `contact.linkedin`  | contact | footer                                 |
| github.com/MintViper03                                       | `contact.github`    | contact | footer                                 |
| tryhackme.com/p/s0apEclipse                                  | `contact.tryhackme` | contact | credentials (next to ach.tryhackme)    |

### Professional summary (P1)

| Resume item                                                                                                                                   | Module                              | Primary | Secondary                       |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------- | ------------------------------- |
| "Offensive security practitioner with hands-on experience…"                                                                                   | `summary.sentences[0]` (summary.s1) | about   | hero, global (meta description) |
| "Investigated and remediated four compromised production environments…"                                                                       | `summary.sentences[1]` (summary.s2) | about   | hero (figure: four)             |
| "Combines an attacker mindset with full-stack development…"                                                                                   | `summary.sentences[2]` (summary.s3) | about   | —                               |
| "Certified Android Pentester, ranked in the top 8%… currently completing a BCA…"                                                              | `summary.sentences[3]` (summary.s4) | about   | —                               |
| Availability: "Open to full-time and internship opportunities from December 2026 (currently serving notice period, ending 30 November 2026)." | `summary.availability`              | about   | hero, contact                   |

### Technical skills (P1)

| Resume item                   | Module                     | Primary |
| ----------------------------- | -------------------------- | ------- |
| Offensive Security (6 items)  | `skills.offensive`         | skills  |
| Incident Response (5)         | `skills.incident-response` | skills  |
| Security Tools (10)           | `skills.tools`             | skills  |
| Frameworks and Standards (7)  | `skills.frameworks`        | skills  |
| Programming and Scripting (6) | `skills.programming`       | skills  |
| Development (10)              | `skills.development`       | skills  |
| Platforms and Systems (10)    | `skills.platforms`         | skills  |

### Professional experience (P1–P2)

| Resume item                                                                                                                   | Module               | Primary    | Secondary                      |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------- | ------------------------------ |
| Full Stack Developer and Security Engineer, BrandsKey Creative Studio, Udaipur, India, December 2025 - Present                | `exp.brandskey`      | experience | case-study (header)            |
| b01 production WordPress environment, ~ten months, self-reinstalling kit                                                      | `exp.brandskey.b01`  | case-study | experience                     |
| b02 reinfection source, scheduled-task loader, four payload copies                                                            | `exp.brandskey.b02`  | case-study | experience                     |
| b03 obfuscated PHP dropper, gzip/base64 staging, C2 behaviour                                                                 | `exp.brandskey.b03`  | case-study | experience                     |
| b04 persistence: REST API backdoor, 22 fake themes, 11 fake plugin dirs, rogue admin, stolen app password (5 months)          | `exp.brandskey.b04`  | case-study | experience                     |
| b05 SEO spam: 182 articles, 132 terms, 2,895 comments, hidden links, sitemap                                                  | `exp.brandskey.b05`  | case-study | experience                     |
| b06 WP-CLI checksums, core + 16 plugins, zero reinfection                                                                     | `exp.brandskey.b06`  | case-study | experience                     |
| b07 hardening: credential rotation, XML-RPC disabled, 2FA, off-server backups                                                 | `exp.brandskey.b07`  | case-study | experience                     |
| b08 three additional sites: outdated-plugin/XML-RPC entry, root webshell, 10 unauthorised admins, exfil script                | `exp.brandskey.b08`  | case-study | experience                     |
| b09 15+ production websites, sectors, stack, brandskey.in                                                                     | `exp.brandskey.b09`  | experience | hero (figure: 15+)             |
| b10 client communication, scoping, mentoring                                                                                  | `exp.brandskey.b10`  | experience | —                              |
| b11 lead-capture automation, CMS, animations, performance                                                                     | `exp.brandskey.b11`  | experience | —                              |
| Back End Developer (Freelance), Syncasist Business Solutions, Udaipur, India, August 2025 - April 2026                        | `exp.syncasist`      | experience | —                              |
| b01 grocery delivery backend, secure RESTful APIs (P1)                                                                        | `exp.syncasist.b01`  | experience | —                              |
| b02 security review and audit, injection/access-control flaws (P2)                                                            | `exp.syncasist.b02`  | experience | —                              |
| b03 Google Play Store deployment (P2)                                                                                         | `exp.syncasist.b03`  | experience | —                              |
| Penetration Tester Intern, KONSTENT, Udaipur, India, June 2025 - October 2025                                                 | `exp.konstent`       | experience | —                              |
| b01 black-box/grey-box web app tests, SQLi, XSS, IDOR, broken auth                                                            | `exp.konstent.b01`   | experience | —                              |
| b02 CVSS-scored reports, PoC exploits, OWASP/PTES                                                                             | `exp.konstent.b02`   | experience | —                              |
| b03 stakeholder communication, remediation, retesting                                                                         | `exp.konstent.b03`   | experience | —                              |
| Member, Coding and Programming Club, L33tL3g10n, Sir Padampat Singhania University, Udaipur, India, September 2024 - May 2026 | `exp.l33tl3g10n`     | experience | —                              |
| b01 CTF categories, National Coding League semi-finals                                                                        | `exp.l33tl3g10n.b01` | experience | credentials (links to ach.ncl) |

### BrandsKey incident grouping (step 4)

Stage names are interface labels (`site.ts` → `incidentStages`). Every bullet under them is rendered verbatim with its source reference (`sources.ts`, pages measured per page with pdftotext). Each BrandsKey bullet appears in exactly one group; a verifier checks this.

| Group (UI label)                         | Bullets       | Source            |
| ---------------------------------------- | ------------- | ----------------- |
| Primary compromise → Investigation       | b01, b02, b03 | p.1, bullets 1–3  |
| Primary compromise → Persistence Removal | b04           | p.1, bullet 4     |
| Primary compromise → Recovery            | b05, b06      | p.1, bullets 5–6  |
| Primary compromise → Hardening           | b07           | p.1, bullet 7     |
| Additional sites                         | b08           | p.1, bullet 8     |
| Development and delivery                 | b09, b10, b11 | p.1, bullets 9–11 |

The scope legend quotes three verbatim fragments: "four compromised production environments" (summary.s2), "a production WordPress environment compromised for approximately ten months" (b01) and "three additional compromised WordPress sites" (b08). Numbers keep their printed scope: ten months is the compromise duration, and no cleanup or monitoring length is stated.

Page placement of the other roles: Syncasist bullet 1 is on p.1 and bullets 2–3 are on p.2; KONSTENT and L33tL3g10n are on p.2.

### Security projects (P2)

| Resume item                                                                                                                              | Module                   | Primary                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------- |
| AigisAI: A Zero-Trust Local Heuristic Engine for Unified Cyber Threat Detection \| Python, Machine Learning, Threat Intelligence \| 2026 | `proj.aigisai`           | projects               |
| b01 local-first heuristic engine, zero-trust, no cloud signatures                                                                        | `proj.aigisai.b01`       | projects               |
| b02 unified signals, 95% accuracy, SOC pipelines                                                                                         | `proj.aigisai.b02`       | projects (figure: 95%) |
| SentinelTrace: A Windows Red-Team Endpoint Monitoring and Exfiltration Simulator \| Python, AES Encryption, C2 Simulation \| 2024        | `proj.sentineltrace`     | projects               |
| b01 monitoring agent, keystroke/clipboard, encrypted C2 over Telegram, authorised simulation                                             | `proj.sentineltrace.b01` | projects               |
| b02 encrypted-at-rest logging, covert operation, controlled lab                                                                          | `proj.sentineltrace.b02` | projects               |

### Certifications, achievements, education, languages (P2)

| Resume item                                                                                                 | Module                                    | Primary     | Secondary                                |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------- | ---------------------------------------- |
| Defronix Certified Android Pentester - Android application security…                                        | `cert.defronix` (status `certified`)      | credentials | about                                    |
| Certified Ethical Hacker (CEH) and Offensive Security Certified Professional (OSCP) - in preparation.       | `cert.ceh-oscp` (status `in preparation`) | credentials | — (never shown without "in preparation") |
| Top 8% globally on TryHackMe, 51 rooms                                                                      | `ach.tryhackme`                           | credentials | hero (figures: Top 8%, 51)               |
| National Coding League Semi-Finalist                                                                        | `ach.ncl`                                 | credentials | —                                        |
| State-level representative, SPSU, RBI 90th anniversary quiz                                                 | `ach.rbi90`                               | credentials | —                                        |
| BCA, Specialisation in Cybersecurity, SPSU, Udaipur, India, August 2023 - July 2026                         | `edu.bca`                                 | about       | —                                        |
| Higher Secondary Certificate (Class 12), Commerce, Central Academy, Udaipur, India, April 2022 - March 2023 | `edu.hsc`                                 | about       | —                                        |
| English (Professional)                                                                                      | `lang.en`                                 | about       | —                                        |
| Hindi (Native)                                                                                              | `lang.hi`                                 | about       | —                                        |

### Figures available for stat tiles

Each figure must be shown with wording traceable to its source item. Do not add new labels that restate the figure differently.

| Figure                                   | Source            |
| ---------------------------------------- | ----------------- |
| four compromised production environments | summary.s2        |
| approximately ten months                 | exp.brandskey.b01 |
| 22 / 11 / five months                    | exp.brandskey.b04 |
| 182 / 132 / 2,895                        | exp.brandskey.b05 |
| 16 plugins                               | exp.brandskey.b06 |
| 10 unauthorised administrator accounts   | exp.brandskey.b08 |
| 15+ production websites                  | exp.brandskey.b09 |
| 95% accuracy                             | proj.aigisai.b02  |
| top 8%, 51 rooms                         | ach.tryhackme     |
