# Build prompt — Traders at Carolina website

> Paste everything below the line into Claude (Claude Code works best, since it can create the project files and run it). Before you do, replace every `{{FILL_IN}}` in the **Project facts** block. Anything left as `[BRACKETS]` inside the copy is placeholder text the site should show until the club replaces it.

---

You are building the production website for **Traders at Carolina**, UNC Chapel Hill's student-run quantitative finance club. Build the complete, working site described below — every page, component, style and data file — so it can be deployed as-is. Don't stop at a scaffold or leave TODOs in code; if a fact is missing, use the bracketed placeholder text given here.

## Project facts (fill these in)

- Interest form (Google Form) URL: `{{GOOGLE_FORM_URL}}`
- Instagram URL: `{{INSTAGRAM_URL}}`
- LinkedIn URL: `{{LINKEDIN_URL}}`
- Club email: `{{CLUB_EMAIL}}`
- Meeting day / time / room: `{{WEEKDAY}}`, `{{TIME}}`, `{{BUILDING_ROOM}}`
- Recruiting cycles: `{{e.g. fall and spring}}`
- Stats: semesters running `{{N}}`, members & alumni `{{N}}`, firms hosted `{{N}}`
- Hosting target: `{{Vercel | GitHub Pages | Netlify | existing domain}}`
- Login behaviour: `{{see "Log in" section — pick option A, B or C}}`
- Assets folder I will provide: `/public/images` containing hero gallery photos, program photos, board/member headshots, and `firm-logos.png`

## Tech stack

- **Astro** (static output) with plain CSS using custom properties. No CSS framework, no UI library.
- All editable content lives in `src/data/*.json` (schemas below) so club officers can update the site without touching layout code.
- Fully static and fast: no client JS except the small scripts noted (mobile nav toggle, gallery crossfade, past-semester accordion).
- Include a `README.md` that explains, in plain language for non-developers: how to run locally, how to edit each JSON file, how to add photos/headshots, and how to deploy to the hosting target above.

## Design system

**Feel:** editorial, calm and confident — white pages, generous whitespace, a serif for headings, a clean geometric sans for everything else, navy and royal-blue accents, photos with a dark navy overlay. It must *not* look like a template (no gradients, no rounded "SaaS" cards, no emoji, no drop shadows beyond a 1px border).

**Colors (CSS variables):**
```
--navy:        #263262   /* fills: primary buttons, closing bands, overlay tint */
--blue:        #3657B0   /* highlights: links, active nav, step numbers, tags, dates */
--ink:         #161616   /* headings and primary text */
--body:        #4A4A4A   /* paragraph text */
--muted:       #5A5A5A   /* labels, captions */
--rule:        #E3E5EB   /* 1px dividers and card borders */
--wash:        #F6F7FA   /* alternate section background */
--white:       #FFFFFF   /* page background */
--overlay:     rgba(28, 36, 74, 0.6)  /* over all hero/header photo galleries */
--soon-bg:     #FBE9E2;  --soon-fg: #9A3412   /* "closing soon" chips */
--chip-bg:     #EEF1F8;  --chip-fg: #263262   /* normal deadline chips */
```
All text must meet WCAG AA contrast.

**Typography:**
- Headings, the wordmark, large numerals: **Crimson Pro** 400 (Google Fonts).
- Everything else (body, nav, buttons, forms): **Clarity City** 400/500/600 — self-host the WOFF2 files from the official open-source repo `github.com/vmware/clarity-city` (SIL OFL). Include the license file.
- Small uppercase labels (section numbers like "01 / ABOUT", tags, resource types): **IBM Plex Mono** 400, letter-spacing ~0.16em.
- Scale: hero title `clamp(56px, 8vw, 116px)`; page titles `clamp(48px, 6vw, 84px)`; section headings `clamp(36px, 5vw, 60px)`; body 17–18px / line-height 1.7.

**Layout & components:**
- Content max-width 1240px, 32px side padding (16px on phones). Sections ~112px vertical padding.
- **Section label rail:** on the home page each section has a left column (200px) with a 2px top rule, a mono number ("01") and a mono uppercase label ("ABOUT"); content sits in the right column. Stacks on mobile.
- **Buttons:** square corners. Primary = navy fill, white text, uppercase, letter-spacing 0.06em, 16px×28px padding. On dark bands: white fill with navy text, or a 1px white outline.
- **Tags:** "OPEN TO ALL" = 1px blue outline, blue text; "MEMBERS ONLY" = navy fill, white text.
- **Photo gallery header:** a CSS grid mosaic of photos (object-fit: cover, 6px gaps) under the navy overlay, with text on top. Home uses a 6×4 mosaic of ~14 tiles in mixed spans; inner pages use a 5-tile strip ~420px tall. Photos slowly crossfade between images every ~6s (respect `prefers-reduced-motion`).
- **Nav (every page):** white bar, 1px bottom rule. Left: "Traders at Carolina" wordmark in Crimson Pro 26px → home. Right: `Members`, `Programs`, `Recruiting`, `Log in`, and a navy `JOIN` button → Google Form (opens in new tab). Active page is blue, semibold, underlined. Collapses to a hamburger menu under 768px.
- **Footer (every page):** "Traders at Carolina · Chapel Hill" left; Instagram and LinkedIn links right.
- Everything is responsive down to 360px wide with no horizontal scroll. Use semantic HTML, real `<a>`/`<button>` elements, visible focus states, alt text on all images, and `aria-label` on icon-only links.

