<template>
  <!-- <hr />
  Debug: Selected value left:{{ treeValueLeft }} Selected value right:{{
    treeValueRight
  }}
  <br />
  <hr /> -->

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
    <div class="column is-4">
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
    <div class="column is-4">
      <o-button :label="'(Disabled) Export RDF (XLM)'" :variant="'disabled'" />
    </div>
    <div class="column is-4">
      <o-button :label="'(Disabled) Export TTL'" :variant="'disabled'" />
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

  <!-- Tree view -->
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
            @change="(e) => loadOntology(e, 'source')"
          />
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label"> Choose an TTL file… </span>
          </span>
          <span class="file-name" v-if="hasSourceFileName"
            >{{ sourceFilename }}
          </span>
        </label>
      </div>

      <treeselect
        v-model="treeValueLeft"
        :multiple="true"
        :options="treeOptionssource"
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
            @change="(e) => loadOntology(e, 'target')"
          />
          <span class="file-cta">
            <span class="file-icon">
              <i class="fas fa-upload"></i>
            </span>
            <span class="file-label"> Choose an TTL file… </span>
          </span>
          <span class="file-name" v-if="hasTargetFileName"
            >{{ targetFilename }}
          </span>
        </label>
      </div>
      <treeselect
        v-model="treeValueRight"
        :multiple="true"
        :options="treeOptionstarget"
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
import rdfParser from "rdf-parse";

