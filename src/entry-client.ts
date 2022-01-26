import { createApp } from "./main";
import { router } from "./router";

(async () => {
  const app = createApp();
  await router.isReady();
  app.mount("#app");
})();
