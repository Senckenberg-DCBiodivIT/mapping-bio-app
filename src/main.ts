import { createApp } from "vue";
import App from "./App.vue";

import Router from "./router/router";

// Font Awesome 5 for Vue 3
// We use Font Awesome 4 now
// Source: https://www.npmjs.com/package/@fortawesome/vue-fontawesome
// import { library, dom } from '@fortawesome/fontawesome-svg-core';
// dom.watch();

// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { fab } from '@fortawesome/free-brands-svg-icons';
// import { far } from '@fortawesome/free-regular-svg-icons'; At the moment we don't need them

// library.add(fas, fab);
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Store from "./store/store.js";

// Oruga with Bulma
import Oruga from "@oruga-ui/oruga-next";
// import '@oruga-ui/oruga-next/dist/oruga.css'; Not more as long as we use Bulma for styling

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { bulmaConfig } from "@oruga-ui/theme-bulma";

import "@oruga-ui/theme-bulma/dist/bulma.css";

// Own Plugins
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Keycloak from "./plugins/keycloak.js";

createApp(App)
  .use(Oruga, bulmaConfig)
  .use(Router)
  .use(Store)
  .use(Keycloak)

  // .component('font-awesome-icon', FontAwesomeIcon)
  .mount("#app");
