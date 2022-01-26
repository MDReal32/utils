import express from "express";
import { resolve as res } from "path";
import { readFileSync } from "fs";
import { createServer as viteCreateServer, ViteDevServer, InlineConfig as ViteCreateServerConfig } from "vite";
import compression from "compression";
import serveStatic from "serve-static";
import { Render } from "./src/entry-server";
import { renderPreloadLinks } from "./server/utils/renderPreloadLinks";
import { minify, Options as MinifierOption } from "html-minifier";
import { format, Options as PrettierOptions } from "prettier";

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const _isProd = process.env.NODE_ENV === "production";

const app = express();
let vite: ViteDevServer;

const prettierOptions: PrettierOptions = {
  parser: "html",
  ...JSON.parse(readFileSync(res(process.cwd(), ".prettierrc"), "utf-8"))
};
const minifierOptions: MinifierOption = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  html5: true,
  sortAttributes: true
};

const viteConfig: ViteCreateServerConfig = {
  logLevel: isTest ? "error" : "info",
  server: {
    middlewareMode: "ssr",
    watch: {
      // During tests we edit the files too fast and sometimes chokidar
      // misses change events, so enforce polling for consistency
      usePolling: true,
      interval: 100
    }
  }
};

const resolve = (...p: string[]) => res(__dirname, ...p);

export const createServer = async (root = process.cwd(), isProd = _isProd) => {
  viteConfig.root = root;

  // @ts-ignore
  const manifest = isProd ? require("./dist/client/ssr-manifest.json") : {};
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
    let template: string, render: Render;

    try {
      if (isProd) {
        template = indexProd;
        render = require("./dist/server/entry-server.js").render;
      } else {
        const rawFile = readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, rawFile);
        render = (await vite.ssrLoadModule("/src/entry-server.ts")).render;
      }

      const { html: renderedHtml, context } = await render(url);
      const preloadLinks = renderPreloadLinks(context.modules, manifest);
      const html = template.replace("<!-- app-html -->", renderedHtml).replace(`<!-- preload-links -->`, preloadLinks);

      const minifiedHtml = minify(html, minifierOptions);
      let finalHtml = minifiedHtml;
      if (!isProd) {
        finalHtml = format(minifiedHtml, prettierOptions);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
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
