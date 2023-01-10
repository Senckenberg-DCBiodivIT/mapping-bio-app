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
      path: "/test",
      name: "Test",

      component: () => import("../views/Test.vue"),
    },
    {
      path: "/testSigma",
      name: "testSigma",

      component: () => import("../views/TestSigma.vue"),
    },
    {
      path: "/testWeb",
      name: "testWeb",

      component: () => import("../views/TestWeb.vue"),
    },
    {
      path: "/testtree",
      name: "testWeb",

      component: () => import("../views/TestTree.vue"),
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
