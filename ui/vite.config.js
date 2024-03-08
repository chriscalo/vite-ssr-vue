import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { cjsify } from "common";

const { __dirname } = cjsify(import.meta);

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  appType: "custom",
  plugins: [vue()],
});
