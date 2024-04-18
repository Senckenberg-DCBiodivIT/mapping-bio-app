<template>
  <div class="is-active">
    {{ headerStyle }}
    <div class="columns">
      <div class="column is-3">
        <router-link to="/" target="_blank"
          ><img :src="mappingBioLogo" class="mappingBioLogo" /></router-link
        ><br />
        <router-link to="imprint" class="ownFont mappingBioLogo"
          >About</router-link
        >
        <text class="pipe">&nbsp;|&nbsp;</text>
        <router-link to="imprint" class="ownFont mappingBioLogo"
          >Imprint</router-link
        >

        <div class="buttons" style="margin-left: 1em">
          <div v-if="!$store.getters['keycloak/getStatusReady']">
            <a class="button is-light has-text-black has-text-weight-semibold"
              >Connecting server</a
            >
          </div>
          <div v-else>
            <div v-if="$store.getters['keycloak/getStatusAuthenticated']">
              <a
                :href="$keycloakLogoutLink()"
                class="button is-success has-text-white has-text-weight-semibold"
              >
                <strong>Logout</strong>
              </a>
            </div>
            <div v-else>
              <a
                :href="$keycloakLoginLink()"
                class="button is-primary has-text-white has-text-weight-semibold"
              >
                <strong>Login</strong>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="has-text-centered ownFont bigText testfooter">
          mapping.bio Mapping Service V. {{ version }}
        </div>
        <div class="buttons" style="margin-left: 1em">
          <router-link
            class="button is-secondary has-text-white has-text-weight-semibold"
            :to="'/mappingsets'"
            >Browse existing mappings</router-link
          >
        </div>
      </div>

      <div class="column is-3 has-text-right">
        <a href="https://biodt.eu" target="_blank"
          ><img :src="biodtLogo" class="biodtLogo" /></a
        ><br />
        <a href="https://www.senckenberg.de/en/" target="_blank"
          ><img :src="sgnLogo" class="sgnLogo" /></a
        ><br />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TheHeader",
  data() {
    return {
      sgnLogo: require("@/assets/sgnLogoH.png"),
      biodtLogo: require("@/assets/biodtLogo.png"),
      mappingBioLogo: require("@/assets/mapping.bio.png"),

      version: process.env.VUE_APP_VERSION,
    };
  },
};
</script>

<style scoped lang="scss">
.is-active {
  background-image: url("@/assets/header_bg.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;

  background-color: #349a34;
}
</style>

<style scoped>
.pipe {
  color: white;
  font-weight: 500;
}
.mappingBioLogo {
  width: 25%;
  margin-top: 5px;
  margin-left: 3px;
}

.sgnLogo {
  width: 34%;
  margin-top: 0px;
  margin-right: 3px;
}

.biodtLogo {
  width: 34%;
  margin-top: 3px;
  margin-right: 3px;
}

.ownFont {
  color: white !important;
}

.bigText {
  font-size: 1.75rem;
}

.testfooter {
  position: relative;
  margin-top: 10%;
}
</style>
