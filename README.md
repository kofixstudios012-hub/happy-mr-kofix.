# Happy Mr Kofix 🎮
20 free kids games. Plain HTML/CSS/JS (ES modules): no build, no login, no paid services.
Audio is made with the Web Audio API; pictures are emoji/canvas/SVG.

## Run locally
ES modules need a web server (double-clicking index.html will not work):
    python3 -m http.server 8080      # then open http://localhost:8080
    # or: npx serve .

## Deploy (GitHub + Netlify, free)
1. Create a GitHub repo, then: `git init && git add . && git commit -m "Happy Mr Kofix" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`
2. Netlify > Add new site > Import from GitHub > pick the repo.
3. Build command: leave empty. Publish directory: `.` (already set in netlify.toml). Deploy.
Game links use `#/game-id`, so direct links work with no redirect rules.

## Logo
Replace `assets/kofix-logo.png`. The app still runs if it is missing.

## WhatsApp booking
"Book Photography" (and the footer credit) opens a form, then opens `https://wa.me/233534349054?text=...`
with the message pre-filled. The visitor must press Send in WhatsApp. Nothing is sent automatically. Change the number in `app.js`.

## Known limits
- Jigsaw/Animal Puzzle use tap-to-swap, not drag.
- Not an offline app (no service worker).
- Music is simple synthesized tunes.
