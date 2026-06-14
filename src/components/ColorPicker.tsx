import { motion } from "framer-motion";
import type { Player } from "../game/engine";
import { PALETTE } from "../game/colors";

interface ColorPickerProps {
  player: Player;
  label: string;
  value: string;
  onChange: (id: string) => void;
}

/** A row of selectable color swatches for a single player's mark. */
export function ColorPicker({ player, label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-left text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={`Player ${player} color`}
        className="flex flex-wrap gap-1.5"
      >
        {PALETTE.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.id)}
              className="relative grid h-6 w-6 place-items-center rounded-full transition active:scale-90"
              style={{
                background: c.base,
                boxShadow: active
                  ? `0 0 0 2px #10182f, 0 0 0 4px ${c.base}, 0 0 12px ${c.base}`
                  : `0 0 0 1px rgba(255,255,255,.15)`,
              }}
            >
              {active && (
                <motion.span
                  layoutId={`color-active-${player}`}
                  className="h-2 w-2 rounded-full bg-[#06121a]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
