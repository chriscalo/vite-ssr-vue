import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { globbySync } from "globby";
import { cjsify, path as makePath } from "common";

const { __dirname } = cjsify(import.meta);
const input = htmlPageEntryPoints();
printHtmlPageInfo(input);

// https://vitejs.dev/config/
export default defineConfig({
  root: makePath`${__dirname}/pages`,
  appType: "mpa",
  plugins: [vue()],
  build: {
    ssr: false,
    rollupOptions: {
      input,
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
});

function htmlPageEntryPoints() {
  const pattern = ["pages/**/*.html", "!**/dist", "!**/node_modules"];
  const options = { cwd: __dirname };
  const entries = globbySync(pattern, options).map(htmlFilePath => {
    const { dir, name } = path.parse(htmlFilePath);
    const entryPointName = makePath`${dir}/${name}`;
    const entryPointPath = makePath`${__dirname}/${htmlFilePath}`;
    return [ entryPointName, entryPointPath ];
  });
  return Object.fromEntries(entries);
}

function printHtmlPageInfo(info) {
  const entries = Object.entries(info);
  console.debug(`HTML pages found: ${entries.length}`);
  for (const [name, path] of entries) {
    console.debug(`- ${name}: ${path}`);
  }
}
