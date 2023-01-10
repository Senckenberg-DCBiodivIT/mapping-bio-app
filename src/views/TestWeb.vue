<template>
  <div>
    <div id="testWeb"></div>
  </div>
</template>

<script>
import CordraMixin from "@/mixins/cordra";
// import LeaderLine from "leader-line-new";

export default {
  name: "TestComponent",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      // from: null,
      testGraph: {},
    };
  },

  methods: {},

  computed: {},

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted() {
    //
  },
};
</script>

<style scoped>
#testWeb {
  width: 300px;
  height: 300px;
  display: block;
}
</style>
