// Computer opponent for the 3-piece variant.
//  - easy:   takes an obvious win, otherwise random
//  - medium: wins if possible, blocks the opponent's win, otherwise random
//  - hard:   depth-limited minimax with alpha-beta pruning

import type { Board, GameState, Player } from "./engine";
import { LINES, MAX_PIECES } from "./engine";

export type Difficulty = "easy" | "medium" | "hard";

const AI_DEPTH = 6;

interface Mini {
  board: Board;
  queues: { X: number[]; O: number[] };
}

function emptyCells(b: Board): number[] {
  const r: number[] = [];
  for (let i = 0; i < 9; i++) if (!b[i]) r.push(i);
  return r;
}

function randomOf<T>(a: T[]): T {
  return a[(Math.random() * a.length) | 0];
}

function simulate(s: Mini, i: number, p: Player): Mini {
  const board = s.board.slice();
  const queues = { X: s.queues.X.slice(), O: s.queues.O.slice() };
  const q = queues[p];
  if (q.length >= MAX_PIECES) board[q.shift()!] = null;
  board[i] = p;
  q.push(i);
  return { board, queues };
}

function winsFor(b: Board, p: Player): boolean {
  return LINES.some((line) => line.every((i) => b[i] === p));
}

function findWinningMove(s: Mini, p: Player): number | null {
  for (const i of emptyCells(s.board)) {
    if (winsFor(simulate(s, i, p).board, p)) return i;
  }
  return null;
}

function evaluate(b: Board, cpu: Player, human: Player): number {
  let score = 0;
  for (const line of LINES) {
    let c = 0;
    let h = 0;
    for (const idx of line) {
      if (b[idx] === cpu) c++;
      else if (b[idx] === human) h++;
    }
    if (c > 0 && h === 0) score += c === 2 ? 12 : 1;
    else if (h > 0 && c === 0) score -= h === 2 ? 12 : 1;
  }
  return score;
}

function minimax(
  s: Mini,
  player: Player,
  cpu: Player,
  human: Player,
  depth: number,
  alpha: number,
  beta: number
): number {
  if (depth >= AI_DEPTH) return evaluate(s.board, cpu, human);
  const moves = emptyCells(s.board);

  if (player === cpu) {
    let best = -Infinity;
    for (const i of moves) {
      const n = simulate(s, i, cpu);
      const sc = winsFor(n.board, cpu)
        ? 1000 - depth
        : minimax(n, human, cpu, human, depth + 1, alpha, beta);
      if (sc > best) best = sc;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const i of moves) {
    const n = simulate(s, i, human);
    const sc = winsFor(n.board, human)
      ? -1000 + depth
      : minimax(n, cpu, cpu, human, depth + 1, alpha, beta);
    if (sc < best) best = sc;
    if (best < beta) beta = sc;
    if (beta <= alpha) break;
  }
  return best;
}

function minimaxRoot(s: Mini, cpu: Player, human: Player): number {
  let bestScore = -Infinity;
  let candidates: number[] = [];
  for (const i of emptyCells(s.board)) {
    const n = simulate(s, i, cpu);
    const sc = winsFor(n.board, cpu)
      ? 1000
      : minimax(n, human, cpu, human, 1, -Infinity, Infinity);
    if (sc > bestScore) {
      bestScore = sc;
      candidates = [i];
    } else if (sc === bestScore) {
      candidates.push(i);
    }
  }
  return candidates.length ? randomOf(candidates) : randomOf(emptyCells(s.board));
}

export function chooseMove(
  state: GameState,
  cpu: Player,
  human: Player,
  difficulty: Difficulty
): number {
  const s: Mini = { board: state.board, queues: state.queues };
  const avail = emptyCells(s.board);

  if (difficulty === "easy") {
    return findWinningMove(s, cpu) ?? randomOf(avail);
  }
  if (difficulty === "medium") {
    return findWinningMove(s, cpu) ?? findWinningMove(s, human) ?? randomOf(avail);
  }
  return findWinningMove(s, cpu) ?? minimaxRoot(s, cpu, human);
}
