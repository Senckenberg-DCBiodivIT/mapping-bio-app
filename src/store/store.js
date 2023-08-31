import { createStore } from "vuex";

import messengerMod from "./messenger";

export default createStore({
  modules: {
    messenger: messengerMod,
  },
});
