<template>
  <div class="is-active">
    <div class="columns">
      <div class="column is-3">
        <router-link to="imprint" class="ownFont">Imprint</router-link>
      </div>

      <div class="column">
        <div class="has-text-centered ownFont bigText">
          mapping.bio <br />Mapping Service<br />
          Prototype V0.10.1
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
      sgnLogo: require("../assets/sgnLogoH.png"),
      biodtLogo: require("../assets/biodtLogo.png"),
    };
  },
};
</script>

<style scoped>
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
