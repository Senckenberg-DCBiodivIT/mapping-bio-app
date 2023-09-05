const mappingtable = {
  namespaced: true,

  state: () => ({
    file: { fileText: "", fileExtension: "" },
    mappingtable: [],
  }),

  getters: {
    getFile(state) {
      return state.file;
    },
    getMappingtable(state) {
      return state.mappingtable;
    },
  },

  mutations: {
    setFile(state, value) {
      state.file.fileText = value.fileText;
      state.file.fileExtension = value.fileExtension;
    },

    setMappingtable(state, value) {
      state.mappingtable = value;
    },

    addToMappingtable(state, value) {
      state.mappingtable = value;
    },

    // updateMapingtable(state, value) {
    // state.fileText = text;
    // TODO
    // },
  },
};

export default mappingtable;
