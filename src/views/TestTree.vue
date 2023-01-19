<template>
  <!-- TODO: mappingTable as an own component with an store segment? -->
  <div class="has-text-centered" style="margin-top: 1em; font-size: 2em">
    Mapping
  </div>
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
            v-text="openCloseTableView ? 'Close table view' : 'Open table view'"
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
  <div class="columns has-text-centered">
    <div class="column is-3">
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
            <span class="file-label">Choose a CSV or RDF file...</span>
          </span>
          <span class="file-name" v-if="hasMappingFileName"
            >{{ mappingtableFilename }}
          </span>
        </label>
      </div>
    </div>
    <div class="column is-3">
      <o-button :label="'(Disabled) Export CSV'" :variant="'disabled'" />
    </div>
    <div class="column is-3">
      <o-button :label="'(Disabled) Export RDF/XML'" :variant="'disabled'" />
    </div>
    <div class="column is-3">
      <o-button :label="'(Disabled) Export TTL'" :variant="'disabled'" />
    </div>
  </div>

  <hr />

  <!-- TODO: Component mapping table control? -->
  <div class="has-text-centered" @resize="selectValue">
    <o-field label="Select mapping relation:" variant="">
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
            <span class="file-label">Choose an RDF/XML or TTL file…</span>
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
            <span class="file-label">Choose an RDF/XML or TTL file…</span>
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
      prefixes: { source: {}, target: {}, mapping: {} },
      metadataFromQuad: {
        source: {},
        target: {},
        mapping: {},
      },

      openCloseTableView: true, // false: closed, true: open

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
      mappingtableExtension: "", // csv, rdf/xml or ttl, if available
      mappingtableOrig: "", // Loaded data from the file, if you need to reset

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
      console.log("this.prefixes start check", this.prefixes);

      for (var item in this.prefixes) {
        if (this.prefixes[item].rdf == undefined) {
          this.prefixes[item]["rdf"] = {
            id: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          };
        }

        if (this.prefixes[item].rdfs == undefined) {
          this.prefixes[item]["rdfs"] = {
            id: "http://www.w3.org/2000/01/rdf-schema#",
          };
        }

        if (this.prefixes[item].owl == undefined) {
          this.prefixes[item]["owl"] = {
            id: "http://www.w3.org/2002/07/owl#",
          };
        }
      }

      console.log("this.prefixes ready", this.prefixes);
      console.groupEnd();
    },

    mappingtableFromRDF(quads) /*OK*/ {
      console.group("preprocessingMetadataQuadsMappingtable", quads);
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

      for (var item in quads) {
        console.log("item", item);
      }

      console.groupEnd();
    },

    preprocessingMetadataQuadsOntology(quads, position) /*OK*/ {
      /*
          From quads here you go the labels. 
          Format: {id:label,...}
      */
      // console.group("preprocessingMetadataQuadsOntology()");
      console.group("preprocessingMetadataQuadsOntology", quads);
      this.metadataFromQuad[position].labels = {};
      this.metadataFromQuad[position].subClassOf = {};
      this.metadataFromQuad[position].class = {};

      for (var item of quads) {
        // Ontology
        if (
          item.predicate.value
            .split(this.prefixes[position].owl.id)
            .slice(-1)[0] === "Ontology"
        ) {
          this.metadataFromQuad[position].subClassOf[item.subject.value] =
            "Ontology root";
        }

        // label
        if (
          item.predicate.value
            .split(this.prefixes[position].rdfs.id)
            .slice(-1)[0] === "label"
        ) {
          this.metadataFromQuad[position].labels[item.subject.value] =
            item.object.value.replaceAll('"', "");
        }

        // subClassOf
        else if (
          item.predicate.value
            .split(this.prefixes[position].rdfs.id)
            .slice(-1)[0] === "subClassOf"
        ) {
          this.metadataFromQuad[position].subClassOf[item.subject.value] =
            item.object.value.replaceAll('"', "");
        }

        // Class
        else if (
          item.predicate.value
            .split(this.prefixes[position].rdf.id)
            .slice(-1)[0] === "type" &&
          item.object.value
            .split(this.prefixes[position].owl.id)
            .slice(-1)[0] == "Class1"
        ) {
          this.metadataFromQuad[position].class[item.subject.value] = "Class";
        }

        // Leftovers
        else {
          console.log("Leftover", item.predicate.value);
          console.log("Item", item);
        }
      }
      console.log("metadataFromQuad", this.metadataFromQuad);

      this.createTopDownHierarchy(position);

      console.groupEnd();
    },

    createTopDownHierarchy(position) /*OK*/ {
      /*
          Here you use subclasses to create a top-down structure
      */
      console.group("createTopDownHierarchy");
      var tempStructure = {};

      // First step
      this[`treeOptions${position}`] = [];

      for (let item in this.metadataFromQuad[position].subClassOf) {
        tempStructure[item] = {};
      }
      for (let item in this.metadataFromQuad[position].class) {
        tempStructure[item] = {};
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

    loadOntology(event, position) /*OK*/ {
      console.group("loadOntology", position);

      this[`options${position}`] = [];

      // Load a local file
      var file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      var reader = new FileReader();
      let mimeType = "";
      // Reader definition
      reader.onload = (e, that = this) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ontologyStream = require("streamify-string")(e.target.result);

        var tempTTL = [];
        that.prefixes[position] = {};
        // console.log("mimeType: ", mimeType);
        rdfParser
          .parse(ontologyStream, {
            // contentType: ,
            contentType: mimeType,
            baseIRI: "http://example.org",
          })
          .on("data", (quad) => tempTTL.push(quad))

          .on("prefix", (prefix, iri) => {
            // console.log(`${prefix} : ${iri}`);
            // console.dir(Object.keys(iri));
            that.prefixes[position][prefix] = iri;
          })

          .on("error", (error) => console.error(error))
          .on("end", () => {
            that.checkPrefixes();
            that.preprocessingMetadataQuadsOntology(tempTTL, position);
          });
      };

      // Read file
      // TTL
      if (fileExtension == "ttl") {
        mimeType = "text/turtle";
        reader.readAsText(file);
      }
      // RDF/XML
      else if (fileExtension == "rdf" || fileExtension == "xml") {
        mimeType = "application/rdf+xml";
        reader.readAsText(file);
      }
      // ERROR
      else {
        //ERROR
      }

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
      let mimeType = "";

      reader.onload = (e, that = this) => {
        console.log("onload", onload);

        this.mappingtable = [];
        this.mappingtableOrig = e.target.result;
        this.mappingtableExtension = fileExtension;
        console.log("this.mappingtableExtension", this.mappingtableExtension);

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
        }

        // RDF(XML)
        else if (
          this.mappingtableExtension === "rdf" ||
          this.mappingtableExtension === "xml" ||
          this.mappingtableExtension === "ttl"
        ) {
          console.log("RDF selected");
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ontologyStream = require("streamify-string")(e.target.result);

          var tempRDF = [];
          that.prefixes["mapping"] = {};
          console.log("mimeType: ", mimeType);
          rdfParser
            .parse(ontologyStream, {
              // contentType: ,
              contentType: mimeType,
              baseIRI: "http://example.org",
            })
            .on("data", (quad) => tempRDF.push(quad))

            .on("prefix", (prefix, iri) => {
              console.log(`${prefix} : ${iri}`);
              console.dir(Object.keys(iri));
              that.prefixes["mapping"][prefix] = iri;
            })

            .on("error", (error) => console.error(error))
            .on("end", () => {
              that.checkPrefixes();
              that.mappingtableFromRDF(tempRDF);
            });

          this.mappingtableFilename = file.name;
          this.refreshMappingtableUI();
        }

        // TTL(Turtle)
        // else if (this.mappingtableExtension === "ttl") {
        // // eslint-disable-next-line @typescript-eslint/no-var-requires
        // const ontologyStream = require("streamify-string")(e.target.result);

        // var tempTTL = [];
        // that.prefixes[position] = {};
        // // console.log("mimeType: ", mimeType);
        // rdfParser
        //   .parse(ontologyStream, {
        //     // contentType: ,
        //     contentType: mimeType,
        //     baseIRI: "http://example.org",
        //   })
        //   .on("data", (quad) => tempTTL.push(quad))

        //   .on("prefix", (prefix, iri) => {
        //     // console.log(`${prefix} : ${iri}`);
        //     // console.dir(Object.keys(iri));
        //     that.prefixes[position][prefix] = iri;
        //   })

        //   .on("error", (error) => console.error(error))
        //   .on("end", () => {
        //     that.checkPrefixes();
        //     that.preprocessingMetadataQuadsOntology(tempTTL, position);
        //   });

        // this.mappingtableFilename = file.name;
        //   this.refreshMappingtableUI();
        // }

        // Wrong file extension
        else {
          // TODO: Warnings
          this.mappingtableOrig = "";
          this.mappingtableExtension = "";
        }
      };

      // Read file
      // TTL
      if (fileExtension == "csv") {
        mimeType = "";
        reader.readAsText(file);
      }
      // TTL
      else if (fileExtension == "ttl") {
        mimeType = "text/turtle";
        reader.readAsText(file);
      }
      // RDF/XML
      else if (fileExtension == "rdf" || fileExtension == "xml") {
        mimeType = "application/rdf+xml";
        reader.readAsText(file);
      }
      // ERROR
      else {
        // ERROR;
      }

      // reader.readAsText(file);

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

            console.log("left", left);
            console.log(
              "right",
              this.metadataFromQuad.target.labels[right.replace("_target", "")]
            );
            this.mappingtable[left][right] = {
              sourceTitle:
                this.metadataFromQuad.source.labels[
                  left.replace("_source", "")
                ],
              targetTitle:
                this.metadataFromQuad.target.labels[
                  right.replace("_target", "")
                ],
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
      // this.resetArrows();
      window.mappingDataTable.load(currentState);
      this.selectValue();
    },

    resetArrows() /* TODO: Fix reactivity*/ {
      this.treeValueLeft = [];
      this.treeValueRight = [];
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

    // openCloseTableView: {
    //   handler() {
    //     this.selectValue();
    //   },
    //   deep: true,
    // },
  },
};
</script>
