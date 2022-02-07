import express from "express";
import { resolve as res } from "path";
import { readFileSync } from "fs";
import { createServer as viteCreateServer, InlineConfig as ViteCreateServerConfig, ViteDevServer } from "vite";
import compression from "compression";
import serveStatic from "serve-static";
import { ServerRenderFunction } from "./src/types/ServerRenderFunction";
import { getHtml } from "./server/utils/getHtml";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const _isProd = process.env.NODE_ENV === "production";

const PORT = process.env.PORT || _isProd ? 5000 : 3000;

const app = express();
let vite: ViteDevServer;

const viteConfig: ViteCreateServerConfig = {
  logLevel: isTest ? "error" : "info",
  server: { middlewareMode: "ssr", watch: { usePolling: true, interval: 100 } }
};

const resolve = (...p: string[]) => res(__dirname, ...p);

export const createServer = async (root = process.cwd(), isProd = _isProd) => {
  viteConfig.root = root;

  // @ts-ignore
  const indexProd = isProd ? readFileSync(resolve("dist/client/index.html"), "utf-8") : "";

  if (isProd) {
    app.use(compression());
    app.use(serveStatic(resolve("dist", "client"), { index: false }));
  } else {
    vite = await viteCreateServer(viteConfig);
    app.use(vite.middlewares);
  }

  app.use("*", async (req, res) => {
    const { originalUrl: url } = req;
    let template: string, render: ServerRenderFunction;

    try {
      if (isProd) {
        template = indexProd;
        render = require("./dist/server/entry-server.js").render;
      } else {
        const rawFile = readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, rawFile);
        render = (await vite.ssrLoadModule("/src/entry-server.ts")).render;
      }

      const html = await getHtml({ url, render, isProd, template });

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (e instanceof Error) {
        vite && vite.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    }
  });

  return { app, vite };
};

if (!isTest) {
  (async () => {
    const { app } = await createServer();
    app.listen(3000, () => console.log("http://localhost:3000"));
  })();
}
