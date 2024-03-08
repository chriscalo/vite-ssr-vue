import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cjsify } from "./module.js";

const { require } = cjsify(import.meta);

export function file(filePath) {
  // TODO: can we `import("caller")` instead?
  const caller = require("caller");
  const callerDir = dirname(fileURLToPath(caller()));
  const fullPath = resolve(callerDir, filePath);
  return readFileSync(fullPath, { encoding: "utf-8" });
};

// tagged template function for ergonomically building paths
export function path(strings, ...values) {
  const maxLength = Math.max(strings.length, values.length);
  let parts = [];
  let i = 0;
  while (i < maxLength) {
    if (i < strings.length) parts.push(strings[i]);
    if (i < values.length) parts.push(values[i]);
    i++;
  }
  return join(...parts);
};
