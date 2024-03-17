import { createApp } from "./index.js";

const app = createApp();

// mounting an SSR app on the client assumes
// the HTML was pre-rendered and will perform
// hydration instead of mounting new DOM nodes.
app.mount("#app");
