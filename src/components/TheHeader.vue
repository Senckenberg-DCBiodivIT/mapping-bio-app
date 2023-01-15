<template>
  <div class="is-active">
    <div class="columns">
      <div class="column is-3">
        <router-link to="/testWeb">
          <span class="ownFont">Test WebVOWL (currently not in Vue)</span>
        </router-link>

        <br /><router-link to="/testtree">
          <span class="ownFont">Test Tree View (in progress)</span>
        </router-link>
      </div>
      <div class="column">
        <div class="has-text-centered ownFont bigText">
          BioDT WP5 <br />
          Prototype V0.6.1
        </div>
      </div>
      <div class="column is-3"></div>
    </div>

    <!-- <nav
      class="navbar is-secondary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <router-link to="/">
          <a
            class="navbar-item has-text-white has-text-weight-semibold app-navbar-item"
            >Wildlive Portal (based on Schema 1.1.0)</a
          >
        </router-link>

        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="true"
          @click="showBurgerItems = !showBurgerItems"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': showBurgerItems }">
        <div class="navbar-start"></div>

        <div class="navbar-end">
          <router-link to="/">
            <a
              class="navbar-item has-text-white has-text-weight-semibold app-navbar-item"
              >Home</a
            >
          </router-link>

          <router-link to="/showArea/projects" class>
            <a
              class="navbar-item has-text-white has-text-weight-semibold app-navbar-item"
              >Projects</a
            >
          </router-link>

          <router-link to="/stationsetupsoverview">
            <a
              class="navbar-item has-text-white has-text-weight-semibold app-navbar-item"
              >Station setups</a
            >
          </router-link>

          <router-link to="/showArea/captureevent">
            <a
              class="navbar-item has-text-white has-text-weight-semibold app-navbar-item"
              >Capture events</a
            >
          </router-link>

          <div class="navbar-item">
            <div class="buttons">
              <div v-if="!$store.getters['keycloak/getStatusReady']">
                <a
                  class="button is-light has-text-white has-text-weight-semibold"
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
        </div>
      </div>
    </nav> -->
  </div>
</template>

<script lang="ts">
export default {
  name: "TheHeader",
};
</script>

<script setup lang="ts">
// import { ref } from "vue";
// const showBurgerItems = ref(false);
</script>

<style scoped>
.is-active {
  background-color: #679c60;
}

.ownFont {
  color: white !important;
}

.bigText {
  font-size: 2em;
}
</style>
