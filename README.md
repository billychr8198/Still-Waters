# Still Waters — A Quiet Place of Faith

A peaceful, contemplative Christian website. Everything is static HTML, CSS, and JavaScript — no build step, no server, nothing to install.

## What's inside

| Tab | What it does |
|---|---|
| **Sanctuary** | Home page with the stained-glass window and links into each section. |
| **365 Miracles** | A miracle for every day of the year, with search and era filters. Today's miracle is featured automatically. |
| **Daily Verse** | 365 Bible verses (KJV) with teaching reflections. Reveal-the-reflection flow, yesterday/tomorrow, surprise me, search, and saved verses. |
| **Holy Sites** | 18 holy sites with photographs and full explanations, filterable by region, plus the Pilgrim Quiz. |
| **Rosary** | A guided 21-step pray-along with tappable beads, all four sets of Mysteries (Joyful, Sorrowful, Glorious, Luminous), English and Latin prayers, the Fifteen Promises, the Fatima prayers, and the 54-Day Novena. |
| **Three Hail Marys** | The devotion explained, the daily novena prayers, and three candles to light as you pray. |
| **Talks** | Curated videos in two shelves — Christianity Talks and Self-Improvement Talks. |

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example, `still-waters`).
2. Upload **everything in this folder** to the repository root, keeping the folder structure (`css/`, `images/`, `js/`, `index.html`, `.nojekyll`).
   - In the browser: **Add file → Upload files**, drag the contents in, then commit.
   - Or with git:
     ```
     git init
     git add .
     git commit -m "Still Waters"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/still-waters.git
     git push -u origin main
     ```
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, branch **main**, folder **/(root)**. Save.
4. About a minute later the site is live at `https://YOUR-USERNAME.github.io/still-waters/`.

All paths are relative, so the site works from any repository name or subfolder.

## Adding your own content

Each section's content lives in its own file under `js/`. Edit the file, commit, and the page updates itself — you never need to touch the HTML or CSS.

### Add a video — `js/videos-data.js`

1. Get the video's **ID**: the 11 characters after `v=` or after `youtu.be/`, stopping at any `?`.
   `https://youtu.be/7NnY1kp3OSE?si=abc` → the ID is `7NnY1kp3OSE`
2. Copy an existing line and paste it into either the `christian` or `selfimprovement` list. The order in the file is the order on the page.
   ```js
   { id: "XXXXXXXXXXX", title: "My New Talk", speaker: "Speaker Name", note: "" },
   ```
3. Commit. The thumbnail and player appear automatically.

The file has these same instructions written at the top of it.

### The other content files

- `js/devotional-data.js` — daily verses: `{ day, ref, verse, reflection, theme }`
- `js/miracles-data.js` — miracles: `{ day, title, era, happened, reflection }`
- `js/sites-data.js` — holy sites: `{ num, name, location, region, body, image }`
- `js/rosary-data.js` — Rosary prayers, the four sets of Mysteries, the promises, and the Three Hail Marys texts

Site photographs live in `images/`. To swap one out, add the new file there and point that site's `image` field at it.

## Design notes

The palette and type come from the subject itself: lapis ultramarine (the blue of illuminated manuscripts and of the Fatima booklet), aged gold leaf, votive rose, and olive on limewashed plaster. Cormorant Garamond and Spectral give the pages the feel of a book of hours rather than an app. Motion is deliberately slow, and switches off entirely for anyone who has reduced motion enabled in their system settings.

Fonts load from Google Fonts, so the site needs an internet connection to look its best; if fonts are blocked it falls back to Georgia and stays perfectly readable.
