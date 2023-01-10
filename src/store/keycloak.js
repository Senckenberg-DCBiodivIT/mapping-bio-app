/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const keycloak = {
  namespaced: true,

  state: () => ({
    keycloakReady: false,
    keycloakAuthenticated: false,
  }),

  getters: {
    getStatusReady(state) {
      return state.keycloakReady;
    },

    getStatusAuthenticated(state) {
      return state.keycloakAuthenticated;
    },
  },

  mutations: {
    setStatusReady(state, value) {
      state.keycloakReady = value;
    },

    setStatusAuthenticated(state, value) {
      state.keycloakAuthenticated = value;
    },

    setStatusReadyAuthenticated(state, value) {
      state.keycloakReady = value.getStatusReady;
      state.keycloakAuthenticated = value.keycloakAuthenticated;
    },
  },
};

export default keycloak;
