import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import { Cell } from "./Cell";
import { MAX_PIECES } from "../game/engine";
import type { GameState } from "../game/engine";

interface BoardProps {
  state: GameState;
  locked: boolean;
  onCellClick: (i: number) => void;
}

const center = (i: number) => ({ x: (i % 3) + 0.5, y: Math.floor(i / 3) + 0.5 });

export function Board({ state, locked, onCellClick }: BoardProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), {
    stiffness: 150,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), {
    stiffness: 150,
    damping: 16,
  });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const fadingIndex =
    !state.winner && state.queues[state.current].length >= MAX_PIECES
      ? state.queues[state.current][0]
      : -1;
  const winSet = new Set(state.winningLine ?? []);
  const a = state.winningLine ? center(state.winningLine[0]) : null;
  const b = state.winningLine ? center(state.winningLine[2]) : null;

  return (
    <div style={{ perspective: 1200 }} className="mt-5">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-[26px] border border-white/10 p-2.5"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-60"
          style={{
            background: "linear-gradient(145deg, rgba(34,211,238,.12), rgba(251,95,160,.12))",
          }}
        />
        <div
          className="relative grid grid-cols-3 gap-2.5"
          style={{ transform: "translateZ(40px)" }}
        >
          {state.board.map((v, i) => (
            <Cell
              key={i}
              index={i}
              value={v}
              turn={state.current}
              disabled={locked || !!v || !!state.winner}
              fading={i === fadingIndex}
              highlight={winSet.has(i)}
              onClick={onCellClick}
            />
          ))}
        </div>

        {a && b && (
          <svg
            className="pointer-events-none absolute inset-2.5"
            viewBox="0 0 3 3"
            preserveAspectRatio="none"
            style={{ transform: "translateZ(60px)" }}
          >
            <motion.line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-neon-win)"
              strokeWidth={0.12}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 6px var(--color-neon-win))" }}
            />
          </svg>
        )}
      </motion.div>
    </div>
  );
}
