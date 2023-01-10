<template>
  <div>
    <Header />
    <router-view />
    <!-- <Footer /> -->
  </div>
</template>

<script setup lang="ts">
// import Footer from "./components/TheFooter.vue";
import Header from "./components/TheHeader.vue";
</script>

<script lang="ts">
export default {
  name: "App",
};
</script>

<style lang="scss">
@import "../node_modules/font-awesome/css/font-awesome.min.css";

// Bulma and Oruga
// Source: https://github.com/oruga-ui/theme-bulma#readme
@import "~bulma/sass/utilities/_all"; //Components for Oruga
@import "~bulma/css/bulma.min.css"; //Components for Bulma

// Set your colors
$primary: #909c59;
$primary-light: findLightColor($primary);
$primary-dark: findDarkColor($primary);
$primary-invert: findColorInvert($primary);

$secondary: #679c60;
$secondary-light: findLightColor($secondary);
$secondary-dark: findDarkColor($secondary);
$secondary-invert: findColorInvert($secondary);

// TODO: not sure, if we need that. Defined as red
// $twitter: #ff4040;
// $twitter-invert: findColorInvert($twitter);

// Lists and maps Bulma+Oruga customisation
$custom-colors: null !default;
$custom-shades: null !default;

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: mergeColorMaps(
  (
    "white": (
      $white,
      $black,
    ),
    "black": (
      $black,
      $white,
    ),
    "light": (
      $light,
      $light-invert,
    ),
    "dark": (
      $dark,
      $dark-invert,
    ),
    "primary": (
      $primary,
      $primary-invert,
      $primary-light,
      $primary-dark,
    ),
    "secondary": (
      $secondary,
      $secondary-invert,
      $secondary-light,
      $secondary-dark,
    ),
    "link": (
      $link,
      $link-invert,
      $link-light,
      $link-dark,
    ),
    "info": (
      $info,
      $info-invert,
      $info-light,
      $info-dark,
    ),
    "success": (
      $success,
      $success-invert,
      $success-light,
      $success-dark,
    ),
    "warning": (
      $warning,
      $warning-invert,
      $warning-light,
      $warning-dark,
    ),
    "danger": (
      $danger,
      $danger-invert,
      $danger-light,
      $danger-dark,
    ),
  ),
  $custom-colors
);

// Source: https://github.com/oruga-ui/theme-bulma#readme
// Links (from Oruga@Bulma theeme doc)
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Import Bulma's core here to override later importet values.
@import "~bulma/bulma";
@import "~@oruga-ui/theme-bulma/dist/scss/bulma";

// APP definitions
.app-navbar-item {
  height: 100%;

  &:hover {
    background-color: $primary !important;
  }
}
</style>
