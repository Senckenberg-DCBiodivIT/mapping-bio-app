export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      payloadLinks: {},
    };
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    updateFormFileUpload(event) {
      let files = event.target.files;
      this.formData.files = [];

      files.forEach((file) => this.formData.files.push(file));
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleObject() {
      if (this.action === "create") {
        this.createCordraObject();
      } else if (this.action === "edit") {
        this.updateCordraObject();
      }
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    editDataset(kind, id) {
      let link = "/editdataset/" + kind + "/" + id;

      this.$router.push(link);
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    makeImageVisible(img) {
      var imgVisible = true;

      this.formData.filesToDelete.forEach((element) => {
        if (element === img && imgVisible == true) {
          imgVisible = false;
        }
      });

      return imgVisible;
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    goToObjectLandingPage(docType, id) {
      if (docType === process.env.VUE_APP_CORDRA_DATATYPE_OCCURRENCE) {
        this.$router.push(`/captureevent/${id}`);
      } else if (docType === process.env.VUE_APP_CORDRA_DATATYPE_CAMERATRAP) {
        this.$router.push(`/cameratraps/${id}`);
      }
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async camTrapImages() {
      console.group("camTrapImages");

      for (var element of this.cordraSearchResult[0].content["dul:hasPart"]) {
        //   if ( // At the moment we don't need a delay
        //     element.content["ods:hasAnnotations"] === undefined // Annotatoin isn't ready
        //   ) {
        //     setTimeout(() => {
        //       this.cordraGetDeserializedDocumentAndOwnership(this.objectID);
        //     }, process.env.VUE_APP_CORDRA_RELOAD_DELAY);
        //     break;
        //   }
        ////////////////////
        console.log(
          "element.content['sosa:hasResult'].content",
          element.content["sosa:hasResult"].content
        );

        if (element.content["sosa:hasResult"].content) {
          let oneImage = {};
          //   oneImage["URL"] = await this.cordraGetImagePayloadLinkAsync(
          //     element.id,
          //     element.payloads[0].name
          //   );
          oneImage["id"] = element.content["sosa:hasResult"].content["@id"];
          //   oneImage["eventID"] = this.cordraSearchResult[0].id;
          oneImage["height"] =
            element.content["sosa:hasResult"].content["ods:mediaHeight"];
          oneImage["width"] =
            element.content["sosa:hasResult"].content["ods:mediaWidth"];
          //   oneImage["annotations"] = element.content["ods:hasAnnotations"];
          oneImage["annotations"] = [];
          this.cordraData.images.push(oneImage);
        }
      }

      console.groupEnd();
    },
  },
};
