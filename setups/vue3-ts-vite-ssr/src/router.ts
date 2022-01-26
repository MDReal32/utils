import { createRouter, createWebHistory, createMemoryHistory, RouteRecordRaw } from "vue-router";
import { isSSR } from "./config";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: { name: "Component", template: "<div>Hello World</div>" }
  }
];

export const router = createRouter({
  history: isSSR ? createMemoryHistory() : createWebHistory(),
  routes
});
