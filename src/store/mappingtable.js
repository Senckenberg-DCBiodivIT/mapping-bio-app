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
      console.log("getMappingtable");
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

    addMappingItem(state, value) {
      // value:{left, right, sourceTitle, targetTitle, relation, comment}
      let tempMappingtable = JSON.parse(JSON.stringify(state.mappingtable));

      if (tempMappingtable[value.left] == undefined) {
        tempMappingtable[value.left] = {};
      }

      tempMappingtable[value.left][value.right] = {
        sourceTitle: value.sourceTitle,
        targetTitle: value.targetTitle,
        relation: value.relation,
        comment: value.comment,
      };

      state.mappingtable = tempMappingtable;
    },

    // updateMaping(state, value) {
    // state.fileText = text;
    // TODO
    // },
  },
};

export default mappingtable;
