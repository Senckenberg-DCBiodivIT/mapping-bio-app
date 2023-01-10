<template>
  <hr />
  Debug: Selected value left:{{ valueLeft }} Selected value right:{{ valueRight
  }}<br />

  <hr />

  <!-- TODO: mappingTable as an own component with an store segment? -->
  <p class="has-text-centered">Mapping (TODO: Layout)</p>
  <br />

  <!-- mappping table, CSV, RDF projection -->
  <section>
    <o-collapse
      :open="true"
      aria-id="mappingTableUI_ID"
      @open="openCloseTableView = true"
      @close="openCloseTableView = false"
    >
      <template #trigger>
        <p class="has-text-centered">
          <o-button
            variant="primary"
            aria-controls="mappingTableUI_ID"
            v-text="
              openCloseTableView
                ? 'Close table view (TODO: Layout)'
                : 'Open table view (TODO: Layout)'
            "
          >
          </o-button>
        </p>
        <br />
      </template>
      <div class="notification">
        <div class="columns">
          <div class="column is-one" />
          <div class="column is-10"><table id="mapppingtableCSV" /></div>
          <div class="column is-one" />
        </div>
      </div>
    </o-collapse>
  </section>
  <br /><br />

  <!-- Buttons "Load" and "Download CSV" -->
  <div class="columns">
    <div class="column is-half">
      <div
        class="file is-primary is-centered"
        :class="{ 'has-name': hasMappingFileName }"
      >
        <label class="file-label">
          <input
            class="file-input"
            type="file"
            accept=""
            name="resume"
            @change="loadMappingTable"
          />
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label"> Choose a CSV or RDF file </span>
          </span>
          <span class="file-name" v-if="hasMappingFileName"
            >{{ mappingtableFilename }}
          </span>
        </label>
      </div>
    </div>
    <div class="column is-half">
      <o-button
        :label="'(Disabled) Download current mapping table'"
        :variant="'disabled'"
      />
    </div>
  </div>

  <hr />

  <!-- TODO: Component mapping table control? -->
  <div class="has-text-centered" @resize="selectValue">
    <o-field label="(check the documentation for mappings) Select:" variant="">
      <o-dropdown
        aria-role="list"
        v-model="dropdownSelectedItem"
        :disabled="disableDropDown"
        @change="setTaxonID"
      >
        <template #trigger="{ active }">
          <o-button variant="primary">
            <span>{{ dropdownItems[dropdownSelectedItem] }}</span>

            <o-icon
              pack="fa"
              :icon="active ? 'chevron-down' : 'chevron-up'"
            ></o-icon>
          </o-button>
        </template>

        <o-dropdown-item
          v-for="(item, key) in dropdownItems"
          :key="key"
          :value="key"
          aria-role="listitem"
        >
          {{ dropdownItems[key] }}</o-dropdown-item
        >
      </o-dropdown>
    </o-field>

    <o-button :label="'Add mapping'" :variant="'info'" @click="addMapping" />
  </div>

  <div class="columns" @click="selectValue">
    <!-- Component source tree view -->
    <div class="column is-4">
      <div
        class="file is-primary is-centered"
        :class="{ 'has-name': hasSourceFileName }"
      >
        <label class="file-label">
          <input
            class="file-input"
            type="file"
            accept="owl"
            name="resume"
            @change="(e) => loadOWL(e, 'source')"
          />
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label"> Choose an OWL file… </span>
          </span>
          <span class="file-name" v-if="hasSourceFileName"
            >{{ sourceFilename }}
          </span>
        </label>
      </div>

      <treeselect
        v-model="valueLeft"
        :multiple="true"
        :options="optionssource"
        :always-open="true"
      />
    </div>
    <div class="column" />

    <!-- Component target tree view -->
    <div class="column is-4">
      <div
        class="file is-primary is-centered"
        :class="{ 'has-name': hasTargetFileName }"
      >
        <label class="file-label">
          <input
            class="file-input"
            type="file"
            accept="owl"
            name="resume"
            @change="(e) => loadOWL(e, 'target')"
          />
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label"> Choose an OWL file… </span>
          </span>
          <span class="file-name" v-if="hasTargetFileName"
            >{{ targetFilename }}
          </span>
        </label>
      </div>
      <treeselect
        v-model="valueRight"
        :multiple="true"
        :options="optionstarget"
        :always-open="true"
      />
    </div>
  </div>
</template>