## Pages

### 1. Home (`/`)
1. **Hero:** full-width photo mosaic (min-height ~760px) under the overlay. Centered: H1 "Traders at Carolina" (Crimson Pro, white); subline "UNC's quantitative finance club."; two buttons — `RECRUITING TIMELINE` (white fill, blue text → `#recruiting`) and `JOIN US` (white outline → Google Form).
2. **01 / ABOUT:** H2 "A home for quantitative thinkers at UNC." then these two paragraphs:
   - "Most students hear about quantitative trading long after they could have started preparing for it. Traders at Carolina exists to close that gap. We're a student-run community of mathematicians, computer scientists, economists and the merely curious, and we meet every week to work through the probability, market intuition and problem solving that trading and research roles demand."
   - "You don't need a finance background to join. Our members come from every major, and most of them learned what a bid and an ask were here. What they share is an appetite for hard problems and a willingness to think out loud with others."
   - Then a 3-up stats row above a 1px rule: large Crimson numerals + mono labels: SEMESTERS RUNNING, MEMBERS & ALUMNI, FIRMS HOSTED.
3. **02 / PROGRAMS:** three alternating photo/text rows (photo left, then right, then left), each with an H3 and paragraph — no "learn more" links:
   - **Weekly Sessions** — "Every [WEEKDAY] at [TIME], members work through a structured curriculum that starts from first principles: probability and expected value, then betting and market making, then options intuition and the mental math interviewers expect. Each session pairs a short lesson with problems you solve in small groups, so you leave with practice, not just notes."
   - **[Carolina Trading Challenge]** — "Once a year we turn a room into a trading floor. Teams make markets, manage risk and react to news in live simulated rounds designed with our partner firms. It's open to students across [SCHOOLS], beginners are welcome, and the best teams walk away with [PRIZES] and a story for their next interview."
   - **Speaker Nights** — "Traders, researchers and engineers from firms like [FIRMS] come to campus to talk about what the work actually looks like day to day. The format is small and informal: a short talk, open questions, and time afterward to meet people who were sitting where you are not long ago."
4. **03 / RECRUITING** (`id="recruiting"`): H2 "Recruiting timeline", intro "We take new members each [fall and spring]. Here's how the process works, start to finish." Then a 4-step horizontal timeline (stacks on mobile): each step has a 2px blue top line with a 14px blue dot at its left end, a large blue Crimson numeral (56px), an H3 and a description. **No dates.**
   - 01 **Coffee chats & info session** — "Meet current members one on one, then come to our info session to hear what a semester with the club looks like and ask anything."
   - 02 **Written application** — "A short application with a few questions about why you are interested and a handful of probability and logic problems. No finance knowledge expected."
   - 03 **Interview** — "A conversation with two board members: some questions about you, and a problem or two worked through together out loud."
   - 04 **Final results** — "Everyone who applies hears back by email. New members are welcomed at our first session of the semester."
5. **Closing band:** navy background, H2 "No finance background required." (white) and a white `JOIN US` button → Google Form.

### 2. Members (`/members`)
1. **Header:** 5-photo gallery strip under the overlay; H1 "Our people" (white, bottom-left).
2. **Where our members go:** centered H2 "Where our members go", paragraph "Traders at Carolina members and alumni have gone on to trading, research and engineering roles at some of the best firms in the industry. Here are a few of them." Then one full-width image: `/images/firm-logos.png` (alt text lists the firms).
3. **Executive Board:** centered H2; grid of cards, **4 per row** on desktop (2 on tablet, 1–2 on phone). Card: square headshot, name (Crimson 21px), role (blue, 14px, 500), then LinkedIn and email icon links (outline-style SVG icons, 32px hit area, `aria-label`).
4. **Members:** centered H2; same 4-per-row grid; card = headshot, name, LinkedIn + email icons (no role).
5. **Closing band:** navy, just the text "Carolina Investment Group" in Crimson Pro, white. No button.
- Driven by `src/data/members.json`. Cards without a headshot show a neutral navy-grey placeholder with initials.

