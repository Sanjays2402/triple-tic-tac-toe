// Triple Tic-Tac-Toe — each player keeps at most 3 pieces on the board.
// Placing a 4th piece removes that player's oldest one (FIFO), so the game
// never gets stuck in a draw.
//
// Features: 2-player & vs-computer modes (Easy/Medium/Hard AI), Web-Audio
// sound effects, localStorage persistence, and keyboard controls.

const MAX_PIECES = 3;
const HUMAN = "X";
const CPU = "O";
const AI_DEPTH = 6; // search horizon for the "Hard" minimax

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// --- Persistence helpers ---
const LS = {
  get(key, def) {
    try {
      const v = localStorage.getItem("ttt:" + key);
      return v === null ? def : JSON.parse(v);
    } catch {
      return def;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem("ttt:" + key, JSON.stringify(val));
    } catch {
      /* storage unavailable — ignore */
    }
  }
};

// --- Game state ---
const board = Array(9).fill(null);   // each cell: 'X' | 'O' | null
const queues = { X: [], O: [] };     // placement order (cell indices) per player
const scores = { X: 0, O: 0 };
let currentPlayer = "X";
let gameOver = false;
let winningLine = null;

let mode = "2p";          // '2p' | 'cpu'
let difficulty = "medium"; // 'easy' | 'medium' | 'hard'
let muted = false;
let aiThinking = false;

// --- DOM references ---
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const statusTextEl = statusEl.querySelector(".status__text");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreXWrap = document.getElementById("score-x-wrap");
const scoreOWrap = document.getElementById("score-o-wrap");
const labelO = document.getElementById("label-o");
const pipsX = [...document.getElementById("pips-x").children];
const pipsO = [...document.getElementById("pips-o").children];
const modeSeg = document.getElementById("mode-seg");
const diffSeg = document.getElementById("diff-seg");
const soundToggle = document.getElementById("sound-toggle");
const soundIcon = soundToggle.querySelector(".icon-btn__icon");
const cells = [];

// --- Build the board once ---
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("button");
  cell.className = "cell";
  cell.type = "button";
  cell.dataset.index = String(i);
  cell.setAttribute("role", "gridcell");
  cell.setAttribute("aria-label", `Cell ${i + 1}`);
  cell.addEventListener("click", () => handleCellClick(i));
  boardEl.appendChild(cell);
  cells.push(cell);
}

// ============================================================
//  Core game flow
// ============================================================
function handleCellClick(i) {
  if (gameOver || board[i] || aiThinking) return;
  if (mode === "cpu" && currentPlayer === CPU) return; // wait for the AI
  makeMove(i);
}

