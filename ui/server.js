import path from "node:path";
import express from "express";
import compression from "compression";
import { cjsify, file } from "common";

const { __dirname } = cjsify(import.meta);
const DEVELOPMENT = (process.env.NODE_ENV !== "production");

const server = express();
export default server;

server.use(compression());

const viteReady = startVite();

async function startVite() {
  if (DEVELOPMENT) {
    // Vite's `build()` function doesn't work, so use the CLI instead
    const { spawnSync } = await import("node:child_process");
    spawnSync("npm", ["run", "build"], {
      cwd: __dirname,
      stdio: "inherit",
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
  return async function (req, res, next) {
    try {
      // TODO: use URL path to find correct server and client assets
      const url = new URL(req.originalUrl, "http://localhost");
      if (url.pathname !== "/") {
        return next();
      }
      
      const htmlPath = path.resolve(__dirname, "dist/client/index.html");
      let html = file(htmlPath);
      
      const { render } = await import(`./dist/server/index.server.js`);
      const output = await render(req);
      console.dir(output);
      
      html = html.replace(`<!--slot-body-->`, output.html);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      next(error);
    }
  };
}

server.use(async function (req, res, next) {
  const { staticHandler } = await viteReady;
  staticHandler(req, res, next);
});

server.use("*", async function (req, res, next) {
  const { ssrHandler } = await viteReady;
  ssrHandler(req, res, next);
});
