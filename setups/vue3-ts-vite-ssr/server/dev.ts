import express from "express";
import { resolve as res } from "path";
import { readFileSync } from "fs";
import { createServer as viteCreateServer, InlineConfig as ViteCreateServerConfig, ViteDevServer } from "vite";
import { ServerRenderFunction } from "../src/types/ServerRenderFunction";
import { getHtml } from "./utils/getHtml";

interface SRFModule {
  render: ServerRenderFunction;
}

let isDev = process.env.NODE_ENV === "development";
if (!isDev) {
  process.env.NODE_ENV = "development";
  isDev = true;
}

const resolve = (...p: string[]) => res(process.cwd(), ...p);

const PORT = process.env.PORT || 3000;
const app = express();
let viteDevServer: ViteDevServer;

const viteConfig: ViteCreateServerConfig = {
  logLevel: "info",
  server: { middlewareMode: "ssr", watch: { usePolling: true, interval: 100 } }
};

(async (root = process.cwd()) => {
  viteConfig.root = root;
  viteDevServer = await viteCreateServer(viteConfig);
  app.use(viteDevServer.middlewares);

  app.use("*", async (req, res) => {
    const { originalUrl: url } = req;
    // @ts-ignore
    const clientData = require("../src/entry-data");
    const data = { ...clientData, SSR: true, host: `http://localhost:${PORT}`, dev: true, prod: false };

    try {
      const rawFile = readFileSync(resolve("index.html"), "utf-8");
      const template = await viteDevServer.transformIndexHtml(url, rawFile);
      const { render } = (await viteDevServer.ssrLoadModule("/src/entry-server.ts")) as SRFModule;

      const html = await getHtml({ url, render, isProd: false, template, data }, "../../client/ssr-manifest.json");
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (e instanceof Error) {
        viteDevServer.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    }
  });

  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();
