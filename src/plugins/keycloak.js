import Keycloak from "keycloak-js";

let initOptions = {
  url: process.env.VUE_APP_KEYCLOAK_URL,
  realm: process.env.VUE_APP_KEYCLOAK_REALM,
  clientId: process.env.VUE_APP_KEYCLOAK_CLIENTID,
};

var appObj = {};

let keycloak = Keycloak(initOptions);

// Init part, like in the documentation
keycloak
  .init({ onLoad: initOptions.onLoad })
  .then((auth) => {
    let storeVaule = {
      getStatusReady: true,
      keycloakAuthenticated: false,
    };
    if (!auth) {
      console.log("NOT Authenticated");
      storeVaule.keycloakAuthenticated = false;
    } else {
      console.log("Authenticated");
      storeVaule.keycloakAuthenticated = true;
    }
    appObj._context.provides.store.commit(
      "keycloak/setStatusReadyAuthenticated",
      storeVaule
    );

    setInterval(() => {
      // refresh token, if you've only 70 sec or less
      keycloak
        .updateToken(70)
        .catch(() => console.log("Failed to refresh token"));
    }, 6000);
  })
  .catch(() => {
    console.log("Authenticated Failed");

    let storeVaule = {
      getStatusReady: true,
      keycloakAuthenticated: false,
    };

    appObj._context.provides.store.commit(
      "keycloak/setStatusReadyAuthenticated",
      storeVaule
    );
  })
  .finally(() => {
    // hide the loader which is shown per default
    appObj._context.provides.store.commit("loader/hideLoader", true);
  });

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  install(app) {
    appObj = app;

    // It's not necessary to put that info in to the store. We don't need a live update
    app.config.globalProperties.$keycloakLoginLink = () => {
      return keycloak.createLoginUrl();
    };

    app.config.globalProperties.$keycloakLogoutLink = () => {
      return keycloak.createLogoutUrl();
    };

    app.config.globalProperties.$keycloak_token = () => {
      return keycloak.token;
    };

    app.config.globalProperties.$keycloak_authorID = () => {
      return keycloak.subject;
    };
  },
};
