# Wordmath (Next.js + TypeScript PWA Starter)

A mobile-friendly, minimalist Wordle-like daily word game starter built with Next.js + TypeScript.

## Features

- **Daily mode**: picks the puzzle for the current date from local data.
- **Practice mode**: picks a random puzzle from the same local data file.
- **5 starter puzzles** in `data/puzzles.json`.
- **Keyboard support**:
  - Physical keyboard input.
  - On-screen mobile keyboard.
- **PWA basics**:
  - `manifest.webmanifest`
  - lightweight service worker (`public/sw.js`)
  - app icons

## Project structure

- `app/page.tsx` – entry page that loads puzzle data.
- `app/word-game.tsx` – game logic + UI.
- `app/globals.css` – minimal responsive styling.
- `data/puzzles.json` – local starter puzzles.
- `public/manifest.webmanifest` – PWA manifest.
- `public/sw.js` – simple cache-first service worker.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the app:

   ```text
   http://localhost:3000
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Run the production server:

   ```bash
   npm run start
   ```

## Customize puzzles

Edit `data/puzzles.json` and keep each answer as a 5-letter word:

```json
{
  "id": 6,
  "date": "2026-01-06",
  "answer": "GRAPE",
  "hint": "A fruit often in bunches"
}
```

> No API is required yet; all puzzles are loaded locally.
