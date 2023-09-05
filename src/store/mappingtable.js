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

      let tempMappingtable = Object.assign({}, state.mappingtable);

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

    updateMapping(state, value) {
      //   // value:{mappingtableSourceID, mappingtableTargetID, param, updatedValue}

      let tempMappingtable = Object.assign({}, state.mappingtable);

      tempMappingtable[value.mappingtableSourceID][value.mappingtableTargetID][
        value.param
      ] = value.updatedValue;

      state.mappingtable = tempMappingtable;
    },
  },
};

export default mappingtable;
