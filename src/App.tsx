import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, RotateCcw, Users, Volume2, VolumeX } from "lucide-react";
import { Background } from "./components/Background";
import { Board } from "./components/Board";
import { Seg } from "./components/Seg";
import { HUMAN, useGame } from "./hooks/useGame";
import type { Mode } from "./hooks/useGame";
import { useSound } from "./hooks/useSound";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Difficulty } from "./game/ai";

export default function App() {
  const [muted, setMuted] = useLocalStorage("ttt:muted", false);
  const [mode, setMode] = useLocalStorage<Mode>("ttt:mode", "2p");
  const [difficulty, setDifficulty] = useLocalStorage<Difficulty>("ttt:difficulty", "medium");
  const sound = useSound(muted);
  const { state, scores, thinking, humanMove, newRound, resetScores } = useGame(
    sound,
    mode,
    difficulty
  );

  const cpu = mode === "cpu";

  // Keyboard controls: 1–9 place, R for a new round.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") humanMove(Number(e.key) - 1);
      else if (e.key.toLowerCase() === "r") newRound();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [humanMove, newRound]);

  const status = state.winner
    ? cpu
      ? state.winner === HUMAN
        ? "You win! 🎉"
        : "Computer wins!"
      : `Player ${state.winner} wins! 🎉`
    : thinking
      ? "Computer is thinking…"
      : cpu
        ? state.current === HUMAN
          ? "Your turn"
          : "Computer's turn"
        : `Player ${state.current}'s turn`;

  const statusColor = state.winner
    ? "#4ade80"
    : state.current === "X"
      ? "#22d3ee"
      : "#fb5fa0";

  return (
    <>
      <Background />
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative w-full rounded-[28px] border border-white/10 bg-[#10182f]/60 p-6 text-center shadow-[0_30px_70px_-20px_rgba(0,0,0,.75)] backdrop-blur-2xl"
        >
          {/* sound toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (!next) sound.click();
            }}
            aria-pressed={!muted}
            aria-label="Toggle sound"
            className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* title */}
          <h1 className="text-shimmer bg-gradient-to-r from-neon-x via-violet-400 to-neon-o bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            TripleTacToe
          </h1>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-slate-400">
            Only <strong className="text-slate-200">3</strong> pieces each — drop a 4th and
            your <strong className="text-slate-200">oldest</strong> vanishes. No draws. Pure
            tactics.
          </p>

          {/* settings */}
          <div className="mt-5 flex flex-col items-center gap-2.5">
            <Seg
              name="mode"
              value={mode}
              onChange={(m) => {
                sound.click();
                setMode(m);
                newRound();
              }}
              options={[
                { value: "2p", label: "2 Players", icon: <Users size={15} /> },
                { value: "cpu", label: "vs Computer", icon: <Bot size={15} /> },
              ]}
            />
            <AnimatePresence initial={false}>
              {cpu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <Seg
                    name="diff"
                    accent="violet"
                    value={difficulty}
                    onChange={(d) => {
                      sound.click();
                      setDifficulty(d);
                    }}
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* scoreboard */}
          <div className="mt-5 flex items-stretch gap-2.5">
            <ScoreCard
              player="X"
              label={cpu ? "You" : "Player X"}
              value={scores.X}
              active={!state.winner && state.current === "X"}
            />
            <div className="self-center font-mono text-xs font-bold tracking-widest text-slate-500">
              VS
            </div>
            <ScoreCard
              player="O"
              label={cpu ? "Computer" : "Player O"}
              value={scores.O}
              active={!state.winner && state.current === "O"}
            />
          </div>

          {/* status */}
          <div className="mt-4 flex justify-center">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm font-semibold"
              style={{ color: statusColor }}
            >
              <span
                className="h-2 w-2 rounded-full animate-blink"
                style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}
              />
              {status}
            </motion.div>
          </div>

          {/* board */}
          <Board
            state={state}
            locked={thinking || (cpu && state.current !== HUMAN)}
            onCellClick={humanMove}
          />

          {/* controls */}
          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.click();
                newRound();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-[#06121a] transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(100deg,#22d3ee,#a78bfa,#fb5fa0)",
                boxShadow: "0 12px 28px -12px rgba(167,139,250,.9)",
              }}
            >
              <RotateCcw size={17} /> New Round
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                resetScores();
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
            >
              Reset Scores
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Press <Kbd>1</Kbd>–<Kbd>9</Kbd> to place · <Kbd>R</Kbd> for new round
          </p>
        </motion.div>
      </main>
    </>
  );
}

function ScoreCard({
  player,
  label,
  value,
  active,
}: {
  player: "X" | "O";
  label: string;
  value: number;
  active: boolean;
}) {
  const color = player === "X" ? "#22d3ee" : "#fb5fa0";
  return (
    <motion.div
      animate={{ y: active ? -3 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex-1 overflow-hidden rounded-2xl border bg-black/20 px-3 py-3"
      style={{
        borderColor: active ? color : "rgba(255,255,255,.08)",
        boxShadow: active ? `0 14px 30px -12px ${color}` : "none",
      }}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span
          className="grid h-6 w-6 place-items-center rounded-lg font-mono text-sm font-bold"
          style={{ color, background: `${color}22`, boxShadow: `inset 0 0 0 1px ${color}66` }}
        >
          {player}
        </span>
        <span className="text-[0.72rem] uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1.5, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 18 }}
        className="mt-1 font-mono text-3xl font-bold"
        style={{ color, textShadow: `0 0 18px ${color}73` }}
      >
        {value}
      </motion.div>
    </motion.div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.7rem] text-slate-200">
      {children}
    </kbd>
  );
}
