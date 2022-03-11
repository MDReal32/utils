import { ServerRenderFunction } from "../../src/types/ServerRenderFunction";
import { format, Options as PrettierOptions } from "prettier";
import { minify, Options as MinifierOption } from "html-minifier";
import { readFileSync } from "fs";
import { resolve } from "path";
import { renderPreloadLinks } from "./renderPreloadLinks";

interface Options {
  render: ServerRenderFunction;
  isProd: boolean;
  url: string;
  template: string;
  data?: Record<string, any>;
}

const prettierOptions: PrettierOptions = {
  parser: "html",
  ...JSON.parse(readFileSync(resolve(process.cwd(), ".prettierrc"), "utf-8"))
};
const minifierOptions: MinifierOption = {
  removeComments: true,
  collapseWhitespace: true,
  collapseInlineTagWhitespace: true,
  collapseBooleanAttributes: true,
  html5: true,
  sortAttributes: true,
  keepClosingSlash: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  sortClassName: true
};

export const getHtml = async (options: Options, manifestFile = "../../build/client/ssr-manifest.json") => {
  const { render, isProd, url, template } = options;
  const manifest = isProd ? require(manifestFile) : {};

  const { html: renderedHtml, context } = await render(url);
  const preloadLinks = renderPreloadLinks(context.modules, manifest);
  const html = template.replace("<!-- app-html -->", renderedHtml).replace(`<!-- preload-links -->`, preloadLinks);

  const minifiedHtml = minify(html, minifierOptions);
  let finalHtml = minifiedHtml;
  if (!isProd) {
    finalHtml = format(minifiedHtml, prettierOptions);
  }

  return finalHtml;
};
