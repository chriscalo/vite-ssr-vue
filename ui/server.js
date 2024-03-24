import express from "express";
import compression from "compression";
import { cjsify } from "common";

const { __dirname } = cjsify(import.meta);
const DEVELOPMENT = (process.env.NODE_ENV !== "production");

const server = express();
export default server;

server.use(compression());

const viteReady = startVite();

async function startVite() {
  if (DEVELOPMENT) {
    await npmRun("build");
  }
  
  return {
    staticHandler: createStaticHandler(),
  };
}

function createStaticHandler() {
  const staticPath = `${__dirname}/dist/`;
  return express.static(staticPath);
}

server.use(async function (req, res, next) {
  const { staticHandler } = await viteReady;
  staticHandler(req, res, next);
});

async function npmRun(...args) {
  const { spawnSync } = await import("node:child_process");
  spawnSync("npm", ["run", ...args], {
    cwd: __dirname,
    stdio: "inherit",
  });
}
