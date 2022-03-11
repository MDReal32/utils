import { readFileSync, writeFileSync } from "fs";
import { resolve as res, sep } from "path";
import { ServerModule } from "../src/types/ServerRenderFunction";
import { glob } from "glob";
import { getHtml } from "../server/utils/getHtml";

const resolve = (...p: string[]) => res(process.cwd(), ...p);

const root = resolve("src/pages");
const PORT = process.env.PORT || 5000;
const template = readFileSync(resolve("build/client/index.html"), "utf-8");
const { render } = require(resolve("build/server-bundle/entry-server")) as ServerModule;
const clientData = require(resolve("src/entry-data"));
const data = { ...clientData, SSR: true, host: `http://localhost:${PORT}`, dev: false, prod: true };

glob(res(root, "**", "*.vue"), { cwd: root }, async (err, matches) => {
  if (err) throw err;

  const files = matches.map(match =>
    res(match)
      .replace(`${root}${sep}`, "")
      .replace(/\.vue$/, "")
  );

  for (const file of files) {
    const endpoint = `/${file.toLowerCase()}`;
    const destinationFile = resolve(`build/client/${endpoint}.html`);
    const html = await getHtml({ url: endpoint, render, isProd: true, template, data });
    writeFileSync(destinationFile, html);
  }

  const destinationFile = resolve(`build/client/index.html`);
  const html = await getHtml({ url: "/", render, isProd: true, template, data });
  writeFileSync(destinationFile, html);
});
