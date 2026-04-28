import type { CommandHandler } from "../types";
import { initCmd } from "./init";
import { addCmd } from "./add";
import { commitCmd } from "./commit";
import { statusCmd } from "./status";
import { logCmd } from "./log";
import { diffCmd } from "./diff";
import { rmCmd } from "./rm";
import { configCmd } from "./config";
import { branchCmd } from "./branch";
import { switchCmd } from "./switch";
import { checkoutCmd } from "./checkout";
import { remoteCmd } from "./remote";
import { pushCmd } from "./push";
import { pullCmd } from "./pull";
import { mergeCmd } from "./merge";

/**
 * Mapa de subcomando -> handler. El engine.ts despacha aquí.
 */
export const commandMap: Record<string, CommandHandler> = {
  init: initCmd,
  add: addCmd,
  commit: commitCmd,
  status: statusCmd,
  log: logCmd,
  diff: diffCmd,
  rm: rmCmd,
  config: configCmd,
  branch: branchCmd,
  switch: switchCmd,
  checkout: checkoutCmd,
  remote: remoteCmd,
  push: pushCmd,
  pull: pullCmd,
  merge: mergeCmd,
};
