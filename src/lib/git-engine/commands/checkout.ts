import type { CommandHandler } from "../types";
import { switchCmd } from "./switch";

/**
 * `git checkout <branch>` y `git checkout -b <branch>` se delegan a switch.
 * Mapeamos `-b` a `-c` para reusar la lógica.
 */
export const checkoutCmd: CommandHandler = (state, parsed) => {
  // Si viene -b, convertir a -c y delegar.
  if (parsed.flags.b !== undefined) {
    const newFlags = { ...parsed.flags };
    newFlags.c = parsed.flags.b;
    delete newFlags.b;
    return switchCmd(state, { ...parsed, flags: newFlags });
  }
  return switchCmd(state, parsed);
};
