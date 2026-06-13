import { useCallback, useMemo, useRef } from "react";
import type { Player } from "../game/engine";

export interface Sound {
  place: (p: Player) => void;
  vanish: () => void;
  win: () => void;
  click: () => void;
}

/** Synth sound effects via the Web Audio API — no asset files required. */
export function useSound(muted: boolean): Sound {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (muted) return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, [muted]);

  const tone = useCallback(
    (
      freq: number,
      dur: number,
      type: OscillatorType = "sine",
      gain = 0.08,
      when = 0
    ) => {
      const ac = getCtx();
      if (!ac) return;
      const t0 = ac.currentTime + when;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [getCtx]
  );

  return useMemo<Sound>(
    () => ({
      place: (p) => tone(p === "X" ? 540 : 410, 0.12, "triangle", 0.09),
      vanish: () => {
        const ac = getCtx();
        if (!ac) return;
        const t0 = ac.currentTime;
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, t0);
        osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.25);
        g.gain.setValueAtTime(0.06, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
        osc.connect(g).connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + 0.3);
      },
      win: () =>
        [523, 659, 784, 1046].forEach((f, i) =>
          tone(f, 0.18, "triangle", 0.08, i * 0.09)
        ),
      click: () => tone(660, 0.05, "square", 0.04),
    }),
    [tone, getCtx]
  );
}
