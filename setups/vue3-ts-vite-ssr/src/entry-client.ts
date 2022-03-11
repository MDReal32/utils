import { createApp } from "./main";
import { router } from "./router";

(async () => {
  const app = createApp();
  await router.isReady();
  app.config.globalProperties = JSON.parse(document.getElementById("__DATA__")?.textContent!);
  app.mount("#app");
})();
