// Triple Tic-Tac-Toe — each player keeps at most 3 pieces on the board.
// Placing a 4th piece removes that player's oldest one (FIFO), so the game
// never gets stuck in a draw.

const MAX_PIECES = 3;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// --- Game state ---
const board = Array(9).fill(null);   // each cell: 'X' | 'O' | null
const queues = { X: [], O: [] };     // placement order (cell indices) per player
const scores = { X: 0, O: 0 };
let currentPlayer = "X";
let gameOver = false;
let winningLine = null;

// --- DOM references ---
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const statusTextEl = statusEl.querySelector(".status__text");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreXWrap = document.getElementById("score-x-wrap");
const scoreOWrap = document.getElementById("score-o-wrap");
const pipsX = [...document.getElementById("pips-x").children];
const pipsO = [...document.getElementById("pips-o").children];
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

function handleCellClick(i) {
  if (gameOver || board[i]) return;

  placePiece(i, currentPlayer);

  const line = checkWin(currentPlayer);
  if (line) {
    winningLine = line;
    gameOver = true;
    scores[currentPlayer] += 1;
    updateScores(currentPlayer);
    render();
    setStatus(`Player ${currentPlayer} wins!`, currentPlayer, true);
    launchConfetti(currentPlayer);
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  render();
  setStatus(`Player ${currentPlayer}'s turn`, currentPlayer);
}

function placePiece(i, player) {
  const queue = queues[player];
  if (queue.length >= MAX_PIECES) {
    const oldest = queue.shift();
    board[oldest] = null;
  }
  board[i] = player;
  queue.push(i);
}

function checkWin(player) {
  return LINES.find((line) => line.every((idx) => board[idx] === player)) || null;
}

function render() {
  cells.forEach((cell, i) => {
    const val = board[i];
    cell.textContent = val || "";
    cell.classList.toggle("cell--x", val === "X");
    cell.classList.toggle("cell--o", val === "O");
    cell.classList.remove("cell--fading", "cell--win");
    cell.disabled = gameOver || val !== null;
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

function newRound() {
  board.fill(null);
  queues.X = [];
  queues.O = [];
  currentPlayer = "X";
  gameOver = false;
  winningLine = null;
  render();
  setStatus("Player X's turn", "X");
}

function resetAll() {
  scores.X = 0;
  scores.O = 0;
  updateScores();
  newRound();
}

document.getElementById("reset-round").addEventListener("click", newRound);
document.getElementById("reset-all").addEventListener("click", resetAll);

/* ============================================================
   Confetti — lightweight canvas particle burst on a win
   ============================================================ */
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

// --- Init ---
updateScores();
newRound();
