import { parse, join } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { globbySync } from "globby";
import { cjsify } from "common";

const { __dirname } = cjsify(import.meta);
const input = htmlEntryPoints();

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  appType: "mpa",
  plugins: [vue()],
  build: {
    rollupOptions: {
      input,
    },
  },
});

function htmlEntryPoints() {
  const pattern = ["**/*.html", "!dist", "!node_modules"];
  const options = { cwd: __dirname };
  const entries = globbySync(pattern, options).map(htmlFile => {
    const { dir, name } = parse(htmlFile);
    const key = join(dir, name);
    const value = join(__dirname, htmlFile);
    return [ key, value ];
  });
  return Object.fromEntries(entries);
}
