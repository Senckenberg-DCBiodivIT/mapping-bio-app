import { createStore } from "vuex";

import messengerMod from "./messenger";
import loaderMod from "./loader";
import keycloakMod from "./keycloak";

export default createStore({
  modules: {
    messenger: messengerMod,
    loader: loaderMod,

    keycloak: keycloakMod,
  },
});
