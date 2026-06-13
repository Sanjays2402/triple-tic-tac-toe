// Pure, framework-agnostic game logic for Triple Tic-Tac-Toe.
// Each player keeps at most MAX_PIECES on the board; a 4th placement removes
// that player's oldest piece (FIFO), so the game can never end in a draw.

export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];

export const MAX_PIECES = 3;

export const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export interface GameState {
  board: Board;
  queues: { X: number[]; O: number[] };
  current: Player;
  winner: Player | null;
  winningLine: number[] | null;
  lastRemoved: number | null;
}

export function initialState(): GameState {
  return {
    board: Array(9).fill(null),
    queues: { X: [], O: [] },
    current: "X",
    winner: null,
    winningLine: null,
    lastRemoved: null,
  };
}

export function checkWin(board: Board, player: Player): number[] | null {
  return LINES.find((line) => line.every((i) => board[i] === player)) ?? null;
}

/** Returns a new immutable state with the move applied (or the same state if illegal). */
export function applyMove(state: GameState, index: number): GameState {
  if (state.winner || state.board[index]) return state;

  const board = state.board.slice();
  const queues = { X: state.queues.X.slice(), O: state.queues.O.slice() };
  const player = state.current;
  const queue = queues[player];

  let lastRemoved: number | null = null;
  if (queue.length >= MAX_PIECES) {
    lastRemoved = queue.shift()!;
    board[lastRemoved] = null;
  }
  board[index] = player;
  queue.push(index);

  const winningLine = checkWin(board, player);
  return {
    board,
    queues,
    current: winningLine ? player : player === "X" ? "O" : "X",
    winner: winningLine ? player : null,
    winningLine,
    lastRemoved,
  };
}
