/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// This version is for Oruga
const messenger = {
  namespaced: true,

  state: () => ({
    messages: [],
    id: 0,
  }),

  getters: {
    getMessages(state) {
      return state.messages;
    },
  },

  mutations: {
    newMessage(state, message) {
      state.id++;
      state.messages.push({
        content: message.content,
        severity: message.kind,
        id: state.id,
      });
    },
  },
};

export default messenger;
