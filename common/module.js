import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export function cjsify(importMeta) {
  const require = createRequire(importMeta.url);
  const __filename = fileURLToPath(importMeta.url);
  const __dirname = dirname(__filename);
  
  return {
    require,
    __filename,
    __dirname,
  };
};
