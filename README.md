# Triple Tic-Tac-Toe

A neon-styled twist on Tic-Tac-Toe where **each player can have at most 3 pieces on the board**. Place a 4th piece and your **oldest** one disappears — so the game can never end in a draw. Pure tactics.

![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Vite](https://img.shields.io/badge/Vite-8-646cff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-ff44aa)

**▶ Play it live:** https://sanjays2402.github.io/triple-tic-tac-toe/

## How to play

1. Players alternate placing **X** and **O**.
2. Each player may keep only **3** pieces on the board.
3. Placing a 4th piece removes that player's **oldest** piece (the one that's pulsing). 
4. First to line up **3 in a row** — horizontally, vertically, or diagonally — wins.

### Controls

- **Click** a cell to place a piece.
- Press <kbd>1</kbd>–<kbd>9</kbd> to place on the matching cell (numbered like a numpad, left-to-right, top-to-bottom).
- Press <kbd>R</kbd> to start a new round.

## Game modes

- **2 Players** — local hot-seat play.
- **vs Computer** — play against an AI with three difficulty levels:
  - **Easy** — mostly random, but grabs an obvious win.
  - **Medium** — wins when it can and blocks your winning move.
  - **Hard** — looks ahead with a depth-limited **minimax** search adapted for the 3-piece variant.

## Features

- Single-player **vs Computer** (Easy / Medium / Hard) and local **2-player** mode
- **Sound effects** via the Web Audio API (no asset files) with a mute toggle
- **Persistent scores & settings** saved in `localStorage`
- **Keyboard controls** (1–9 to place, R for new round)
- Animated aurora background with glassmorphism UI
- **3D tilt board** that responds to your pointer (Framer Motion spring physics)
- Neon glowing X/O marks with spring pop-in and blur-out animations
- Animated SVG **winning line** + a warning pulse on the piece about to vanish
- Sliding shared-layout segmented controls and an animated scoreboard
- Confetti burst in the winner's colors
- Fully responsive and respects `prefers-reduced-motion`

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations (3D tilt, springs, shared layout, `AnimatePresence`)
- **lucide-react** icons and **canvas-confetti**
- Deployed automatically to **GitHub Pages** via **GitHub Actions**

## Run locally

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173/triple-tic-tac-toe/)
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## Project structure

```
triple-tic-tac-toe/
├── index.html              # Vite entry
├── src/
│   ├── main.tsx            # app bootstrap
│   ├── App.tsx             # layout & UI composition
│   ├── index.css           # Tailwind theme + keyframes
│   ├── game/
│   │   ├── engine.ts       # pure 3-piece game logic
│   │   └── ai.ts           # Easy/Medium/Hard computer opponent (minimax)
│   ├── hooks/
│   │   ├── useGame.ts      # game state, AI, scoring, confetti
│   │   ├── useSound.ts     # Web Audio sound effects
│   │   └── useLocalStorage.ts
│   └── components/
│       ├── Background.tsx  # animated aurora
│       ├── Board.tsx       # 3D tilt board + winning line
│       ├── Cell.tsx        # animated neon cell
│       └── Seg.tsx         # segmented control
└── .github/workflows/deploy.yml  # CI build & Pages deploy
```