function makeMove(i) {
  const removed = placePiece(i, currentPlayer);
  playPlace(currentPlayer);
  if (removed !== null) playVanish();

  const line = checkWin(currentPlayer);
  if (line) {
    winningLine = line;
    gameOver = true;
    scores[currentPlayer] += 1;
    saveScores();
    updateScores(currentPlayer);
    render();
    setStatus(winMessage(currentPlayer), currentPlayer, true);
    playWin();
    launchConfetti(currentPlayer);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  render();
  setStatus(turnLabel(currentPlayer), currentPlayer);
  maybeTriggerAI();
}

function placePiece(i, player) {
  const queue = queues[player];
  let removed = null;
  if (queue.length >= MAX_PIECES) {
    removed = queue.shift();
    board[removed] = null;
  }
  board[i] = player;
  queue.push(i);
  return removed;
}

function checkWin(player) {
  return LINES.find((line) => line.every((idx) => board[idx] === player)) || null;
}

// ============================================================
//  Rendering
// ============================================================
function render() {
  const cpuTurn = mode === "cpu" && currentPlayer === CPU;
  cells.forEach((cell, i) => {
    const val = board[i];
    cell.textContent = val || "";
    cell.classList.toggle("cell--x", val === "X");
    cell.classList.toggle("cell--o", val === "O");
    cell.classList.remove("cell--fading", "cell--win");
    cell.disabled = gameOver || val !== null || aiThinking || cpuTurn;
  });

  if (winningLine) {
    winningLine.forEach((i) => cells[i].classList.add("cell--win"));
  } else if (!gameOver) {
    // Telegraph which piece will vanish on the current player's next move.
    const queue = queues[currentPlayer];
    if (queue.length >= MAX_PIECES) {
      cells[queue[0]].classList.add("cell--fading");
    }
  }

  boardEl.dataset.turn = currentPlayer;
  boardEl.classList.toggle("locked", aiThinking);
  scoreXWrap.classList.toggle("active", !gameOver && currentPlayer === "X");
  scoreOWrap.classList.toggle("active", !gameOver && currentPlayer === "O");
  renderPips();
}

function renderPips() {
  const onX = queues.X.length;
  const onO = queues.O.length;
  pipsX.forEach((pip, idx) => pip.classList.toggle("on", idx < onX));
  pipsO.forEach((pip, idx) => pip.classList.toggle("on", idx < onO));
}

function updateScores(scorer) {
  scoreXEl.textContent = String(scores.X);
  scoreOEl.textContent = String(scores.O);
  if (scorer) {
    const el = scorer === "X" ? scoreXEl : scoreOEl;
    el.classList.remove("bumped");
    void el.offsetWidth; // restart animation
    el.classList.add("bumped");
  }
}

function setStatus(text, player, win = false) {
  statusTextEl.textContent = text;
  statusEl.dataset.player = player || "";
  statusEl.classList.toggle("win", win);
}

function turnLabel(p) {
  if (mode === "cpu") return p === CPU ? "Computer's turn" : "Your turn";
  return `Player ${p}'s turn`;
}

function winMessage(p) {
  if (mode === "cpu") return p === CPU ? "Computer wins!" : "You win!";
  return `Player ${p} wins!`;
}

// ============================================================
//  Round / score management
// ============================================================
function newRound() {
  board.fill(null);
  queues.X = [];
  queues.O = [];
  currentPlayer = "X";
  gameOver = false;
  winningLine = null;
  aiThinking = false;
  render();
  setStatus(turnLabel("X"), "X");
  // Human (X) always starts, so no AI trigger needed here.
}

function resetAll() {
  scores.X = 0;
  scores.O = 0;
  saveScores();
  updateScores();
  newRound();
}

function saveScores() {
  LS.set("scores", scores);
}

// ============================================================
//  Computer opponent
// ============================================================
function maybeTriggerAI() {
  if (mode !== "cpu" || gameOver || currentPlayer !== CPU) return;
  aiThinking = true;
  render();
  setStatus("Computer is thinking…", CPU);

  const delay = 420 + Math.random() * 360;
  setTimeout(() => {
    // Bail out if the situation changed while we waited (e.g. mode switch).
    if (mode !== "cpu" || gameOver || currentPlayer !== CPU) {
      aiThinking = false;
      render();
      return;
    }
    const move = chooseAIMove();
    aiThinking = false;
    makeMove(move);
  }, delay);
}

function chooseAIMove() {
  const avail = emptyCells(board);
  if (difficulty === "easy") {
    // Grab an obvious win, otherwise play randomly.
    return findWinningMove(CPU) ?? randomOf(avail);
  }
  if (difficulty === "medium") {
    // Win if possible, block the opponent's win, else random.
    return findWinningMove(CPU) ?? findWinningMove(HUMAN) ?? randomOf(avail);
  }
  // Hard: look ahead with minimax (always grab an immediate win first).
  return findWinningMove(CPU) ?? minimaxRoot();
}

function emptyCells(b) {
  const result = [];
  for (let i = 0; i < 9; i++) if (!b[i]) result.push(i);
  return result;
}

function randomOf(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

// Pure simulation of a move (does not touch real game state).
function simulateMove(state, i, player) {
  const b = state.board.slice();
  const q = { X: state.queues.X.slice(), O: state.queues.O.slice() };
  const pq = q[player];
  if (pq.length >= MAX_PIECES) {
    b[pq.shift()] = null;
  }
  b[i] = player;
  pq.push(i);
  return { board: b, queues: q };
}

function winsFor(b, player) {
  return LINES.some((line) => line.every((idx) => b[idx] === player));
}

function findWinningMove(player) {
  const state = snapshot();
  for (const i of emptyCells(board)) {
    if (winsFor(simulateMove(state, i, player).board, player)) return i;
  }
  return null;
}

function snapshot() {
  return {
    board: board.slice(),
    queues: { X: queues.X.slice(), O: queues.O.slice() }
  };
}

function minimaxRoot() {
  const state = snapshot();
  let bestScore = -Infinity;
  let candidates = [];
  for (const i of emptyCells(state.board)) {
    const next = simulateMove(state, i, CPU);
    const score = winsFor(next.board, CPU)
      ? 1000
      : minimax(next, HUMAN, 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      candidates = [i];
    } else if (score === bestScore) {
      candidates.push(i);
    }
  }
  return candidates.length ? randomOf(candidates) : randomOf(emptyCells(state.board));
}

function minimax(state, player, depth, alpha, beta) {
  if (depth >= AI_DEPTH) return evaluate(state.board);
  const moves = emptyCells(state.board);

  if (player === CPU) {
    let best = -Infinity;
    for (const i of moves) {
      const next = simulateMove(state, i, CPU);
      const score = winsFor(next.board, CPU)
        ? 1000 - depth
        : minimax(next, HUMAN, depth + 1, alpha, beta);
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const i of moves) {
    const next = simulateMove(state, i, HUMAN);
    const score = winsFor(next.board, HUMAN)
      ? -1000 + depth
      : minimax(next, CPU, depth + 1, alpha, beta);
    if (score < best) best = score;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

// Heuristic for non-terminal positions at the search horizon.
function evaluate(b) {
  let score = 0;
  for (const line of LINES) {
    let cpu = 0;
    let human = 0;
    for (const idx of line) {
      if (b[idx] === CPU) cpu++;
      else if (b[idx] === HUMAN) human++;
    }
    if (cpu > 0 && human === 0) score += cpu === 2 ? 12 : 1;
    else if (human > 0 && cpu === 0) score -= human === 2 ? 12 : 1;
  }
  return score;
}

// ============================================================
//  Sound effects (Web Audio API — no external files)
// ============================================================
let audioCtx = null;

function getAudio() {
  if (muted) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type = "sine", gain = 0.08, when = 0) {
  const ac = getAudio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function playPlace(player) {
  tone(player === "X" ? 540 : 410, 0.12, "triangle", 0.09);
}

function playVanish() {
  const ac = getAudio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(420, t0);
  osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.25);
  g.gain.setValueAtTime(0.06, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.3);
}

function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.08, i * 0.09));
}

function playClick() {
  tone(660, 0.05, "square", 0.04);
}

// ============================================================
//  Settings UI (mode / difficulty / sound)
// ============================================================
function applyMode(newMode, { restart = true } = {}) {
  mode = newMode;
  LS.set("mode", mode);
  [...modeSeg.children].forEach((b) =>
    b.classList.toggle("is-active", b.dataset.mode === mode)
  );
  diffSeg.hidden = mode !== "cpu";
  labelO.textContent = mode === "cpu" ? "Computer" : "Player O";
  if (restart) newRound();
}

function applyDifficulty(level) {
  difficulty = level;
  LS.set("difficulty", level);
  [...diffSeg.children].forEach((b) =>
    b.classList.toggle("is-active", b.dataset.diff === level)
  );
}

function applyMuted(value) {
  muted = value;
  LS.set("muted", value);
  soundToggle.setAttribute("aria-pressed", String(!value));
  soundIcon.textContent = value ? "🔇" : "🔊";
}

modeSeg.addEventListener("click", (e) => {
  const btn = e.target.closest(".seg__btn");
  if (!btn) return;
  playClick();
  applyMode(btn.dataset.mode);
});

diffSeg.addEventListener("click", (e) => {
  const btn = e.target.closest(".seg__btn");
  if (!btn) return;
  playClick();
  applyDifficulty(btn.dataset.diff);
});

soundToggle.addEventListener("click", () => {
  applyMuted(!muted);
  if (!muted) playClick();
});

document.getElementById("reset-round").addEventListener("click", () => {
  playClick();
  newRound();
});

document.getElementById("reset-all").addEventListener("click", () => {
  playClick();
  resetAll();
});

// Keyboard: 1–9 place a piece, R starts a new round.
window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "9") {
    handleCellClick(Number(e.key) - 1);
  } else if (e.key === "r" || e.key === "R") {
    newRound();
  }
});

