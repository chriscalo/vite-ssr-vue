import { cjsify, file } from "common";
import express from "express";
import compression from "compression";


const { __dirname } = cjsify(import.meta);
const DEVELOPMENT = (process.env.NODE_ENV !== "production");

const server = express();
export default server;
const viteHandlers = startVite();

server.use(compression());

// serve Vite's static assets
server.use(async function (req, res, next) {
  console.log("staticHandler", req.originalUrl);
  const { staticHandler } = await viteHandlers;
  staticHandler(req, res, next);
});

// serve Vites's middlewares
server.use(async function (req, res, next) {
  console.log("ssrHandler", req.originalUrl);
  const { ssrHandler } = await viteHandlers;
  const { locals } = res;
  locals.req = req;
  locals.res = res;
  ssrHandler(req, res, next, locals);
});

async function startVite() {
  if (DEVELOPMENT) {
    // Vite's `build()` function doesn't work, so use the CLI instead
    const { spawnSync } = await import("node:child_process");
    spawnSync("npm", ["run", "build"], {
      cwd: __dirname,
    });
  }
  
  return {
    staticHandler: createStaticHandler(),
    ssrHandler: createSSRHandler(),
  };
}

function createStaticHandler() {
  // See https://expressjs.com/en/starter/static-files.html
  const options = {
    // IMPORTANT: Use `index: false` to disable serving `index.html` pages
    // when a directory is requested because we want all HTML requests to be
    // server-rendered.
    index: false,
  };
  
  const staticPath = `${__dirname}/dist/client/`;
  return express.static(staticPath, options);
}

function createSSRHandler() {
  // FIXME: look up HTML file corresponding to URL path?
  const templateHtml = file("./dist/client/pages/index.html");
  const ssrManifest = file("./dist/client/.vite/ssr-manifest.json");
  
  // FIXME: use SSR handler only if the URL path matches an SSR HTML file
  return async function ssrHandler(req, res, next) {
    try {
      const url = req.originalUrl;
      
      // import the server entry point on each request
      const { render } = await import("./dist/server/entry-server.js");
      const rendered = await render(url, ssrManifest);
      
      const html = templateHtml
        .replace(`<!--app-head-->`, rendered.head ?? "")
        .replace(`<!--app-html-->`, rendered.html ?? "");
      
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error(error.stack);
      res.status(500).end(error.stack);
    }
  };
}
