<template>
  <footer class="footer has-text-centered">
    Placeholder footer
    <!-- <div>
      <div class="columns">
        <div class="column is-2">
          <router-link to="/imprint" class="footerText">Imprint</router-link>
        </div>
        <div class="column">
          <p class="footerText">
            Welcome to the Senckenberg Wildlive portal. This web portal is still
            in active development, please visit us later again!
          </p>
        </div>
        <div class="column is-2">
          <router-link to="/about" class="footerText">
            About Wildlive
          </router-link>
        </div>
      </div>
    </div> -->
  </footer>
</template>

<script lang="ts">
export default {
  name: "TheFooter",
};
</script>

<style lang="scss" scoped>
.footer {
  padding: 1rem 1rem 1rem !important;
  background-color: #679c60;
}

.footerText {
  color: white !important;
  font-weight: bold;
}
</style>
