<template>
  <div class="is-active">
    <div class="columns">
      <div class="column is-3" />

      <div class="column">
        <div class="has-text-centered ownFont bigText">
          mapping.bio <br />Mapping Service<br />
          Prototype V0.9.3
        </div>
      </div>
      <div class="column is-3"></div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "TheHeader",
};
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
