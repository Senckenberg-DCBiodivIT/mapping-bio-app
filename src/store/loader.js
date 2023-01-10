/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// This version is for Oruga
const messenger = {
  namespaced: true,

  state: () => ({
    isActive: true,
  }),

  getters: {
    getStatus(state) {
      return state.isActive;
    },
  },

  mutations: {
    showLoader(state) {
      state.isActive = true;
    },

    hideLoader(state) {
      state.isActive = false;
    },
  },
};

export default messenger;
