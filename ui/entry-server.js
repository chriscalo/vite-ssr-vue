import { renderToString } from "vue/server-renderer";
import { createApp } from "./main.js";

// TODO: look up the Vue component that corresponds to the request URL path
// Examples:
//   / => /pages/index.page.vue
//   /home/ => /pages/home/index.page.vue
//   /settings/ => /settings/index.page.vue
export async function render() {
  const { app } = createApp();
  
  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = { };
  const html = await renderToString(app, ctx);
  
  return { html };
};
