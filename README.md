# Traders at Carolina — website

The website for Traders at Carolina, UNC Chapel Hill's quantitative finance club. It's built with [Astro](https://astro.build). The public pages are plain static pages. The members' area uses Supabase (see section 4).

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

## 4. Members' area

Members log in at `/login` and land on `/portal`: Home, Resources, Problem bank, Slides and Profile. Accounts live in **Supabase**. There's no public sign-up: only club presidents can add people.

### Setup

1. Copy `.env.example` to `.env.local` and fill in the values from the Supabase dashboard (**Project Settings → API Keys**). `.env.local` is git-ignored. Never commit it.
2. Apply the database migration in `supabase/migrations/` (with the Supabase CLI, `supabase link` then `supabase db push`, or paste the file into the dashboard's SQL editor).
3. Optional: load the sample resources and sessions from `supabase/seed.sql`. It's clearly marked sample data, with the delete commands at the bottom.
4. On Vercel, add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` under **Project → Settings → Environment Variables**. **Don't** add the secret key to Vercel. The website never uses it.

### Inviting members

The invite script reads a list of emails and emails each person an invite to set up their account:

```bash
npx tsx scripts/invite-members.ts members.csv --dry-run   # preview
npx tsx scripts/invite-members.ts members.csv             # send invites
```

`members.csv` can be a plain list of emails (one per line), or a CSV with optional name and class year columns:

```
email,name,class_year
jordan.lee@gmail.com,Jordan Lee,2027
sam@unc.edu
```

People who already have an account are skipped. The script prints who was invited, skipped or failed. It needs `PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `SITE_URL` in `.env.local`. **Prefer personal emails**, because UNC addresses stop working after graduation.

### Adding resources and sessions

Presidents add practice tools, links and sessions (with slide and recording links) in the Supabase dashboard's **Table Editor**, in the `resources` and `sessions` tables. The next upcoming session shows on Home. Past sessions show on Slides, newest first.

### Emails

Supabase only lets you edit its email templates after you connect your own email sender (**Authentication → Emails → SMTP Settings**). Set that up before inviting the club: Supabase's built-in sender only delivers to people on your Supabase team, a few emails an hour.

- **Without custom templates**, everything still works with Supabase's default emails. One catch: a password-reset link has to be opened in the same browser that asked for it.
- **With custom templates** (paste the HTML from `supabase/templates/` into **Authentication → Emails → Templates**; subjects are in `supabase/config.toml`), emails carry the club's name and links work in any browser.

### Local development

`npm run dev` works against the hosted project once `.env.local` is filled in. To run a private copy of the database instead, install Docker and the Supabase CLI and run `supabase start`. It applies the migration and seed, and catches every email in a local inbox (Mailpit). The local settings are in `supabase/config.toml`.

### How anonymous questions stay anonymous

Members can't read the `questions` table directly, except for the `id` of their own questions. Everyone reads questions through the `question_feed` view, which shows the author's name only when a question isn't anonymous, plus vote counts and whether it's yours. So `author_id` can't be selected, filtered on, sorted by or joined through the API, even by presidents. Edits and deletes go to the table, where row level security limits them to the author (and presidents, for deletes).

---

## 5. Publishing (Vercel)

1. Push this folder to a GitHub repository.
2. Sign in at <https://vercel.com> with GitHub, then choose **Add New → Project** and pick the repository.
3. Vercel detects Astro automatically. Add the two `PUBLIC_SUPABASE_…` environment variables (see section 4), then click **Deploy**. The public pages are static. The members' area runs as a Vercel function.
4. From then on, **every change pushed to `main` goes live automatically** within a minute or so. You can edit the JSON files directly on github.com (pencil icon → edit → "Commit changes") without installing anything.
5. To use a custom domain, open **Project → Settings → Domains**. Then update `site` in `astro.config.mjs` to match.

Because the opportunities board re-checks dates in the browser, it doesn't need a scheduled rebuild. If you want the built HTML to stay fresh too, add a Vercel Deploy Hook and trigger it daily, for example with a GitHub Actions cron.

The members' area needs a server, so the site is set up for Vercel (`@astrojs/vercel` in `astro.config.mjs`). Moving to another host means swapping in that host's Astro adapter.

---

## 6. Where things live (for developers)

```
src/
  data/          ← all editable content (JSON)
  pages/         ← public pages: index, members, programs, 404
                   members' area: login, setup-account, forgot/reset-password,
                   auth/ (email-link confirmation, logout), portal/
  components/    ← Nav, Footer, Gallery (photo mosaic + crossfade), PersonCard, RailSection, Icon
                   members/ (problem bank rows and question form)
  layouts/       ← Base.astro (public site), AuthLayout + PortalLayout (members' area)
  lib/dates.ts   ← deadline logic shared by build and browser
  lib/supabase.ts, lib/portal.ts ← members' area helpers
  middleware.ts  ← sends signed-out visitors from /portal to /login
  styles/        ← global.css (public site), members.css (members' area)
supabase/        ← migrations (tables + security rules), seed.sql, email templates, local config
scripts/         ← invite-members.ts
public/
  fonts/clarity-city/  ← self-hosted Clarity City (SIL OFL, licence included)
  images/, resources/
```

The fonts are Crimson Pro and IBM Plex Mono, both from Google Fonts, plus Clarity City (self-hosted, from <https://github.com/vmware/clarity-city>). The only client-side JavaScript runs the mobile menu, the photo crossfade (turned off for visitors who prefer reduced motion), and the board date re-check. The members' area uses the same fonts (the Clarity City files are declared once, in `src/styles/fonts.css`) and works without JavaScript (forms post to the server).
