import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";

export default createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home", // Global
      component: Home,
    },

    {
      path: "/about",
      name: "About",

      component: () => import("../views/About.vue"),
    },
    {
      path: "/imprint",
      name: "Imprint",

      component: () => import("../views/Imprint.vue"),
    },
  ],
});
