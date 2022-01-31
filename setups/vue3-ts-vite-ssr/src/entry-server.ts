import { renderToString, SSRContext } from "vue/server-renderer";
import { createApp } from "./main";
import { router } from "./router";
import { ServerRenderFunction } from "./types/ServerRenderFunction";

export const render: ServerRenderFunction = async (url: string) => {
  await router.push(url);
  await router.isReady();
  const app = await createApp();

  const context: SSRContext = {};
  const html = await renderToString(app, context);

  return { html, context };
};
