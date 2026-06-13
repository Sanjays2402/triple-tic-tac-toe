import { AnimatePresence, motion } from "framer-motion";
import type { CellValue, Player } from "../game/engine";

interface CellProps {
  value: CellValue;
  index: number;
  turn: Player;
  disabled: boolean;
  fading: boolean;
  highlight: boolean;
  onClick: (i: number) => void;
}

export function Cell({
  value,
  index,
  turn,
  disabled,
  fading,
  highlight,
  onClick,
}: CellProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onClick(index)}
      aria-label={`Cell ${index + 1}`}
      whileHover={disabled ? undefined : { y: -4, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className="group relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#0d1026]/80 font-mono text-[clamp(2.2rem,12vw,3.4rem)] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_8px_18px_-10px_rgba(0,0,0,.8)] transition-colors hover:bg-[#181c38]/90 disabled:cursor-default disabled:hover:bg-[#0d1026]/80"
    >
      {/* hover ghost preview of the current player's mark */}
      {!value && !disabled && (
        <span
          className={`pointer-events-none absolute select-none opacity-0 transition-opacity duration-150 group-hover:opacity-[0.16] ${
            turn === "X" ? "neon-x" : "neon-o"
          }`}
        >
          {turn}
        </span>
      )}

      <AnimatePresence mode="popLayout">
        {value && (
          <motion.span
            key={value}
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: fading ? [1, 0.25, 1] : 1 }}
            exit={{ scale: 0, opacity: 0, filter: "blur(6px)" }}
            transition={{
              scale: { type: "spring", stiffness: 480, damping: 22 },
              rotate: { type: "spring", stiffness: 480, damping: 22 },
              opacity: fading
                ? { repeat: Infinity, duration: 1, ease: "easeInOut" }
                : { duration: 0.2 },
            }}
            className={value === "X" ? "neon-x" : "neon-o"}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>

      {/* warning ring on the piece about to vanish */}
      {fading && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-amber-400/60"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        />
      )}

      {/* winning-cell highlight */}
      {highlight && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl bg-neon-win/15 ring-2 ring-neon-win"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}
