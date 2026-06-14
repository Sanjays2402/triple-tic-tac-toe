import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegProps<T extends string> {
  name: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  accent?: "brand" | "violet";
}

/** Segmented control with a sliding shared-layout active pill. */
export function Seg<T extends string>({
  name,
  value,
  options,
  onChange,
  accent = "brand",
}: SegProps<T>) {
  return (
    <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              active
                ? accent === "violet"
                  ? "text-white"
                  : "text-[#06121a]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${name}`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-xl"
                style={{
                  background:
                    accent === "violet"
                      ? "linear-gradient(100deg,#a78bfa,#6366f1)"
                      : "linear-gradient(100deg,var(--color-neon-x),var(--color-neon-o))",
                  boxShadow: "0 6px 16px -8px rgba(167,139,250,.9)",
                }}
              />
            )}
            {o.icon}
            <span className="whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
