import { createSSRApp } from "vue";
import Index from "./index.vue";

export function createApp() {
  return createSSRApp(Index);
};
