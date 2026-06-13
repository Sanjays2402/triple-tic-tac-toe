# Triple Tic-Tac-Toe

A neon-styled twist on Tic-Tac-Toe where **each player can have at most 3 pieces on the board**. Place a 4th piece and your **oldest** one disappears — so the game can never end in a draw. Pure tactics.

![Made with HTML](https://img.shields.io/badge/HTML-5-e34f26)
![Made with CSS](https://img.shields.io/badge/CSS-3-1572b6)
![Made with JS](https://img.shields.io/badge/JavaScript-vanilla-f7df1e)

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
- Neon glowing X/O marks with pop-in animations
- Live piece pips + a warning pulse on the piece about to vanish
- Glowing scoreboard with active-player highlight
- Confetti burst in the winner's colors
- Fully responsive and respects `prefers-reduced-motion`
- Zero dependencies — plain HTML, CSS, and JavaScript

## Run locally

Just open `index.html` in any modern browser:

```bash
open index.html      # macOS
# or simply double-click the file
```

## Project structure

```
triple-tic-tac-toe/
├── index.html   # markup
├── style.css    # all styling & animations
└── script.js    # game logic, pips, and confetti
```
