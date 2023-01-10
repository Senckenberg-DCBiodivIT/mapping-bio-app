<template>
  <div>
    <div id="testCytoscape"></div>
    <!-- <div class="columns has-text-centered">
      <div class="column is-1"></div>
      <div class="column is-5 mappingColumn">
        <div id="1" class="testDiv">1</div>
        <div id="2" class="testDiv">2</div>
        <div id="3" class="testDiv">3</div>
        <div id="4" class="testDiv">4</div>
        <div id="5" class="testDiv">5</div>
        <div id="6" class="testDiv">6</div>
        <div id="7" class="testDiv">7</div>
      </div>
      <div class="column is-5 mappingColumn">
        <div id="to2" class="testDiv">b</div>
        <div id="to7" class="testDiv">g</div>
        <div id="to3" class="testDiv">c</div>
        <div id="to5" class="testDiv">e</div>
        <div id="to1" class="testDiv">a</div>
        <div id="to6" class="testDiv">f</div>
        <div id="to4" class="testDiv">d</div>
      </div>
      <div class="column is-1"></div>
    </div> -->
  </div>
</template>

<script>
import CordraMixin from "@/mixins/cordra";
// import LeaderLine from "leader-line-new";
import cytoscape from "cytoscape";

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
    this.testGraph = cytoscape({
      container: document.getElementById("testCytoscape"), // container to render in

      elements: [
        // list of graph elements to start with
        {
          data: { id: "o1" },
        },
        { data: { id: "L1" } },
        { data: { id: "L2" } },
        { data: { id: "L3" } },
        { data: { id: "L4" } },
        { data: { id: "L5" } },
        { data: { id: "L6" } },

        { data: { id: "s1" } },
        { data: { id: "s2" } },
        { data: { id: "s3" } },
        { data: { id: "s4" } },
        { data: { id: "s5" } },
        { data: { id: "s6" } },
        { data: { id: "s7" } },
        { data: { id: "s8" } },
        { data: { id: "s9" } },
        { data: { id: "s10" } },
        { data: { id: "s11" } },

        ////////////////
        {
          // edge
          data: { id: "oL1", source: "o1", target: "L1" },
        },
        {
          // edge
          data: { id: "oL2", source: "o1", target: "L2" },
        },
        {
          // edge
          data: { id: "oL3", source: "o1", target: "L3" },
        },
        {
          // edge
          data: { id: "oL4", source: "o1", target: "L4" },
        },
        {
          // edge
          data: { id: "oL5", source: "o1", target: "L5" },
        },
        {
          // edge
          data: { id: "oL6", source: "o1", target: "L6" },
        },

        {
          // edge
          data: { id: "ss1", source: "L1", target: "s1" },
        },

        {
          // edge
          data: { id: "ss2", source: "L2", target: "s2" },
        },
        {
          // edge
          data: { id: "ss3", source: "L2", target: "s3" },
        },

        {
          // edge
          data: { id: "ss4", source: "L3", target: "s4" },
        },
        {
          // edge
          data: { id: "ss5", source: "L3", target: "s5" },
        },
        {
          // edge
          data: { id: "ss6", source: "L3", target: "s6" },
        },

        {
          // edge
          data: { id: "ss7", source: "L4", target: "s7" },
        },

        {
          // edge
          data: { id: "ss8", source: "L5", target: "s8" },
        },
        {
          // edge
          data: { id: "ss9", source: "L5", target: "s9" },
        },

        {
          // edge
          data: { id: "ss10", source: "L6", target: "s10" },
        },
        {
          // edge
          data: { id: "ss11", source: "L6", target: "s11" },
        },
      ],

      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#666",
            label: "data(id)",
          },
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],

      layout: {
        name: "grid",
        rows: 1,
      },
    });

    this.testGraph
      .layout({
        name: "concentric",
      })
      .run();

    console.log("testGraph", this.testGraph);

    //   for (let i = 1; i < 8; i++) {
    //     // console.log("getElementById", `${i}`);
    //     // console.log("getElementById", `to${i}`);
    //     new LeaderLine(
    //       document.getElementById(`${i}`),
    //       document.getElementById(`to${i}`),
    //       {
    //         endLabel: LeaderLine.pathLabel(
    //           `This is  a  t e s t - s t r i n g  ${i}`
    //         ),
    //       }
    //     );
    //   }
  },
};
</script>

<style scoped>
#testCytoscape {
  width: 300px;
  height: 300px;
  display: block;
}
</style>
