import { createStore } from "vuex";

import messengerMod from "./messenger";
import mappingtableMod from "./mappingtable";
import keycloakMod from "./keycloak";

export default createStore({
  modules: {
    messenger: messengerMod,
    mappingtable: mappingtableMod,

    keycloak: keycloakMod,
  },
});
