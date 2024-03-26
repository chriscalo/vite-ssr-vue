import express from "express";
import compression from "compression";

const { dirname } = import.meta;
const DEVELOPMENT = (process.env.NODE_ENV !== "production");

const server = express();
export default server;

const viteReady = startVite();

server.use(compression());

server.use(async function (req, res, next) {
  await viteReady;
  next();
});

server.use(express.static(`${dirname}/public/`));
server.use(express.static(`${dirname}/dist/`));

async function startVite() {
  if (DEVELOPMENT) {
    await npmRun("build");
  }
}

async function npmRun(...args) {
  const { spawnSync } = await import("node:child_process");
  spawnSync("npm", ["run", ...args], {
    cwd: dirname,
    stdio: "inherit",
  });
}
