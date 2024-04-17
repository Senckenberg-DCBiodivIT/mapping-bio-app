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
    {
      path: "/mappingsets",
      name: "Show overview of mappingsets",

      component: () => import("@/views/MappingSetOverview.vue"), // Schema
    },
    {
      path: "/mappingsets/:id([a-zA-Z0-9.]+/[a-zA-Z0-9]+)",
      name: "Show a single mappingset instance",

      component: () => import("@/views/MappingSetLandingPage.vue"), // Schema
    },
  ],
});
