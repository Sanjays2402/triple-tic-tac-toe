import { useEffect } from "react";
import type { Player } from "../game/engine";
import { DEFAULT_COLOR, getColor } from "../game/colors";
import type { NeonColor } from "../game/colors";
import { useLocalStorage } from "./useLocalStorage";

export interface PlayerColors {
  X: NeonColor;
  O: NeonColor;
}

/**
 * Persists each player's chosen color and reflects it onto the document root
 * as CSS variables so the whole UI (marks, glows, accents) re-themes live.
 */
export function useColors() {
  const [xId, setXId] = useLocalStorage("ttt:color:X", DEFAULT_COLOR.X);
  const [oId, setOId] = useLocalStorage("ttt:color:O", DEFAULT_COLOR.O);

  const colors: PlayerColors = {
    X: getColor(xId, "X"),
    O: getColor(oId, "O"),
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-neon-x", colors.X.base);
    root.style.setProperty("--color-neon-xs", colors.X.soft);
    root.style.setProperty("--color-neon-o", colors.O.base);
    root.style.setProperty("--color-neon-os", colors.O.soft);
  }, [colors.X.base, colors.X.soft, colors.O.base, colors.O.soft]);

  const setColor = (player: Player, id: string) =>
    (player === "X" ? setXId : setOId)(id);

  return { colors, setColor };
}
