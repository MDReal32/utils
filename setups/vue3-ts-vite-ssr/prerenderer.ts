import { readFileSync, writeFileSync } from "fs";
import { resolve as res, sep } from "path";
import { ServerModule } from "./src/types/ServerRenderFunction";
import { glob } from "glob";
import { getHtml } from "./server/utils/getHtml";

const resolve = (...p: string[]) => res(__dirname, ...p);
const template = readFileSync("build/index.html", "utf-8");
const { render } = require("./build/server-bundle/entry-server") as ServerModule;

const root = resolve("src/pages");
glob(res(root, "**", "*.vue"), { cwd: root }, async (err, matches) => {
  if (err) throw err;

  const files = matches.map(match =>
    res(match)
      .replace(`${root}${sep}`, "")
      .replace(/\.vue$/, "")
  );

  for (const file of files) {
    const endpoint = `/${file.toLowerCase()}`;
    const destinationFile = resolve(`build/${endpoint}.html`);

    const html = await getHtml({ url: endpoint, render, isProd: true, template });
    writeFileSync(destinationFile, html);
  }

  const destinationFile = resolve(`build/index.html`);
  const html = await getHtml({ url: "/", render, isProd: true, template });
  writeFileSync(destinationFile, html);
});
