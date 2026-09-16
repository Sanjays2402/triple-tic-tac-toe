import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { applyMove, initialState } from "../game/engine";
import type { GameState, Player } from "../game/engine";
import { chooseMove } from "../game/ai";
import type { Difficulty } from "../game/ai";
import { useLocalStorage } from "./useLocalStorage";
import type { Sound } from "./useSound";

export type Mode = "2p" | "cpu";
export interface Scores {
  X: number;
  O: number;
}

export const HUMAN: Player = "X";
export const CPU: Player = "O";

function fireConfetti(winner: Player) {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    css.getPropertyValue(name).trim() || fallback;
  const colors =
    winner === "X"
      ? [read("--color-neon-x", "#22d3ee"), read("--color-neon-xs", "#67e8f9"), "#a78bfa", "#ffffff"]
      : [read("--color-neon-o", "#fb5fa0"), read("--color-neon-os", "#fda4d0"), "#a78bfa", "#ffffff"];
  confetti({
    particleCount: 150,
    spread: 95,
    startVelocity: 42,
    origin: { y: 0.32 },
    colors,
    scalar: 1.05,
  });
}

export function useGame(sound: Sound, mode: Mode, difficulty: Difficulty) {
  const [state, setState] = useState<GameState>(initialState);
  const [scores, setScores] = useLocalStorage<Scores>("ttt:scores", { X: 0, O: 0 });
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState<GameState[]>([]);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const prevRef = useRef<GameState | null>(null);
  // Fresh handle on state for event handlers (updaters must stay side-effect free).
  const stateRef = useRef(state);
  stateRef.current = state;

  // Applies a legal move; records the pre-move state so it can be undone.
  const commit = useCallback((prev: GameState, index: number) => {
    if (prev.winner || prev.board[index]) return prev;
    setHintIndex(null); // any move invalidates the old hint
    setHistory((h) => [...h, prev]);
    return applyMove(prev, index);
  }, []);

  // Highlight the strongest move for the current player (hard-AI search).
  const requestHint = useCallback(() => {
    const s = stateRef.current;
    if (s.winner || mode === "cpu" && s.current !== HUMAN) return;
    const me = s.current;
    const opp: Player = me === "X" ? "O" : "X";
    setHintIndex(chooseMove(s, me, opp, "hard"));
  }, [mode]);

  const humanMove = useCallback(
    (index: number) => {
      const prev = stateRef.current;
      if (prev.winner || thinking) return;
      if (mode === "cpu" && prev.current !== HUMAN) return;
      setState(commit(prev, index));
    },
    [thinking, mode, commit]
  );

  // Undo the last move (in vs-Computer mode: take back the computer's reply too).
  const undo = useCallback(() => {
    if (thinking || state.winner) return;
    const steps = mode === "cpu" ? 2 : 1;
    if (history.length < steps) return;
    const restored = history[history.length - steps];
    prevRef.current = restored; // keep the sound effect from re-firing on revert
    setHistory(history.slice(0, history.length - steps));
    setState(restored);
  }, [history, mode, state.winner, thinking]);

  const canUndo =
    !thinking && !state.winner && history.length >= (mode === "cpu" ? 2 : 1);

  // Computer's turn
  useEffect(() => {
    if (mode !== "cpu" || state.winner || state.current !== CPU) {
      setThinking(false);
      return;
    }
    setThinking(true);
    const id = window.setTimeout(() => {
      const move = chooseMove(state, CPU, HUMAN, difficulty);
      setThinking(false);
      setState(commit(state, move));
    }, 450 + Math.random() * 350);
    return () => window.clearTimeout(id);
  }, [state, mode, difficulty, commit]);

  // Place / vanish sounds whenever the board changes
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state;
    if (!prev) return;
    if (state.board.join("") !== prev.board.join("")) {
      const emptyBefore = prev.board.filter((c) => !c).length;
      const emptyAfter = state.board.filter((c) => !c).length;
      sound.place(prev.current);
      if (emptyAfter === emptyBefore) sound.vanish(); // a piece was recycled
    }
  }, [state, sound]);

  // Win celebration (runs once per winner change)
  useEffect(() => {
    if (!state.winner) return;
    const w = state.winner;
    setScores((s) => ({ ...s, [w]: s[w] + 1 }));
    sound.win();
    fireConfetti(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.winner]);

  const newRound = useCallback(() => {
    prevRef.current = null;
    setHistory([]);
    setHintIndex(null);
    setState(initialState());
    setThinking(false);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0 });
    newRound();
  }, [newRound, setScores]);

  return { state, scores, thinking, hintIndex, humanMove, undo, canUndo, newRound, resetScores, requestHint };
}
