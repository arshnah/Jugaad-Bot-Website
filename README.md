# Jugaad Docs

**Live: https://jugaad-bot-website.vercel.app**

Public landing page, command reference, and alpha tester checklist for Jugaad, a Discord bot. Plain HTML/CSS/JS, no build step, no framework, no dependencies. Pages: `index.html` (landing), `commands.html` (full command catalog), `testers.html` (alpha test checklist), shared `styles.css` and `script.js`.

The real OAuth2 invite URL is live in `index.html`. The footer used to carry a `GITHUB_REPO_PLACEHOLDER`; it now links to `commands.html` instead, because the bot repo is private (it's cloned with a PAT — see `Jugaad-Bot/DEPLOY.md`) and a public visitor would just hit a 404. Swap it for a real GitHub link if the repo is ever made public. To deploy: import this repo into Vercel via the dashboard and accept the defaults — it's a static folder, so no configuration is needed.

Heads-up for future updates: `commands.html` and `testers.html` both go stale as new phases ship. They were generated against the bot's live command code, so each is split into live commands and `Coming soon` ones. `testers.html` only lists commands that were live at generation time. When a new phase lands, re-walk `jugaad-bot/commands/` and re-sync both pages — move newly-shipped commands out of `Coming soon` in `commands.html`, and add them to the `testers.html` checklist with an action + expected result (and an edge case where one is worth testing).
