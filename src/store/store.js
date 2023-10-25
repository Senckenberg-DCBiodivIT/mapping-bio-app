import { createStore } from "vuex";

import messengerMod from "./messenger";
import mappingtableMod from "./mappingtable";

export default createStore({
  modules: {
    messenger: messengerMod,
    mappingtable: mappingtableMod,
  },
});
