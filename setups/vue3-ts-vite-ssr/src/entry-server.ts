import { renderToString, SSRContext } from "vue/server-renderer";
import { createApp } from "./main";
import { router } from "./router";

export interface RenderFunction {
  html: string;
  context: SSRContext;
}
export type Render = (url: string) => Promise<RenderFunction>;

export const render: Render = async (url: string) => {
  await router.push(url);
  await router.isReady();
  const app = createApp();

  const context: SSRContext = {};
  const html = await renderToString(app, context);

  return { html, context };
};