<script setup>
// import the component
import Treeselect from "vue3-treeselect";
// import the styles
import "vue3-treeselect/dist/vue3-treeselect.css";

import LeaderLine from "leader-line-new";
</script>

<script>
import CordraMixin from "@/mixins/cordra";

// Mapping table
import AppendGrid from "jquery.appendgrid";

// RDF
// import { RdfXmlParser } from "rdfxml-streaming-parser";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rdfParser = require("rdf-parse").default;

import streamy from "streamify-string";
import "streamify-string";

export default {
  name: "TestComponent",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      openCloseTableView: false, // false: closed, true: open

      mappingDataTableConfig: [
        {
          name: "relation",
          display: "Relation",
          type: "select",
          ctrlOptions: ["", "(=)", "<", ">"],
        },

        {
          name: "sourceTitle",
          display: "Source title",
        },
        {
          name: "sourceLink",
          display: "Source link",
        },
        {
          name: "targetTitle",
          display: "Target title",
        },
        {
          name: "targetLink",
          display: "Target link",
        },

        {
          name: "comment",
          display: "Comment",
        },
      ],

      mappingtableFilename: "",
      mappingtableExtension: "", // csv or rdf, if available
      mappingtableOrig: "", // Loaded data from the file, if you need a reset

      mappingtable: [], // Definition look at loadMappingTable(). For the UI take mappingtableUI!

      sourceFilename: "",
      sourcetable: [],

      targetFilename: "",
      targettable: [],

      arrows: [],

      // define the default value
      valueLeft: [],
      valueRight: [],

      // define options for the tree view
      optionssource: [],
      optionstarget: [],

      dropdownSelectedItem: 0,
      dropdownItems: ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"],
    };
  },

  methods: {
    async loadOWL(event, position, link = "") {
      console.group("loadOWL", position);

      let testTTL = [];
      this[`options${position}`] = [];

      // Load a link
      if (link != "") {
        console.group("link", link);

        fetch(link)
          .then((response) => {
            console.log("Response", response);
          })
          .then((data) => {
            console.log("data", data);
          });
      }

      // Load a local file
      else {
        // console.log("event", event);

        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onload = (e, that = this) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ttl_read = require("@graphy/content.ttl.read");

          ttl_read(e.target.result, {
            data(y_quad) {
              // console.dir(y_quad);
              // testTTL.push({
              //   id: `${position}${y_quad.object.value}`,
              //   label: y_quad.object.value,
              // });
              testTTL.push(y_quad);

              that[`options${position}`] = testTTL;
            },

            eof(h_prefixes) {
              console.log("done!", testTTL);
              // console.log("done!", h_prefixes);
            },
          });
        };
        reader.readAsText(file);

        // this[`options${position}`] = testTTL;

        // console.log("testTTL", testTTL);
        console.log("this[`options${position}`]", this[`options${position}`]);
      }

      console.groupEnd();
    },

    loadMappingTable(event) {
      /*
          Here you can load a mapping table as a CSV or RDF(XML) file
      */
      console.group("loadMappingTable, event:", event);

      let file = event.target.files[0];
      let fileExtension = event.target.files[0].name.split(".").slice(-1)[0];

      let reader = new FileReader();

      reader.onload = (e) => {
        this.mappingtable = [];
        this.mappingtableOrig = e.target.result;
        this.mappingtableExtension = fileExtension.toLowerCase();

        /*
         Format mapping compare structure
         {
          "source link":{
            "target link":{
              "sourceTitle","targetTitle", "relation", "comment"
            }
          }
         }
         */

        // CSV
        if (this.mappingtableExtension === "csv") {
          /*
          Format mapping CSV:
          0 relation
          1 source title
          2 source link
          3 target title
          4 target link
          5 comment

          Target: Format mapping compare structure
          */

          var mappingtableRows = e.target.result.split("\n");

          for (var cell of mappingtableRows) {
            var cellInRow = cell.split(",");
            // console.log("cellInRow", cellInRow);
            if (this.mappingtable[cellInRow[2]] == undefined) {
              this.mappingtable[cellInRow[2]] = {};
            }
            this.mappingtable[cellInRow[2]][cellInRow[4]] = {
              sourceTitle: cellInRow[1],
              targetTitle: cellInRow[3],
              relation: cellInRow[0],
              comment: cellInRow[5],
            };
          }
          this.mappingtableFilename = file.name;
          this.refreshMappingtableUI();

          // console.log("this.mappingtable", this.mappingtable);
        }

        // RDF(XML)
        else if (this.mappingtableExtension === "rdf") {
          // var mappingtableRDF = e.target.result;

          rdfParser
            .parse(this.mappingtableOrig, {
              contentType: "text/turtle",
              baseIRI: "http://example.org",
            })
            .on("data", (quad) => console.log(quad))
            .on("error", (error) => console.error(error))
            .on("end", () => console.log("All done!"));

          // const myParser = new RdfXmlParser({ baseIRI: "http://example.org/" });
          // var testArr = [];
          // myParser
          //   .on("data", function (d) {
          //     testArr.push(d);
          //   })
          //   .on("error", console.error)
          //   .on("end", () => console.log("All triples were parsed!", testArr));

          // myParser.write(e.target.result);
          // myParser.end();

          // console.log("mappingtableRDF", mappingtableRDF);
        }

        // Wrong file extension
        else {
          // TODO: Warnings
          this.mappingtableOrig = "";
          this.mappingtableExtension = "";
        }
      };

      reader.readAsText(file);

      console.groupEnd();
    },

    addMapping() {
      /*
      Here you add a selected mapping config to the mapping table
  */
      console.group("addMapping");

      if (this.valueLeft.length > 0 && this.valueRight.length > 0) {
        for (var left of this.valueLeft) {
          for (var right of this.valueRight) {
            if (this.mappingtable[left] == undefined) {
              this.mappingtable[left] = {};
            }

            this.mappingtable[left][right] = {
              sourceTitle: "Todo: set a source title",
              targetTitle: "Todo: set a target title",
              relation: "", // TODO: set the selected relation, but current we have different valuer in CSV ans RDF...
              comment: "",
            };
          }
        }
        this.refreshMappingtableUI();
      }

      // Warning
      else {
        // TODO: Error here
      }

      console.groupEnd();
    },

    selectValue() /* OK*/ {
      /*
          Here you check current selection of the ontologies and
          rewrite the arrows each call
      */

      for (var arrow of this.arrows) {
        arrow.remove();
      }
      this.arrows = [];

      var allDivs = document.getElementsByTagName("*");

      if (this.valueLeft.length > 0 && this.valueRight.length > 0) {
        for (var left of this.valueLeft) {
          for (var right of this.valueRight) {
            var from = null,
              to = null;

            for (var singleDiv of allDivs) {
              if (singleDiv.getAttribute("data-id") == left) {
                from = singleDiv;
              } else if (singleDiv.getAttribute("data-id") == right) {
                to = singleDiv;
              }

              if (from != null && to != null) {
                this.arrows.push(new LeaderLine(from, to));
                from = null;
                to = null;
                break;
              }
            }
          }
        }
      }
    },

    refreshMappingtableUI() /* OK */ {
      /*
          Here you can manually refresh the UI state based on the current mapping state like
          - a loaded CSV
          - a loaded RDF with XML notation
          - a changed state after an activity from user
            - create a new
            - or delete a relation between two ontologies
      */

      var currentState = [];
      for (var idxSource in this.mappingtable) {
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          currentState.push({
            relation: this.mappingtable[idxSource][idxTarget]["relation"],
            sourceTitle: this.mappingtable[idxSource][idxTarget]["sourceTitle"],
            sourceLink: idxSource,
            targetTitle: this.mappingtable[idxSource][idxTarget]["targetTitle"],
            targetLink: idxTarget,
            comment: this.mappingtable[idxSource][idxTarget]["comment"],
          });
        }
      }

      if (currentState.length == 0) {
        currentState.push({
          relation: "",
          sourceTitle: "",
          sourceLink: "",
          targetTitle: "",
          targetLink: "",
          comment: "",
        });
      }

      window.mappingDataTable.load(currentState);
    },
  },

  computed: /* OK */ {
    // Filenames
    hasMappingFileName() {
      return this.mappingtableFilename != "" ? true : false;
    },
    hasSourceFileName() {
      return this.sourceFilename != "" ? true : false;
    },
    hasTargetFileName() {
      return this.targetFilename != "" ? true : false;
    },
  },

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted() /* OK */ {
    window.mappingDataTable = new AppendGrid({
      element: document.getElementById("mapppingtableCSV"),
      uiFramework: "bulma",
      iconFramework: "default",

      columns: this.mappingDataTableConfig,

      sectionClasses: {
        table: "is-narrow is-fullwidth",
      },
    });

    this.refreshMappingtableUI();
  },

  watch: /*OK*/ {
    valueLeft: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },

    valueRight: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },
  },
};
</script>
