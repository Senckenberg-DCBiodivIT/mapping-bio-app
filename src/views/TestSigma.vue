<template>
  <div>
    <div id="testSigma"></div>
  </div>
</template>

<script>
import CordraMixin from "@/mixins/cordra";

// import Graph from "graphology";
import Sigma from "sigma";

export default {
  name: "TestComponent",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      // from: null,
      container: null,
      // graph: new Graph(),
      renderer: null,
    };
  },

  methods: {},

  computed: {},

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted() {
    //
    this.container = document.getElementById("testSigma");

    this.graph.addNode("John", {
      x: 0,
      y: 5,
      size: 10,
      label: "John",
      color: "blue",
    });

    this.graph.addNode("Mary", {
      x: 5,
      y: 0,
      size: 7,
      label: "Mary",
      color: "red",
    });

    this.graph.addEdge("John", "Mary");
    console.log("container", this.container);
    this.renderer = new Sigma(this.graph, this.container);
  },
};
</script>

<style scoped>
#testSigma {
  width: 300px;
  height: 300px;
  display: block;
}
</style>