export default {
  name: "Editor-Main",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      prefixes: { source: {}, target: {} },
      metadataFromQuad: {
        source: { labels: {}, subClassOf: {} },
        target: { labels: {}, subClassOf: {} },
      },

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
      targetFilename: "",

      arrows: [],

      // define the default value
      treeValueLeft: [],
      treeValueRight: [],

      // define options for the tree view
      treeOptionssource: [],
      treeOptionstarget: [],

      dropdownSelectedItem: 0,
      dropdownItems: [
        // "skos:mappingRelation",
        "skos:closeMatch",
        "skos:exactMatch",
        "skos:broadMatch",
        "skos:narrowMatch",
        "skos:relatedMatch",
      ],
    };
  },

  methods: {
    checkPrefixes() /* OK */ {
      /*
          Here you can check the loaded prefixes and fix the data, if necessary 
      */
      console.group("checkPrefixes");

      for (var item in this.prefixes) {
        if (this.prefixes[item].rdf == undefined) {
          this.prefixes[item].rdf = "undefined";
        }

        if (this.prefixes[item].rdfs == undefined) {
          this.prefixes[item].rdfs = "undefined";
        }
      }

      console.log("this.prefixes", this.prefixes);
      console.groupEnd();
    },

    preprocessingMetadataQuads(quads, position) {
      /*
          From quads here you go the labels. 
          Format: {id:label,...}
      */
      // console.group("preprocessingMetadataQuads()");

      this.metadataFromQuad[position].labels = {};
      this.metadataFromQuad[position].subClassOf = {};

      if (
        this.prefixes[position].rdfs == "undefined" ||
        this.prefixes[position].owl == "undefined"
      ) {
        // TODO: ERROR
      }

      // Check values
      else {
        for (var item of quads) {
          // Ontology
          if (
            item._predicate.value
              .split(this.prefixes[position].owl.id)
              .slice(-1)[0] === "Ontology"
          ) {
            this.metadataFromQuad[position].subClassOf[item._subject.id] =
              "Ontology root";
          }

          // label
          if (
            item._predicate.value
              .split(this.prefixes[position].rdfs.id)
              .slice(-1)[0] === "label"
          ) {
            this.metadataFromQuad[position].labels[item._subject.id] =
              item._object.id.replaceAll('"', "");
          }

          // subClassOf
          else if (
            item._predicate.value
              .split(this.prefixes[position].rdfs.id)
              .slice(-1)[0] === "subClassOf"
          ) {
            this.metadataFromQuad[position].subClassOf[item._subject.id] =
              item._object.id.replaceAll('"', "");
          }

          // Leftovers
          else {
            // console.log("Leftover", item._predicate.value);
            // console.log("Item", item);
          }
        }
        console.log("metadataFromQuad", this.metadataFromQuad);

        this.createTopDownHierarchy(position);
      }
      // console.groupEnd();
    },

    createTopDownHierarchy(position) {
      /*
      Here you use subclasses to create a top-down structure
  */
      console.group("createTopDownHierarchy");
      var tempStructure = {};

      // First step
      // for (let item in this.metadataFromQuad[position].subClassOf) {
      //   var shortTemp = this.metadataFromQuad[position].subClassOf[item];
      //   if (tempStructure[shortTemp] == undefined) {
      //     tempStructure[shortTemp] = [item];
      //   }
      //   // Allready created
      //   else tempStructure[shortTemp].push(item);
      // }

      console.log("this.metadataFromQuad[position].subClassOf");
      console.dir(this.metadataFromQuad[position].subClassOf);

      this[`treeOptions${position}`] = [];

      for (let item in this.metadataFromQuad[position].subClassOf) {
        // let id = this.metadataFromQuad[position].subClassOf[item];
        // tempStructure[id] = {
        // name: this.metadataFromQuad[position].labels[id],
        // id: id,
        // children: [],
        // };

        tempStructure[item] = {
          // name: this.metadataFromQuad[position].labels[item],
          // id: item,
          // children: [],
        };

        // this[`treeOptions${position}`].push({
        //   id: item,
        //   label: this.metadataFromQuad[position].labels[item],
        // });
      }

      // Second step
      let changeFlag = true;
      let copy_move = false; // false: copy, true: move
      while (changeFlag) {
        changeFlag = false;

        for (let item in tempStructure) {
          let parent = this.metadataFromQuad[position].subClassOf[item];

          if (parent != undefined && tempStructure[parent] != undefined) {
            tempStructure[parent][item] = tempStructure[item];

            if (copy_move) delete tempStructure[item];

            copy_move = !copy_move;
            changeFlag = true;
          }
        }
      }

      // Tree Structure
      var testStructForTheTree = [];

      var traverseStructure = (
        item,
        source,
        position,
        metadata = this.metadataFromQuad[position]
      ) => {
        var currentState = {
          id: `${item}_${position}`,
          label: metadata.labels[item],
        };

        if (Object.keys(source).length > 0) currentState["children"] = [];
        for (var childNode in source) {
          currentState["children"].push(
            traverseStructure(childNode, source[childNode], position)
          );
        }

        return currentState;
      };

      // Step 1. Check if there's more than one root.
      for (let item in tempStructure) {
        // Step 2. Create the scructure
        testStructForTheTree.push(
          traverseStructure(item, tempStructure[item], position)
        );
      }
      this[`treeOptions${position}`] = testStructForTheTree;

      console.groupEnd();
    },

    loadOntology(event, position) {
      console.group("loadOntology", position);

      this[`options${position}`] = [];

      // Load a local file
      var file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      var reader = new FileReader();

      // Reader definition
      reader.onload = (e, that = this) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ontologyStream = require("streamify-string")(e.target.result);

        var tempTTL = [];
        that.prefixes[position] = {};

        rdfParser
          .parse(ontologyStream, {
            contentType: "text/turtle",
            baseIRI: "http://example.org",
          })
          .on("data", (quad) => tempTTL.push(quad))

          .on("prefix", (prefix, iri) => {
            that.prefixes[position][prefix] = iri;
          })

          .on("error", (error) => console.error(error))
          .on("end", () => {
            that.checkPrefixes();
            that.preprocessingMetadataQuads(tempTTL, position);
          });
      };

      // Read file
      if (fileExtension == "ttl") {
        reader.readAsText(file);
      } else {
        //ERROR
      }

      // this[`options${position}`] = testTTL;

      // console.log("testTTL", testTTL);
      console.log("this[`options${position}`]", this[`options${position}`]);

      console.groupEnd();
    },

    loadMappingTable(event) {
      /*
          Here you can load a mapping table as a CSV or RDF(XML) file
      */
      console.group("loadMappingTable, event:", event);

      let file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      let reader = new FileReader();

      reader.onload = (e) => {
        this.mappingtable = [];
        this.mappingtableOrig = e.target.result;
        this.mappingtableExtension = fileExtension;

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

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const textStream = require("streamify-string")(this.mappingtableOrig);

          rdfParser
            .parse(textStream, {
              contentType: "application/rdf+xml",
              baseIRI: "http://example.org",
            })
            .on("data", (quad) => console.log(quad))
            .on("error", (error) => console.error(error))
            .on("end", () => console.log("All done!"));
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

      if (this.treeValueLeft.length > 0 && this.treeValueRight.length > 0) {
        for (var left of this.treeValueLeft) {
          for (var right of this.treeValueRight) {
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

      if (this.treeValueLeft.length > 0 && this.treeValueRight.length > 0) {
        for (var left of this.treeValueLeft) {
          for (var right of this.treeValueRight) {
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
    treealueLeft: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },

    treeValueRight: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },
  },
};
</script>
