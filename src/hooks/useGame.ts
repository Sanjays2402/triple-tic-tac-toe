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
  const prevRef = useRef<GameState | null>(null);

  const commit = useCallback((index: number) => {
    setState((prev) => (prev.winner || prev.board[index] ? prev : applyMove(prev, index)));
  }, []);

  const humanMove = useCallback(
    (index: number) => {
      if (state.winner || thinking) return;
      if (mode === "cpu" && state.current !== HUMAN) return;
      commit(index);
    },
    [state, thinking, mode, commit]
  );

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
      commit(move);
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
    setState(initialState());
    setThinking(false);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0 });
    newRound();
  }, [newRound, setScores]);

  return { state, scores, thinking, humanMove, newRound, resetScores };
}
