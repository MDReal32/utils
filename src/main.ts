import { createApp as _createApp, createSSRApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { store } from "./store";
import { isSSR } from "./config";

export const createApp = () => (isSSR ? createSSRApp : _createApp)(App).use(router).use(store);
