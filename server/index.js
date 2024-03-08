import express from "express";
import uiServer from "ui";
import { listen } from "common";

const server = express();
server.use(uiServer);

const { url } = await listen(server, 8080);
console.info(`Server running at ${url}`);
