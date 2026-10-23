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
- Press <kbd>U</kbd> (or the **Undo** button) to take back your last move — in **vs Computer** mode this also takes back the computer's reply.
- Press <kbd>H</kbd> (or the **Hint** button) to highlight the strongest move for the current player.

## Game modes

- **2 Players** — local hot-seat play.
- **vs Computer** — play against an AI with three difficulty levels:
  - **Easy** — mostly random, but grabs an obvious win.
  - **Medium** — wins when it can and blocks your winning move.
  - **Hard** — looks ahead with a depth-limited **minimax** search adapted for the 3-piece variant.

## Features

- Single-player **vs Computer** (Easy / Medium / Hard) and local **2-player** mode
- **Undo** — take back your last move (plus the computer's reply in vs-Computer mode) via button or <kbd>U</kbd>
- **Hint** — highlight the current player's strongest move (hard-AI search) via the Hint button or <kbd>H</kbd>; the highlight clears as soon as any move is made
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

Use Node.js 22.18 or newer to run the TypeScript engine tests.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173/triple-tic-tac-toe/)
npm test         # run game-engine regression tests
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
│   │   ├── ai.ts           # Easy/Medium/Hard computer opponent (minimax)
│   │   └── colors.ts       # player color palettes
│   ├── hooks/
│   │   ├── useGame.ts      # game state, AI, scoring, confetti, undo history
│   │   ├── useSound.ts     # Web Audio sound effects
│   │   ├── useColors.ts    # persisted player color selection
│   │   └── useLocalStorage.ts
│   └── components/
│       ├── Background.tsx  # animated aurora
│       ├── Board.tsx       # 3D tilt board + winning line
│       ├── Cell.tsx        # animated neon cell
│       ├── ColorPicker.tsx # player color picker
│       └── Seg.tsx         # segmented control
└── .github/workflows/deploy.yml  # CI build & Pages deploy
```

## Terms & Disclaimer

By using this project you agree to the following.

- **No warranty.** This software is provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
- **No liability.** To the maximum extent permitted by law, the author and contributors are not liable for any claim, loss, or damage (direct, indirect, incidental, or consequential, including lost data or profits) arising from its use.
- **Your responsibility.** You use it at your own risk and are responsible for complying with the laws that apply to you.
- **Game.** Provided for entertainment. Take breaks; it is not designed for people with photosensitive epilepsy, and flashing effects may occur.
- **Third parties.** Names, logos, APIs, and services of others belong to their owners and are used for identification only; no affiliation or endorsement is implied.
- **Your statutory rights.** Nothing here limits rights that cannot be waived by agreement, including under consumer-protection laws in the USA, Canada (including Quebec), and India (Consumer Protection Act, 2019).
- **License.** Use, copying, and distribution are governed by the [LICENSE](LICENSE) file; if anything here conflicts with it, the license controls.

## Content, Assets & Fair Use

- **Original work.** Unless noted otherwise (including below), the code, text, design, and images in this repository were created by the author.
- **Libraries, fonts, and icons.** Third-party libraries, fonts (for example Google Fonts), and icon sets belong to their creators and are used under their own licenses; see the dependency manifests and each source for terms.
- **Logos, brands, and screenshots.** Third-party names, logos, and screenshots appear only to identify or describe their products (nominative use). They remain the property of their owners and do not imply affiliation or endorsement.
- **Ideas and inspiration.** Where this project is inspired by another product, game, or idea, it is an independent implementation. It borrows only general ideas, mechanics, or styles, which are not anyone's exclusive property, and is meant to contain no third-party code or artwork used without permission.
- **Fair use and fair dealing.** Any third-party material is used in limited ways for purposes such as education, research, review, commentary, or identification, relying on fair use in the USA (17 U.S.C. § 107), fair dealing in Canada (Copyright Act, ss. 29–29.2), and fair dealing in India (Copyright Act, 1957, s. 52), where they apply.
- **Concerns and takedown requests.** If you own rights in something here and believe it is used improperly, [open an issue](https://github.com/Sanjays2402/triple-tic-tac-toe/issues) or contact the author through their GitHub profile with a link to the material and your claim. It will be reviewed promptly and credited, changed, or removed as appropriate. You may also use GitHub's DMCA process.
- **Contributions.** By contributing, you confirm you have the right to submit your contribution and agree it is licensed under this repository's license.
- **Website.** The project site has its own [Terms](https://sanjays2402.github.io/triple-tic-tac-toe/terms.html) and [Fair Use](https://sanjays2402.github.io/triple-tic-tac-toe/fair-use.html) pages.
