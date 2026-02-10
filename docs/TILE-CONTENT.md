# Tile Content Types

Tile content components render config-driven data inside window types. Each tile reads from a specific section of `hyprfolio.config.yaml` and outputs formatted content that mimics a real Linux application.

## Table of Contents

- [Overview](#overview)
- [Tile Content Types](#tile-content-types)
  - [about](#about)
  - [experience](#experience)
  - [education](#education)
  - [skills](#skills)
  - [projects](#projects)
  - [certifications](#certifications)
  - [contact](#contact)
  - [custom](#custom)
- [Content-to-Application Mapping](#content-to-application-mapping)
- [Creating a New Tile Content Type](#creating-a-new-tile-content-type)

---

## Overview

The tile content resolver (`src/lib/tiles.ts`) maps the `content` field from each tile definition to a component:

```yaml
tiles:
  - content: about # <-- resolved to AboutTile.astro
    windowType: terminal
```

Tile components live in `src/tiles/` and follow the naming convention `{Name}Tile.astro`. Each component:

1. Imports `loadConfig()` from `src/lib/config.ts`
2. Reads the relevant config section in frontmatter
3. Renders formatted HTML that matches the window type's aesthetic

---

## Tile Content Types

### about

**Component**: `src/tiles/AboutTile.astro`
**Config section**: `profile`, `about`, `social`
**Mimics**: neofetch (system information tool)
**Recommended window type**: `terminal`

Renders a neofetch-style display with ASCII art (optional), system info key-value pairs, bio text, fun facts, and social links.

#### Fields used

From `profile`:

| Field      | Type     | Description                                                       |
| ---------- | -------- | ----------------------------------------------------------------- |
| `name`     | `string` | Displayed as the "user@hostname" header.                          |
| `headline` | `string` | Shown below the name.                                             |
| `photo`    | `string` | Profile image path (displayed as ASCII art placeholder or image). |

From `about`:

| Field        | Type                     | Description                                                           |
| ------------ | ------------------------ | --------------------------------------------------------------------- |
| `ascii`      | `string`                 | Custom ASCII art displayed beside system info.                        |
| `bio`        | `string`                 | Bio paragraph below the system info block.                            |
| `funFacts`   | `string[]`               | Displayed as bullet points.                                           |
| `systemInfo` | `Record<string, string>` | Key-value pairs displayed like neofetch output (e.g., OS, WM, Shell). |

From `social`:

| Field      | Type     | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `network`  | `string` | Network name used as label.                    |
| `url`      | `string` | Link URL.                                      |
| `username` | `string` | Displayed if provided, otherwise URL is shown. |

#### Example config

```yaml
about:
  bio: 'Cybersecurity engineer at Allsafe Cybersecurity, specializing in penetration testing and vulnerability research.'
  funFacts:
    - 'Kali Linux is my daily driver — has been for years'
    - 'I route everything through Tor out of principle'
  systemInfo:
    Location: 'New York, NY'
    Specialization: 'Penetration Testing'
    Clearance: 'root'
    Uptime: '7y in cybersec'

tiles:
  - content: about
    windowType: terminal
    colSpan: 7
    rowSpan: 2
    terminalTitle: 'neofetch — kitty'
```

#### Visual output

```
elliot@hyprfolio
─────────────
Location:       New York, NY
Specialization: Penetration Testing
Clearance:      root
Uptime:         7y in cybersec

Cybersecurity engineer at Allsafe Cybersecurity, specializing
in penetration testing and vulnerability research.

  * Kali Linux is my daily driver — has been for years
  * I route everything through Tor out of principle
```

---

### experience

**Component**: `src/tiles/ExperienceTile.astro`
**Config section**: `experience`
**Mimics**: git log (version control history)
**Recommended window type**: `terminal`

Renders work experience as git commit history. Each position is a "commit" with company as author, date as timestamp, and highlights as the commit message.

#### Fields used

| Field        | Type       | Description                                    |
| ------------ | ---------- | ---------------------------------------------- |
| `company`    | `string`   | Shown as the commit author.                    |
| `position`   | `string`   | Shown as the commit subject line.              |
| `url`        | `string`   | Links the company name.                        |
| `startDate`  | `string`   | Start date formatted as commit timestamp.      |
| `endDate`    | `string`   | End date (or "Present" if `current` is true).  |
| `current`    | `boolean`  | Marks the position as ongoing. Shown as HEAD.  |
| `summary`    | `string`   | Commit message body.                           |
| `highlights` | `string[]` | Displayed as bullet points in the commit body. |
| `location`   | `string`   | Displayed alongside the date.                  |

#### Example config

```yaml
experience:
  - company: 'Allsafe Cybersecurity'
    position: 'Cybersecurity Engineer'
    startDate: '2014-03'
    current: true
    summary: 'Senior security engineer protecting Fortune 500 clients from cyber threats.'
    highlights:
      - 'Detected and mitigated a critical rootkit on E Corp servers'
      - 'Performed penetration testing across client networks'
    location: 'New York, NY'

tiles:
  - content: experience
    windowType: terminal
    colSpan: 6
    rowSpan: 2
    terminalTitle: 'git log — kitty'
```

#### Visual output

```
commit a1b2c3d (HEAD -> main)
Author: Allsafe Cybersecurity
Date:   Mar 2014 — Present

    Cybersecurity Engineer

    * Detected and mitigated a critical rootkit on E Corp servers
    * Performed penetration testing across client networks
```

---

### education

**Component**: `src/tiles/EducationTile.astro`
**Config section**: `education`
**Mimics**: man page (manual pages)
**Recommended window type**: `terminal`

Renders education as a Unix man page with sections for institution, degree, dates, courses, and honors.

#### Fields used

| Field         | Type       | Description                                    |
| ------------- | ---------- | ---------------------------------------------- |
| `institution` | `string`   | Shown as the man page title/name.              |
| `area`        | `string`   | Field of study, shown in the NAME section.     |
| `studyType`   | `string`   | Degree type (e.g., "B.S."), shown before area. |
| `startDate`   | `string`   | Start date.                                    |
| `endDate`     | `string`   | End/graduation date.                           |
| `gpa`         | `string`   | GPA if provided.                               |
| `courses`     | `string[]` | Listed under a COURSES section.                |
| `honors`      | `string[]` | Listed under an HONORS section.                |
| `url`         | `string`   | Links the institution name.                    |

#### Example config

```yaml
education:
  - institution: 'Offensive Security'
    area: 'Penetration Testing with Kali Linux'
    studyType: 'Professional Training'
    startDate: '2012'
    endDate: '2013'
    courses:
      - 'Exploit Development'
      - 'Web Application Attacks'
      - 'Privilege Escalation'

tiles:
  - content: education
    windowType: terminal
    colSpan: 6
    rowSpan: 1
    terminalTitle: 'man education — kitty'
```

#### Visual output

```
Offensive Security
Professional Training — Penetration Testing with Kali Linux
2012 — 2013

Exploit Development, Web Application Attacks, Privilege Escalation
```

---

### skills

**Component**: `src/tiles/SkillsTile.astro`
**Config section**: `skills`
**Mimics**: btop (system resource monitor)
**Recommended window type**: `system-monitor`

Renders skills as colored progress bars grouped by category, resembling CPU/memory usage bars in btop.

#### Fields used

From `SkillCategory`:

| Field      | Type          | Description                                 |
| ---------- | ------------- | ------------------------------------------- |
| `category` | `string`      | Category heading (e.g., "Cloud Platforms"). |
| `skills`   | `SkillItem[]` | Array of skills in this category.           |

From `SkillItem`:

| Field   | Type        | Description                                                          |
| ------- | ----------- | -------------------------------------------------------------------- |
| `name`  | `string`    | Skill label shown beside the bar.                                    |
| `tier`  | `SkillTier` | Proficiency tier: `familiar`, `proficient`, `advanced`, or `expert`. |
| `color` | `string`    | Optional color override for the bar.                                 |

#### Example config

```yaml
skills:
  - category: 'Offensive Security'
    skills:
      - name: 'Penetration Testing'
        tier: expert
      - name: 'Exploit Development'
        tier: expert
      - name: 'Reverse Engineering'
        tier: advanced

  - category: 'Systems & Tools'
    skills:
      - name: 'Linux'
        tier: expert
      - name: 'Metasploit'
        tier: expert

tiles:
  - content: skills
    windowType: system-monitor
    colSpan: 5
    rowSpan: 2
    title: 'Skills Monitor'
```

#### Visual output

```
Offensive Security
  Penetration Testing  [████████████████████] expert
  Exploit Development  [████████████████████] expert
  Reverse Engineering  [████████████████░░░░] advanced

Systems & Tools
  Linux                [████████████████████] expert
  Metasploit           [████████████████████] expert
```

---

### projects

**Component**: `src/tiles/ProjectsTile.astro`
**Config section**: `projects`
**Mimics**: Thunar (XFCE file manager)
**Recommended window type**: `file-manager`

Renders projects as a file manager with folder icons, project names, and metadata in a grid or list layout. Featured projects may be highlighted.

#### Fields used

| Field          | Type       | Description                                         |
| -------------- | ---------- | --------------------------------------------------- |
| `name`         | `string`   | Project name, shown as folder/file name.            |
| `description`  | `string`   | Short description shown on hover or in detail view. |
| `url`          | `string`   | Links to the project.                               |
| `image`        | `string`   | Project thumbnail or icon.                          |
| `technologies` | `string[]` | Shown as tags or file type indicators.              |
| `highlights`   | `string[]` | Key features shown in detail view.                  |
| `startDate`    | `string`   | Displayed as creation date.                         |
| `endDate`      | `string`   | Displayed as modification date.                     |
| `featured`     | `boolean`  | Featured projects may be displayed larger or first. |

#### Example config

```yaml
projects:
  - name: 'fsociety-tools'
    description: 'Collection of custom penetration testing and network reconnaissance utilities.'
    url: 'https://github.com/mr-robot-00/fsociety-tools'
    technologies: [Python, C, Shell]
    highlights:
      - 'Custom exploit frameworks'
      - 'Network enumeration automation'
    featured: true

  - name: 'dotfiles'
    description: 'My Kali Linux rice. Paranoid-grade development environment.'
    url: 'https://github.com/mr-robot-00/dotfiles'
    technologies: [Shell, Lua, Python]
    featured: true

tiles:
  - content: projects
    windowType: file-manager
    colSpan: 6
    rowSpan: 1
    title: 'Projects'
```

#### Visual output

```
 Bookmarks        | Name            Size     Type
 ─────────        | ──────────────  ───────  ──────
  Home            |  fsociety-tools Python  ★ Featured
  Projects        |  cryptwall     Python   ★ Featured
  Downloads       |  dotfiles      Shell
                  |  netwatch      C
```

---

### certifications

**Component**: `src/tiles/CertificationsTile.astro`
**Config section**: `certifications`
**Mimics**: pass (Unix password manager tree)
**Recommended window type**: `terminal`

Renders certifications as a tree hierarchy, similar to the `pass` password store tree output.

#### Fields used

| Field        | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `name`       | `string` | Certification name, shown as tree node.              |
| `issuer`     | `string` | Issuing organization, shown as tree parent or label. |
| `date`       | `string` | Date earned, shown alongside name.                   |
| `expiryDate` | `string` | Expiration date if applicable.                       |
| `url`        | `string` | Links the certification for verification.            |
| `id`         | `string` | Certification ID shown as metadata.                  |

#### Example config

```yaml
certifications:
  - name: 'Offensive Security Certified Professional (OSCP)'
    issuer: 'Offensive Security'
    date: '2013-08'
    id: 'OSCP-2013'

  - name: 'Certified Ethical Hacker (CEH)'
    issuer: 'EC-Council'
    date: '2012-04'
    id: 'CEH-2012'

  - name: 'CompTIA Security+'
    issuer: 'CompTIA'
    date: '2011-06'
    id: 'SEC-PLUS-2011'

tiles:
  - content: certifications
    windowType: terminal
    colSpan: 6
    rowSpan: 1
    terminalTitle: 'certifications — kitty'
```

#### Visual output

```
Certifications
├── Offensive Security
│   └── OSCP (2013)
├── EC-Council
│   └── Certified Ethical Hacker (2012)
└── CompTIA
    ├── Security+ (2011)
    └── Network+ (2010)
```

---

### contact

**Component**: `src/tiles/ContactTile.astro`
**Config section**: `contact`, `social`
**Mimics**: aerc (terminal email client)
**Recommended window type**: `terminal`

Renders contact information as an email compose view, with fields for To, From, Subject, and a message body. Social links appear as additional contact methods.

#### Fields used

From `contact`:

| Field              | Type     | Description                                          |
| ------------------ | -------- | ---------------------------------------------------- |
| `email`            | `string` | Shown in the "To:" field.                            |
| `phone`            | `string` | Listed as a contact method.                          |
| `location`         | `string` | Shown as location info.                              |
| `availability`     | `string` | Displayed as status (e.g., "Open to opportunities"). |
| `preferredContact` | `string` | Highlighted contact method.                          |
| `message`          | `string` | Pre-filled email body text.                          |

From `social`:

| Field      | Type     | Description                       |
| ---------- | -------- | --------------------------------- |
| `network`  | `string` | Network name as label.            |
| `url`      | `string` | Social profile link.              |
| `username` | `string` | Displayed alongside network name. |

#### Example config

```yaml
contact:
  email: 'elliot@protonmail.ch'
  location: 'New York, NY'
  availability: 'Selective engagements only'
  preferredContact: 'email'
  message: 'Hello, friend.'

social:
  - network: GitHub
    url: 'https://github.com/mr-robot-00'
    username: mr-robot-00

tiles:
  - content: contact
    windowType: terminal
    colSpan: 6
    rowSpan: 1
    terminalTitle: 'aerc — kitty'
```

#### Visual output

```
To:      elliot@protonmail.ch
Subject: Let's connect

Hello, friend.

── Contact ──────────────────
  Location:   New York, NY
  Status:     Selective engagements only

── Social ───────────────────
  GitHub:     mr-robot-00
```

---

### custom

**Component**: `src/tiles/CustomTile.astro`
**Config section**: `custom` (array), or inline via tile props
**Mimics**: Varies (depends on window type)
**Recommended window type**: Any

A flexible tile for content that does not fit predefined types. Content can come from the `custom` config section, or inline via `customContent` (plain text) or `customHtml` (raw HTML) tile props.

#### Fields used

From tile definition:

| Field           | Type     | Description                                  |
| --------------- | -------- | -------------------------------------------- |
| `customContent` | `string` | Plain text content rendered inside the tile. |
| `customHtml`    | `string` | Raw HTML content rendered inside the tile.   |

From `custom` config section (if using structured data):

| Field           | Type     | Description    |
| --------------- | -------- | -------------- |
| `title`         | `string` | Section title. |
| `icon`          | `string` | Optional icon. |
| `items[].label` | `string` | Item label.    |
| `items[].value` | `string` | Item value.    |
| `items[].url`   | `string` | Optional link. |

#### Example config (inline content)

```yaml
tiles:
  - content: custom
    windowType: blank
    colSpan: 12
    rowSpan: 1
    customHtml: |
      <div style="text-align: center; padding: 2rem;">
        <h2>Welcome to my portfolio</h2>
        <p>Scroll down to explore</p>
      </div>
```

#### Example config (structured custom section)

```yaml
custom:
  - title: 'Open Source Contributions'
    items:
      - label: 'Kubernetes'
        value: 'Core contributor since v1.20'
        url: 'https://github.com/kubernetes/kubernetes'
      - label: 'Terraform AWS Provider'
        value: '15 merged PRs'

tiles:
  - content: custom
    windowType: terminal
    colSpan: 6
    rowSpan: 1
    terminalTitle: 'contributions'
```

---

## Content-to-Application Mapping

Reference table showing the recommended pairing of content types with window types and the Linux application they mimic:

| Content          | Linux App | Window Type      | Visual Style            |
| ---------------- | --------- | ---------------- | ----------------------- |
| `about`          | neofetch  | `terminal`       | ASCII art + system info |
| `experience`     | git log   | `terminal`       | Commit history          |
| `education`      | man page  | `terminal`       | Manual page             |
| `skills`         | btop      | `system-monitor` | Progress bars           |
| `projects`       | Thunar    | `file-manager`   | Folder grid + sidebar   |
| `certifications` | pass      | `terminal`       | Tree hierarchy          |
| `contact`        | aerc      | `terminal`       | Email compose           |
| `custom`         | (varies)  | Any              | User-defined            |

These are recommendations, not requirements. Any content type can be paired with any window type.

---

## Creating a New Tile Content Type

### Step 1: Create the component

Create a new `.astro` file in `src/tiles/`:

```astro
---
// src/tiles/MyTile.astro
import { loadConfig } from '@/lib/config';

const config = loadConfig();
const myData = config.mySection; // Read from your config section
---

<div class="my-tile terminal-text">
  {
    myData.map((item) => (
      <div class="my-tile-item">
        <span style={`color: var(--hp-green);`}>{item.name}</span>
        <span style={`color: var(--hp-subtext-0);`}>{item.description}</span>
      </div>
    ))
  }
</div>

<style>
  .my-tile {
    padding: 12px;
  }
  .my-tile-item {
    margin-bottom: 8px;
  }
</style>
```

### Step 2: Register in the resolver

Add an entry to `src/lib/tiles.ts`:

```typescript
export const tileComponents: Record<TileContent, ComponentLoader> = {
  about: () => import('@/tiles/AboutTile.astro'),
  // ... existing entries
  'my-tile': () => import('@/tiles/MyTile.astro'),
};
```

Also add the new type to `TileContentEnum` in `src/lib/schema.ts`:

```typescript
export const TileContentEnum = z.enum([
  'about',
  'experience',
  // ... existing types
  'my-tile',
]);
```

### Step 3: Use in config

If your tile reads from a new config section, add the Zod schema first (see [CONFIG-REFERENCE.md](./CONFIG-REFERENCE.md#custom)):

```yaml
tiles:
  - content: my-tile
    windowType: terminal
    colSpan: 6
    rowSpan: 1
    terminalTitle: 'my-app'
```
