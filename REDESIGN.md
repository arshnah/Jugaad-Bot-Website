# Website Redesign — Brief

> **Start here in a fresh session.** This file is the whole handoff for a full
> visual redesign of the Jugaad site. Written 2026-07-19.

---

## ⏪ How to revert (read this first)

The **entire pre-redesign site is snapshotted on the `design-v1` branch**
(currently `9cdbac1`). Nothing is lost, no matter how far the redesign goes.

```bash
# See the old design without changing anything
git checkout design-v1

# FULL REVERT — restore every file to the old design, on main
git checkout main
git checkout design-v1 -- .
git commit -m "Revert to design-v1"
git push origin main

# Or cherry-pick just one file back
git checkout design-v1 -- styles.css
```

Vercel redeploys from `main` automatically, so a revert push restores the live
site within a minute.

---

## The goal

**A full redesign** — not a tweak. Thakur explicitly wants the whole site
reimagined, with `design-v1` as the safety net.

Push **straight to `main`** (confirmed). Note this overwrites Vasu's existing
design work — that was an explicit decision, not an oversight.

---

## What exists today

Plain static site. **No build step, no framework, no dependencies.** Deployed on
**Vercel** (repo imported via dashboard, static folder, zero config).

| File | What it is |
|---|---|
| `index.html` | Landing page (hero, Rokda disclaimer, "What it does" feature grid) |
| `commands.html` | Full command catalog — **17 category sections**, ~106 cards, sidebar nav + filter |
| `testers.html` | Alpha tester checklist (action / expected / edge case per command) |
| `styles.css` | ~1270 lines, single stylesheet, real token system |
| `script.js` | `fuzzyMatch` filter, scroll-reveal, active-nav-on-scroll |

### The existing design tokens (keep or deliberately replace)

```css
--bg: #0f1114;        --bg-deep: #0a0c0f;
--surface: #1a1d23;   --surface-hi: #21252d;
--border: #2a2f38;    --border-hi: #3a404c;
--text: #e6e8ec;      --text-muted: #8b93a1;
--accent: #d4a54a;    --accent-hover: #e8b95a;  --accent-deep: #b8862f;  /* gold */
--violet: #8b7cf6;    --success: #4ea67c;       --warning: #c26a5b;
--font-heading: "Space Grotesk", "Inter", sans-serif;
--font-body: "Inter", sans-serif;
```

Honest assessment: the current site is **competent but generic dark-SaaS**. The
token system and type scale are genuinely good groundwork. The look could be any
bot — it doesn't communicate what "Jugaad" means.

---

## The single biggest gap: there is no proof

**The only image on the entire site is the bot's avatar.** A Discord bot site
with zero pictures of the bot working is the #1 conversion miss. The pages
*describe* features in text cards instead of *showing* them.

### 🥇 Highest-impact idea: recreate the bot's Components V2 cards in HTML/CSS

The bot now renders modern Discord **Components V2** containers (accent bar,
avatar thumbnail, dividers, footer subtext). Rebuild those as pure HTML/CSS
mockups on the landing page:

- `/family view` — the family tree card (partner, parents, children, siblings, friends)
- `/image achievement` — the gold "Achievement Get!" toast
- A slots/coinflip win result
- `/rank` with badges + equipped title
- The AFK ping notice

Pure CSS means no screenshot files to go stale, crisp on any display, and it
matches the real bot exactly. **Do this before any color/font work.**

Reference the real rendering in the bot repo: `Jugaad-Bot/lib/components.js`
(`rokdaContainer`) and `Jugaad-Bot/lib/imageEffects.js`.

---

## Direction options discussed

1. **Casino / high-roller** — lean into the existing gold. Chip + card-suit motifs,
   slot-reel dividers, wordmark shimmer, felt texture. Ties directly to the
   economy/gambling core.
2. **Street jugaad** — what the name actually means (scrappy Indian
   resourcefulness). Halftone/tape/sticker collage, marquee ticker, hand-drawn
   arrows. **Most distinctive and most on-brand** with the name + mascot.
3. **Discord-native** — mimic Discord's own UI (blurple, message bubbles,
   sidebar). Instantly legible, least memorable.

Thakur chose "redesign the whole thing" without locking a lane — **pick a
direction and commit to it hard**, rather than blending all three into mush.

---

## Also worth fixing (any direction)

**`commands.html` is the workhorse page** and is currently a wall of ~106 dense
cards across 17 sections:

- Category **chips** + sticky section headers (not just the sidebar)
- Live **result count** on filter
- Press `/` to focus search
- **Copy-to-clipboard** per command
- Compact / comfortable density toggle

**Cheap polish wins:**
- Stat strip — *85 commands · 9 categories · free forever*
- Scroll-reveal, hover lift, gradient wordmark, subtle grain
- Gate all motion behind `prefers-reduced-motion`
- Mobile: the command grid and sidebar need real attention

---

## Hard facts (don't re-derive these)

- **Invite link is already live and correct** in `index.html`:
  `scope=bot+applications.commands`, `integration_type=0` (guild install).
  Client ID `1526129273075929159`. Don't break it.
- Commands are now registered **globally** — the bot works in any server it's
  invited to, so the site is a real front door, not a formality.
- **85 commands across 9 folder-categories** (economy, gambling, fun, images,
  community, social, moderation, leveling, utility). Note `commands.html` groups
  them into **17 display sections**, which is a different (finer) split.
- The bot's own accent gold is `#d4af37` (`ROKDA_GOLD` in `lib/embeds.js`) — the
  site uses `#d4a54a`. Aligning them is a nice touch.
- `README.md` still contains a `GITHUB_REPO_PLACEHOLDER` in the tech footer that
  needs the real repo link.

## Keep these accurate while redesigning

`commands.html` and `testers.html` must stay in sync with the bot's actual
commands. If a card's signature changes, re-check against `Jugaad-Bot/commands/`.
Don't let a visual pass silently break the content.

---

## Verify before pushing

There's no build step, so just open the files:

```
file:///D:/projects/Jugaad-Bot-Website/index.html
```

Check: tag balance (`<article>`/`</article>`, `<section>`/`</section>`), the
filter still works on `commands.html`, mobile widths, and that the invite link
is intact.
