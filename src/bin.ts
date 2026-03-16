#!/usr/bin/env node

import { resolve } from "node:path";
import { loadDotEnv } from "./config.js";
import { createProgram } from "./cli.js";

loadDotEnv(process.cwd());
loadDotEnv(resolve(import.meta.dirname, ".."));

const program = createProgram();
program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exit(1);
});
