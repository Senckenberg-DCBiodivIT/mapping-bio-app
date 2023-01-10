export default {
  data() {
    return {
      thumbnailUrl: "",
    };
  },

  methods: {
    imageGetPrivateURLFromIIIF(imageURL) {
      // console.log("imageGetPrivateURLFromIIIF", imageURL);

      // on the local dev environment this leads to a cors-error but not in
      // production where the image ifff server is under the same domain
      return fetch(imageURL, {
        headers: {
          Authorization: "Bearer " + this.$keycloak_token(),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Image from IIIF response was " + response.status);
          }
          return response.blob();
        })
        .then((payloadBlob) => URL.createObjectURL(payloadBlob));
    },
  },

  unmounted() {
    // for memory cleanup: in the case of payloads attached to Cordra objects
    // which are not public we delete now the fetched blob from the memory
    if (this.$keycloak_token()) {
      if (this.thumbnailUrl) {
        URL.revokeObjectURL(this.thumbnailUrl);
      }
    }
  },
};
