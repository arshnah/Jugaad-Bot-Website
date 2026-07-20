# Jugaad Docs

**Live: https://jugaadbot.vercel.app**

Public landing page, command reference, and alpha tester checklist for Jugaad, a Discord bot. Plain HTML/CSS/JS, no build step, no framework, no dependencies. Pages: `index.html` (landing), `commands.html` (full command catalog), `testers.html` (alpha test checklist), `leaderboard.html` (live top players), shared `styles.css` and `script.js`.

**Live data.** `index.html` and `leaderboard.html` both carry a
`<meta name="jugaad-api">` tag pointing at `https://jugaadapi.arshnah.in` (the
bot's read-only API, behind nginx on the VPS). The command count and the
leaderboards come from there. It is **progressive enhancement**: the numbers in
the HTML are already correct, and a missing tag, an unreachable API, a CORS
refusal or bad JSON all leave the page exactly as served. The failure mode is
"slightly stale", never "blank". Both tags must match.

**Search.** `Cmd/Ctrl+K` anywhere opens a palette that searches every command;
`/` focuses whichever filter the page has. `commands.html` is the single source
of truth for the index — on that page it's read from the DOM, elsewhere it's
fetched and parsed, so nothing is generated or duplicated.

The real OAuth2 invite URL is live in `index.html`. The footer used to carry a `GITHUB_REPO_PLACEHOLDER`; it now links to `commands.html` instead, because the bot repo is private (it's cloned with a PAT — see `Jugaad-Bot/DEPLOY.md`) and a public visitor would just hit a 404. Swap it for a real GitHub link if the repo is ever made public. To deploy: import this repo into Vercel via the dashboard and accept the defaults — it's a static folder, so no configuration is needed.

Heads-up for future updates: `commands.html` and `testers.html` both go stale as new phases ship. They were generated against the bot's live command code, so each is split into live commands and `Coming soon` ones. `testers.html` only lists commands that were live at generation time. When a new phase lands, re-walk `jugaad-bot/commands/` and re-sync both pages — move newly-shipped commands out of `Coming soon` in `commands.html`, and add them to the `testers.html` checklist with an action + expected result (and an edge case where one is worth testing).
