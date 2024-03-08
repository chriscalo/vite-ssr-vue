import { spawnSync } from "node:child_process";
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
  const { staticHandler } = await viteHandlers;
  staticHandler(req, res, next);
});

// serve Vites's middlewares
server.use(async function (req, res, next) {
  const { ssrHandler } = await viteHandlers;
  const { locals } = res;
  locals.req = req;
  locals.res = res;
  ssrHandler(req, res, next, locals);
});

async function startVite() {
  if (DEVELOPMENT) {
    // const { build } = await import("vite");
    spawnSync("npm", ["run", "build"], {
      cwd: __dirname,
    });
    // await build({
    //   root: __dirname,
    //   mode: "production",
    // });
    console.log("build complete");
  }
  
  return {
    staticHandler: createStaticHandler(),
    ssrHandler: createSSRHandler(),
  };
}

function createStaticHandler() {
  const staticPath = `${__dirname}/dist/client/`;
  return express.static(staticPath);
}

function createSSRHandler() {
  const templateHtml = file("./dist/client/index.html");
  const ssrManifest = file("./dist/client/.vite/ssr-manifest.json");
  
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
