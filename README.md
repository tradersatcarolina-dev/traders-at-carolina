# Traders at Carolina — website

The website for Traders at Carolina, UNC Chapel Hill's quantitative finance club. It's built with [Astro](https://astro.build) and produces a plain static site with no database and no server.

**Most updates only need editing a text file in `src/data/`.** You don't need to touch any layout code.

---

## 1. Running the site on your computer

You only need this to preview changes before you publish them.

1. Install **Node.js** (version 20 or newer) from <https://nodejs.org>. Pick the "LTS" download.
2. Open a terminal in this folder and run:
   ```bash
   npm install      # first time only
   npm run dev
   ```
3. Open <http://localhost:4321> in your browser. The page reloads whenever you save a file.
4. Press `Ctrl + C` in the terminal to stop it.

To build the final site, run `npm run build`. The finished site is written to the `dist/` folder.

---

## 2. Editing content

All content lives in `src/data/`. These are **JSON** files, so a few rules apply:

- Text goes in `"double quotes"`.
- Items in a list are separated by commas, and the **last item has no comma** after it.
- Dates are always written `"YYYY-MM-DD"`, for example `"2026-10-14"`.
- If the site stops building after an edit, paste the file into <https://jsonlint.com> to find the typo.

Anything still shown in `[square brackets]` on the site is placeholder text waiting to be replaced.

### `site.json`: links, meeting info, stats

| Field | What it controls |
|---|---|
| `googleFormUrl` | Every JOIN / JOIN US / Interest form button |
| `instagram`, `linkedin` | Footer links |
| `email` | Club email (used by "Forgot password?") |
| `meeting.day`, `meeting.time`, `meeting.room` | Meeting details (not currently shown; the Weekly Sessions text is written in `src/pages/index.astro`, under `programRows`) |
| `recruitingCycles` | "We take new members each …" on the home page, e.g. `"fall and spring"` |
| `recruitingStatus` | The line under "Recruiting timeline" on the home page. While `open` is `false` it shows `message` (currently "Recruiting closed."). Set `open` to `true` to show "We take new members each …" instead. |
| `stats` | The two big numbers on the home page: `semesters` (Semesters running) and `members` (Members) |
| `currentTerm` | The label next to "What we're hosting", e.g. `"FALL 2026"` |
| `firmLogosAlt` | The description of the placements image, read aloud by screen readers. List the firms shown in the image. |
| `gallery` | The list of photos used in every header mosaic |

### `members.json`: board and members

```json
{
  "board": [
    { "name": "Jane Doe", "role": "President", "photo": "/images/people/jane-doe.jpg",
      "linkedin": "https://www.linkedin.com/in/janedoe", "email": "jdoe@unc.edu" }
  ],
  "members": [
    { "name": "John Smith", "photo": "", "linkedin": "", "email": "jsmith@unc.edu" }
  ]
}
```

- People appear in the order you list them.
- Leave `photo` empty (`""`) to show a placeholder with the person's initials.
- Leave `linkedin` or `email` empty to hide that icon.

### `events.json`: "What we're hosting" (Programs page)

```json
{ "date": "2026-10-14", "title": "Fall info session", "tag": "open",
  "description": "One sentence.", "location": "Phillips 215", "time": "6:00 PM",
  "photo": "/images/events/info-session.jpg", "rsvpUrl": "https://forms.gle/..." }
```

- `tag` is `"open"` (shows **OPEN TO ALL**) or `"members"` (shows **MEMBERS ONLY**).
- Events are sorted by date, and **past events disappear automatically**.
- For an event with no details yet, you can leave out `date`, `tag`, `location`, `time` and `rsvpUrl`. The card then shows **DATE TBA** and isn't clickable until you add an `rsvpUrl`.

### `board.json`: Opportunities board (Programs page)

```json
{ "column": "signups", "title": "Coffee chat sign-ups", "org": "Traders at Carolina · 1:1",
  "deadline": "2026-10-10", "deadlineLabel": "Closes", "url": "https://..." }
```

- `column` is one of `"signups"`, `"competitions"` or `"industry"`.
- `deadlineLabel` is the word before the date, such as `"Closes"`, `"Register by"` or `"RSVP by"`.
- For something with rolling sign-ups, leave out `deadline` and set `deadlineLabel` to e.g. `"Rolling sign-up"`. It never expires, so remove it by hand when it ends.
- A chip **turns orange when the deadline is 7 days away or less**. Items **vanish the day after their deadline**. This is checked when the site is built and again in each visitor's browser, so the board stays correct even if nobody redeploys. Dates use Chapel Hill time.
- You can safely leave old items in the file, but deleting them now and then keeps it tidy.

### `resources.json`: Prep resources (Programs page)

```json
{ "title": "Probability primer", "type": "PDF", "url": "/resources/probability-primer.pdf" }
```

The list is empty for now (`[]`), so the page shows "We will update this section with study materials as the semester progresses." Add an entry and the list appears in its place. Put files in a `public/resources/` folder (create it if it doesn't exist): a file at `public/resources/x.pdf` is linked as `/resources/x.pdf`. You can also link to Google Drive or any other URL.

---

## 3. Photos

Everything in `public/` is served as-is. `public/images/x.jpg` becomes `/images/x.jpg`.

| Folder | Used for |
|---|---|
| `public/images/gallery/` | Header photo mosaics (listed in `site.json → gallery`) |
| `public/images/programs/` | Photos for the home-page Programs section (set in `src/pages/index.astro`, under `programRows`). The Games & Firm Events row uses `poker.jpg`. Weekly Sessions currently borrows an interest-meeting photo from `gallery/`. The program titles and text are in the same file. |
| `public/images/events/` | Event card photos (referenced from `events.json`; create the folder when you add one) |
| `public/images/people/` | Headshots (referenced from `members.json`) |
| `public/images/placements.png` | The "Where our members go" firm logos (Members page) |

The gallery uses real interest-meeting photos (`interest-meeting-1.jpg` to `-4.jpg`). Full-size originals of photos are kept in `assets-originals/`, which is neither published nor committed to git (it's in `.gitignore`), so back that folder up somewhere else if you want to keep the originals.

Tips:
- **Resize before uploading.** About 1600px on the long edge is plenty, and headshots can be 800×800. Large phone photos (5 MB or more) slow the site down. <https://squoosh.app> is a free tool for this.
- Headshots are cropped to a square, so center the face.
- The gallery works with any number of photos. To add one, put it in `public/images/gallery/` and add its path to `gallery` in `site.json`. The home mosaic has 14 tiles, so photos repeat until there are 14 or more. Each tile crops a different part of its photo to soften the repeats.

---

## 4. Turning on member log-in

The `/login` page is **design only** right now (option A): the form shows a "not live yet" message and sends nothing. The integration point is clearly marked at the bottom of `src/pages/login.astro` (`AUTH INTEGRATION POINT`). Options:

- **Simplest (redirect):** make the "Log in" nav link point straight at a shared Google Drive folder. In `src/components/Nav.astro`, change `{ href: '/login', … }` to the Drive URL.
- **Supabase or Firebase auth:** create a project, enable email and password sign-in, and replace `signIn()` in `login.astro` with the provider's sign-in call (for example `supabase.auth.signInWithPassword`). The form accepts any email address; add a domain check there if you want to limit who can sign in. Add a `/members-area` page that checks for a session before showing content. Because the site is static, the protected content must come from the auth provider (for example a Supabase table or storage bucket), not from files in this repo.
- **UNC Onyen single sign-on:** this requires approval from UNC ITS. Ask them about Shibboleth/SAML for student organizations.

---

## 5. Publishing (Vercel)

1. Push this folder to a GitHub repository.
2. Sign in at <https://vercel.com> with GitHub, then choose **Add New → Project** and pick the repository.
3. Vercel detects Astro automatically (build command `npm run build`, output `dist`). Click **Deploy**.
4. From then on, **every change pushed to `main` goes live automatically** within a minute or so. You can edit the JSON files directly on github.com (pencil icon → edit → "Commit changes") without installing anything.
5. To use a custom domain, open **Project → Settings → Domains**. Then update `site` in `astro.config.mjs` to match.

Because the opportunities board re-checks dates in the browser, it doesn't need a scheduled rebuild. If you want the built HTML to stay fresh too, add a Vercel Deploy Hook and trigger it daily, for example with a GitHub Actions cron.

**Other hosts:**
- *Netlify:* "Import from Git", build command `npm run build`, publish directory `dist`.
- *GitHub Pages:* follow <https://docs.astro.build/en/guides/deploy/github/>. If the site lives at `username.github.io/repo-name`, also set `base: '/repo-name'` in `astro.config.mjs`.

---

## 6. Where things live (for developers)

```
src/
  data/          ← all editable content (JSON)
  pages/         ← one file per page: index, members, programs, login, 404
  components/    ← Nav, Footer, Gallery (photo mosaic + crossfade), PersonCard, RailSection, Icon
  layouts/       ← Base.astro (head, fonts, nav/footer)
  lib/dates.ts   ← deadline logic shared by build and browser
  styles/        ← global.css (design tokens, buttons, tags, chips)
public/
  fonts/clarity-city/  ← self-hosted Clarity City (SIL OFL, licence included)
  images/, resources/
```

The fonts are Crimson Pro and IBM Plex Mono, both from Google Fonts, plus Clarity City (self-hosted, from <https://github.com/vmware/clarity-city>). The only client-side JavaScript runs the mobile menu, the photo crossfade (turned off for visitors who prefer reduced motion), the board date re-check, and the log-in form stub.