### 3. Programs (`/programs`)
1. **Header:** gallery strip (~360px), H1 "Programs", subline "What we're hosting, plus every deadline and opportunity worth knowing about."
2. **What we're hosting:** H2 with a mono "FALL 2026" label right-aligned. 3-up grid of cards (1px border, border turns blue on hover): 16:9 photo, mono blue date + tag, Crimson title, one-line description, location/time, "RSVP →". Whole card is a link.
3. **Opportunities board** (on the `--wash` background): H2 "Opportunities board", intro "Sign-up deadlines, competitions open to every student, and industry events, kept up to date by the board. Click any card to go straight to it." Then **three columns** (stack on mobile), each with a header (title + item count) over a 2px navy rule:
   - **Sign-up deadlines** — e.g. coffee chat sign-ups, info session RSVP, Trading Challenge team registration, mock interview night sign-up.
   - **Open competitions** — trading/quant competitions any student can enter.
   - **Industry events** — firm info sessions on campus, virtual Q&As, etc.
   - Each item is a white link card: title (semibold), organiser/format line (muted), a deadline chip in mono ("Closes Oct 10", "Register by Oct 30"), and a small ↗ arrow; opens in a new tab. **Chips automatically turn orange (`--soon`) when the deadline is within 7 days**, and items whose deadline has passed are hidden — compute this at build time from ISO dates in the JSON and also re-check client-side on load so the board stays correct between deploys.
4. **Prep resources:** H2 "Prep resources", "Free and open to everyone, no account needed." A two/three-column list of link rows: Crimson title, mono blue type label, → arrow. Items: Probability primer (PDF), Brainteaser collection (Problem set), Mental math practice (Drill), Market-making basics (Guide), Interview playbook (Guide), Reading list (List).
5. **Closing band:** navy, "Interested in becoming a member?" + white `INTEREST FORM ↗` button → Google Form.
- Driven by `src/data/events.json`, `src/data/board.json`, `src/data/resources.json`.

### 4. Log in (`/login`)
Split screen, full viewport height, no standard nav. Left half: 3×3 photo mosaic under the overlay, wordmark top-left → home, bottom-left H2 "Members' area" and "Session slides, the problem bank, mock interview sign-ups and everything else for current members." Right half, centered 400px column: H1 "Log in", "Welcome back.", fields **UNC email** (placeholder `onyen@unc.edu`) and **Password** with "Forgot password?" link, "Keep me signed in" checkbox, navy `LOG IN` button, an "or" divider, an outline "Continue with UNC Onyen" button, and "Not a member yet? Fill out our interest form ↗" → Google Form. Stacks vertically on mobile (photo panel shortened to ~360px).

Implement login per the option chosen in Project facts:
- **A — Design only:** build the page; the form does nothing yet. Add a clearly marked integration point in code and explain options in the README.
- **B — Supabase/Firebase auth:** email + password auth restricted to `@unc.edu` addresses, plus a protected `/members-area` page listing member resources (links from `src/data/member-resources.json`).
- **C — Redirect:** the "Log in" button simply links to `{{MEMBERS_PORTAL_URL}}` (e.g. a shared Google Drive).

## Data files (create with realistic placeholder entries)

```jsonc
// src/data/site.json
{ "googleFormUrl": "", "instagram": "", "linkedin": "", "email": "",
  "meeting": { "day": "", "time": "", "room": "" },
  "stats": { "semesters": "[N]", "membersAlumni": "[N]+", "firmsHosted": "[N]" },
  "currentTerm": "FALL 2026" }

// src/data/members.json
{ "board":   [{ "name": "", "role": "President", "photo": "/images/people/x.jpg", "linkedin": "", "email": "" }],
  "members": [{ "name": "", "photo": "", "linkedin": "", "email": "" }] }

// src/data/events.json  — "What we're hosting"
[{ "date": "2026-10-14", "title": "Fall info session", "tag": "open" /* or "members" */,
   "description": "", "location": "", "time": "", "photo": "", "rsvpUrl": "" }]

// src/data/board.json  — Opportunities board
[{ "column": "signups" /* | "competitions" | "industry" */, "title": "", "org": "",
   "deadline": "2026-10-10", "deadlineLabel": "Closes" /* or "Register by" */, "url": "" }]

// src/data/resources.json
[{ "title": "Probability primer", "type": "PDF", "url": "/resources/probability-primer.pdf" }]
```
Past events (deadline/date in the past) are hidden automatically.

## Acceptance checklist
- All four pages render with the exact colors, fonts, copy and section order above.
- Every JOIN / JOIN US / interest-form link points to the Google Form and opens in a new tab.
- Nav active states correct; mobile menu works; no horizontal scroll at 360px.
- Board chips turn orange within 7 days of a deadline; expired items disappear.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on every page.
- README lets a non-developer update members, events, the board and resources, and deploy.
