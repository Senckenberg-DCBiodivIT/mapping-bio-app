// How to use:

// 1. Import the mixin in your component.
// 2. Adjust that example to your component:
// 2.1 This case is for search only. A cordraObject has to have a type inside, not this.docType
// created() {
//     this.docType = process.env.VUE_APP_CORDRA_DATATYPE_CAMERATRAP;

//     this.cordraSearchInput = 'id:' + this.camTrapID;
//     this.cordraSearch();
//   },
// 3. Use this.cordraSearchResult

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CordraClient } from "@cnri/cordra-client";

import { mapMutations } from "vuex";

export default {
  data() {
    return {
      cordraSearchInput: "", // Use that for search
      docType: "", // IMPORTANT: Define that in every component with cordraSearch() function
      cordraSearchResult: [],
      cordraOnlyOwnDatasetFlag: false, // if true, 'createdBy:' + this.$keycloak_authorID(); will been add.
    };
  },

  methods: {
    ...mapMutations({
      showLoader: "loader/showLoader",
      hideLoader: "loader/hideLoader",
    }),

    check_mixin() {
      /* Description: */

      console.group("check_mixin");

      console.log("Cordra mixin works well");

      console.groupEnd();
      return true;
    },

    cordraCreateTemporaryClient() {
      if (this.$keycloak_token()) {
        return new CordraClient(process.env.VUE_APP_CORDRA_URL, {
          token: this.$keycloak_token(),
        });
      } else {
        return new CordraClient(process.env.VUE_APP_CORDRA_URL);
      }
    },

    cordraSearch() {
      console.group("cordraSearch");
      this.cordraSearchResult = [];

      let cordraClient = this.cordraCreateTemporaryClient();

      console.log("this.docType", this.docType);

      let queryString = "type:" + this.docType;
      queryString +=
        this.cordraSearchInput.trim().length > 0
          ? " AND " + this.cordraSearchInput
          : "";

      if (this.cordraOnlyOwnDatasetFlag) {
        queryString += " AND createdBy:" + this.$keycloak_authorID();
      }

      console.log("queryString", queryString);

      this.showLoader();
      cordraClient.search(queryString).then((response) => {
        // console.log('response', response);
        response.results.forEach((result) => {
          this.cordraSearchResult.push(result);
          // console.log("this.cordraSearchResult", this.cordraSearchResult);
        });
        this.hideLoader();
      });
      console.log("this.cordraSearchResult", this.cordraSearchResult);

      console.groupEnd();
    },

    cordraCreateImageObject(imageObject) {
      // console.log("cordraCreateImageObject()", imageObject);

      let cordraClient = this.cordraCreateTemporaryClient();
      return cordraClient
        .create(imageObject)
        .then((result) => {
          // console.log("Result after creation", result);

          let message = {
            content: "Success, a new image was uploaded.",
            kind: "primary",
          };
          this.newMessage(message);
          return result.id;
        })
        .catch((error) => {
          let message = {
            content: error,
            kind: "danger",
          };
          this.newMessage(message);
          this.hideLoader();
          return false;
        });
    },

    cordraCreateDocument(cordraObject) {
      let cordraClient = this.cordraCreateTemporaryClient();

      console.log("");
      console.log("cordraCreateDocument", cordraObject);
      console.log("");

      return cordraClient
        .create(cordraObject)
        .then((result) => {
          // this.hideLoader();

          let message = {
            content: "Success, a new dataset was reported.",
            kind: "primary",
          };
          // this.newMessage(message); TODO: Set a message

          return result;
        })
        .catch((error) => {
          console.log("ERROR create doc", error);

          // let message = {
          //   content: error,
          //   kind: "danger",
          // };
          // this.newMessage(message);
          // this.hideLoader();
          return false;
        });
    },

    cordraUpdateDocument(cordraObject) {
      console.log("cordraUpdateDocument", cordraObject);

      let message = {
        content: "Try to update your dataset. Please wait for conformition.",
        kind: "info",
      };
      this.newMessage(message);

      let cordraClient = this.cordraCreateTemporaryClient();

      this.showLoader();
      return cordraClient
        .update(cordraObject)
        .then((response) => {
          let message = {
            content: "Success, your dataset was updated.",
            kind: "primary",
          };
          this.newMessage(message);
          this.hideLoader();

          return response;
        })
        .catch((error) => {
          let message = {
            content: error,
            kind: "danger",
          };
          this.newMessage(message);
          this.hideLoader();

          return false;
        });
    },

    cordraDeleteDocument(documentID, showMessage) {
      // Here you can delete any document with or whitout a message.
      // showMessage is true or false

      console.group(`cordraDeleteDocument ${documentID}`);
      let message = {
        content: "Try to delete your dataset. Please wait for conformition.",
        kind: "info",
      };

      showMessage ? this.newMessage(message) : null;
      showMessage ? this.showLoader() : null;

      let cordraClient = this.cordraCreateTemporaryClient();

      console.groupEnd();

      return cordraClient
        .delete(documentID)
        .then(() => {
          console.log("Success, a new dataset was deleted.");
          setTimeout(() => {
            try {
              this.stepBack();
            } catch {
              // there's no back function in the component - no problem.
            }
          }, process.env.VUE_APP_CORDRA_RELOAD_DELAY);

          let message = {
            content: "Success, your dataset was deleted.",
            kind: "primary",
          };
          showMessage ? this.newMessage(message) : null;
          showMessage ? this.hideLoader() : null;

          return true;
        })
        .catch((error) => {
          let message = {
            content: error,
            kind: "danger",
          };
          showMessage ? this.newMessage(message) : null;
          showMessage ? this.hideLoader() : null;

          return false;
        });
    },

    cordraGetDeserializedDocumentAndOwnership(documentID) {
      console.group(
        "cordraGetDeserializedDocumentAndOwnership(), ID: ",
        documentID
      );
      this.cordraSearchResult = []; //Reset

      let cordraClient = this.cordraCreateTemporaryClient();

      this.showLoader();
      cordraClient
        .callMethod(documentID, "getDeserialized")
        .then((result) => {
          // console.log(`result: ${JSON.stringify(result)}`);
          this.cordraSearchResult.push(result);

          let ownDataset =
            result.metadata.createdBy === this.$keycloak_authorID()
              ? true
              : false;

          this.cordraSearchResult.push(ownDataset);

          try {
            this.restoreData();
          } catch {
            // If there's no restore function, it's not a problem.
          }
          this.hideLoader();
        })
        .catch((error) => {
          console.warn(
            "ERROR in cordraGetDeserializedDocumentAndOwnership(), ID: ",
            documentID
          );
          let message = {
            content: error,
            kind: "danger",
          };
          this.newMessage(message);
          this.hideLoader();
        });

      console.groupEnd();
    },

    cordraGetDocumentAndOwnership(documentID) {
      // console.log('cordraGetDocumentAndOwnership');

      let cordraClient = this.cordraCreateTemporaryClient();

      this.showLoader();
      cordraClient
        .get(documentID)
        .then((result) => {
          this.cordraSearchResult.push(result);

          let ownDataset =
            result.metadata.createdBy === this.$keycloak_authorID()
              ? true
              : false;

          this.cordraSearchResult.push(ownDataset);

          try {
            this.restoreData();
          } catch {
            // If tehe's no restore function, it's not a problem.
          }
          this.hideLoader();
        })
        .catch((error) => {
          let message = {
            content: error,
            kind: "danger",
          };
          this.newMessage(message);
          this.hideLoader();
        });
    },

    cordraGetPublicPayloadLink(id, payloadName) {
      return this.cordraCreateTemporaryClient().getPayloadDownloadLink(
        id,
        payloadName
      );
    },

    cordraSetPrivatePayloadLinkAsync(payloadName) {
      // payloads attached to Cordra objects which are not public cannot be
      // accessed directly via <img src="payloadUrl"> because the browser does
      // not send the required auth header. Theses images must therefore be
      // fetched by JavaScript and stored temporarily as blob
      return this.cordraCreateTemporaryClient()
        .getPayload(this.cordraSearchResult[0].id, payloadName)
        .then((payloadBlob) => {
          const objectUrl = URL.createObjectURL(payloadBlob);
          this.payloadLinks[payloadName] = objectUrl;
        });
    },

    cordraGetImagePayloadLinkAsync(payloadID, payloadName) {
      // payloads attached to Cordra objects which are not public cannot be
      // accessed directly via <img src="payloadUrl"> because the browser does
      // not send the required auth header. Theses images must therefore be
      // fetched by JavaScript and stored temporarily as blob

      return this.cordraCreateTemporaryClient()
        .getPayload(payloadID, payloadName)
        .then((payloadBlob) => {
          return URL.createObjectURL(payloadBlob);
        });
    },

    cordraUpdatePayloadLinks() {
      for (var payload in this.cordraSearchResult[0].payloads) {
        if (this.$keycloak_token) {
          this.payloadLinks[payload.name] = "";
          this.cordraSetPrivatePayloadLinkAsync(payload.name);
        } else {
          this.payloadLinks[payload.name] = this.cordraGetPublicPayloadLink(
            this.cordraSearchResult[0].id,
            payload.name
          );
        }
      }
    },

    // cordraUpdateCaptureEventIfNecessary(captureID, annotationListID) {
    // TODO: We only need this function  until the backend is able to set a bijective relation between a Capture Event and an annotation list. After delete this function as soon as possible.
    // let cordraClient = this.cordraCreateTemporaryClient("public");

    // this.showLoader();
    // cordraClient
    //   .get(captureID)
    //   .then((result) => {
    //     if (result.content.annotationListID) {
    //       if (result.content.annotationListID.includes(annotationListID)) {
    //         // allready stored
    //       } else {
    //         result.content.annotationListID.push(annotationListID);
    //         this.cordraUpdateDocument(result);
    //       }
    //     } else {
    //       //There is no one ID stored. Store this one in an array.
    //       result.content.annotationListID = [annotationListID];
    //       this.cordraUpdateDocument(result);
    //     }

    //     this.hideLoader();
    //   })
    //   .catch((error) => {
    //     let message = {
    //       content: error,
    //       kind: "danger",
    //     };
    //     this.newMessage(message);
    //     this.hideLoader();
    //   });
    // },
  },
  unmounted() {
    // for memory cleanup: in the case of payloads attached to Cordra objects
    // which are not public we delete now the fetched blob from the memory
    if (this.$keycloak_token) {
      if (this.payloadLinks) {
        for (const payloadUrl of Object.values(this.payloadLinks)) {
          URL.revokeObjectURL(payloadUrl);
        }
      }
      if (this.imageLink) {
        URL.revokeObjectURL(this.imageLink);
      }
    }
  },

  computed: {
    generateCordraObjectLink() {
      return `<a href="${process.env.VUE_APP_CORDRA_URL}/objects/${this.objectID}" target="_blank">${this.objectID}</a>`;
    },
  },
};
