import express from "express";
import { resolve as res } from "path";
import compression from "compression";
import serveStatic from "serve-static";

let isProd = process.env.NODE_ENV === "development";
if (!isProd) {
  process.env.NODE_ENV = "development";
  isProd = true;
}

const resolve = (...p: string[]) => res(process.cwd(), ...p);

const PORT = process.env.PORT || 5000;
const app = express();

(async () => {
  app.use(compression()).use(serveStatic(resolve("build/client")));
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();
