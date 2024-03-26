import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { globbySync } from "globby";
import { htmlIncludes } from "common";

const PRODUCTION = process.env.NODE_ENV === "production";
const { dirname } = import.meta;

const input = htmlPageEntryPoints();
printHtmlPageInfo(input);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: !PRODUCTION,
  },
  root: `${dirname}/pages`,
  appType: "mpa",
  plugins: [vue(), htmlIncludes()],
  resolve: {
    alias: {
      "!": dirname,
      "~": `${dirname}/../`,
    },
  },
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
  const options = { cwd: dirname };
  const entries = globbySync(pattern, options).map(htmlFilePath => {
    const { dir, name } = path.parse(htmlFilePath);
    const entryPointName = `${dir}/${name}`;
    const entryPointPath = `${dirname}/${htmlFilePath}`;
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