// ============================================================
//  Confetti — lightweight canvas particle burst on a win
// ============================================================
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiRAF = null;

function sizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", sizeCanvas);
sizeCanvas();

function launchConfetti(player) {
  const palette = player === "X"
    ? ["#22d3ee", "#67e8f9", "#a78bfa", "#ffffff"]
    : ["#fb5fa0", "#fda4d0", "#a78bfa", "#ffffff"];

  const count = 140;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.32;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    confettiParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      color: palette[(Math.random() * palette.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1
    });
  }

  if (!confettiRAF) confettiRAF = requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p) => {
    p.vy += 0.22;          // gravity
    p.vx *= 0.99;          // air drag
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.009;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });

  confettiParticles = confettiParticles.filter(
    (p) => p.life > 0 && p.y < confettiCanvas.height + 40
  );

  if (confettiParticles.length) {
    confettiRAF = requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiRAF = null;
  }
}

// ============================================================
//  Init — restore saved settings & scores
// ============================================================
const savedScores = LS.get("scores", { X: 0, O: 0 });
scores.X = Number(savedScores.X) || 0;
scores.O = Number(savedScores.O) || 0;

applyMuted(LS.get("muted", false));
applyDifficulty(LS.get("difficulty", "medium"));
applyMode(LS.get("mode", "2p"), { restart: false });
updateScores();
newRound();
