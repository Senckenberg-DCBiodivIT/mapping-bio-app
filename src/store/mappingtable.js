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
      console.group("setMappingtable");

      state.mappingtable = value;

      console.groupEnd();
    },

    addMappingItem(state, value) {
      // value:{left, right, sourceTitle, targetTitle, relation, comment}
      console.group("addMappingItem");
      console.log("state.mappingtable before", state.mappingtable);

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
      console.log("state.mappingtable after", state.mappingtable);
      console.groupEnd();
    },

    updateMapping(state, value) {
      //   // value:{mappingtableSourceID, mappingtableTargetID, param, updatedValue}

      let tempMappingtable = Object.assign({}, state.mappingtable);

      tempMappingtable[value.mappingtableSourceID][value.mappingtableTargetID][
        value.param
      ] = value.updatedValue;

      state.mappingtable = tempMappingtable;
    },
    deleteMappingRow(state, value) {
      //   // value:{sourceLink, targetLink}
      console.log("value", value);

      let tempMappingtable = Object.assign({}, state.mappingtable);
      console.log("tempMappingtable before", tempMappingtable);
      console.log(
        "to delete:",
        tempMappingtable[value.sourceLink][value.targetLink]
      );

      delete tempMappingtable[value.sourceLink][value.targetLink];

      if (Object.keys(tempMappingtable[value.sourceLink]).length === 0) {
        delete tempMappingtable[value.sourceLink];
      }

      console.log("tempMappingtable after", tempMappingtable);

      // delete tempMappingtable[value.mappingtableSourceID][
      //   value.mappingtableTargetID
      // ];

      state.mappingtable = tempMappingtable;
    },
  },
};

export default mappingtable;
