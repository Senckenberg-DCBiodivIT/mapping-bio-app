<template>
  <TheMessenger />

  <!-- mappping table, CSV, RDF projection -->
  <TheMappingtable />

  <!-- Buttons for mapings (choose, show and export) 
  TODO: an own component or inline? -->
  <div class="columns has-text-centered">
    <div class="column is-1" />

    <div class="column is-2">
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
              <i class="fa fa-upload"></i>
            </span>
            <span class="file-label">Choose a mapping file...</span>
          </span>
          <span class="file-name" v-if="hasMappingFileName"
            >{{ mappingtableFilename }}
          </span>
        </label>
      </div>
    </div>

    <div class="column" />

    <div class="column is-2">
      <o-button
        :label="'Show all mappings'"
        @click="showAllArrowsFromMappingtable()"
        :variant="'primary'"
      />
    </div>
    <div class="column" />

    <div class="column is-2">
      <o-dropdown
        aria-role="list"
        v-model="dropdownExportFormatItem"
        @update:modelValue="showSecondStep"
      >
        <template #trigger="{ active }">
          <o-button variant="primary">
            <span>{{ dropdownExportFormat[dropdownExportFormatItem] }}</span>

            <o-icon
              pack="fa"
              :icon="active ? 'chevron-down' : 'chevron-up'"
            ></o-icon>
          </o-button>
        </template>

        <o-dropdown-item
          v-for="(item, key) in dropdownExportFormat"
          :key="key"
          :value="key"
          aria-role="listitem"
        >
          {{ dropdownExportFormat[key] }}</o-dropdown-item
        >
      </o-dropdown>
    </div>

    <div class="column is-1" />
  </div>

  <!-- Debug -->
  <!-- this.test.queueCount: {{ test.queueCount }} -->

  <!-- this.tree.value: {{ this.tree.value }}<br /><br /> -->
  <!-- this.tree: {{ this.tree }} -->
  <!-- <br />
  <hr /> -->
  <!-- Debug END -->

  <!-- <TheTreeStructure /> -->

  <div class="block">
    <!-- TODO: Component mapping table control? -->
    <div class="has-text-centered" @resize="selectValue">
      <o-field label="Select mapping relation:" variant="">
        <o-dropdown aria-role="list" v-model="dropdownSelectedItem">
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
        <!-- Button -->
        <div
          class="file is-primary is-centered"
          :class="{ 'has-name': hasSourceFileName }"
        >
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              multiple
              accept="owl"
              name="resume"
              @change="(e) => loadOntology(e, 'source')"
            />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fa fa-upload"></i>
              </span>
              <span class="file-label">Choose a RDF/XML or TTL file…</span>
            </span>
            <span class="file-name" v-if="hasSourceFileName"
              >{{ sourceFilename }} </span
            >&nbsp;
            <o-button
              :label="'...or load a short example'"
              @click="load_onto_example('source')"
              :variant="'warning'"
            />
          </label>
        </div>

        <!-- Tree -->
        <treeselect
          :key="tree.reloadKey.source"
          v-model="tree.value.source"
          :flat="true"
          :multiple="true"
          :options="tree.options.source"
          :alwaysOpen="true"
          :open-direction="'bottom'"
          :load-options="loadOntologyChild"
        />
        <!-- :load-options="loadOntologyChild" -->
        <!-- :default-expand-level="100" -->
      </div>
      <div class="column" />

      <!-- Component target tree view -->
      <div class="column is-4">
        <!-- Button -->
        <div
          class="file is-primary is-centered"
          :class="{ 'has-name': hasTargetFileName }"
        >
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              multiple
              accept="owl"
              name="resume"
              @change="(e) => loadOntology(e, 'target')"
            />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fa fa-upload"></i>
              </span>
              <span class="file-label">Choose a RDF/XML or TTL file…</span>
            </span>
            <span class="file-name" v-if="hasTargetFileName"
              >{{ targetFilename }}
            </span>
            &nbsp;
            <o-button
              :label="'...or load a short example'"
              @click="load_onto_example('target')"
              :variant="'warning'"
            />
          </label>
        </div>

        <!-- Tree -->
        <treeselect
          :key="tree.reloadKey.target"
          v-model="tree.value.target"
          :flat="true"
          :multiple="true"
          :options="tree.options.target"
          :alwaysOpen="true"
          :open-direction="'bottom'"
          :load-options="loadOntologyChild"
        />
        <!-- :load-options="loadOntologyChild" -->
        <!-- :default-expand-level="100" -->
      </div>
    </div>
  </div>

  <TheExport
    class="second-step"
    @openClose="
      (value) => {
        openCloseSecondStepView = value;
      }
    "
    :fileExtension="dropdownExtension[dropdownExportFormatItem]"
    v-if="openCloseSecondStepView == 'open'"
  />>
</template>

<script setup>
// Own components
import TheMessenger from "@/components/TheMessenger";
import TheMappingtable from "@/components/TheMappingtable";
// import TheTreeStructure from "@/components/TheTreeStructure";
import TheExport from "@/components/TheExport";
import { onto_example } from "@/components/onto_example";

// import vuex mutations
import { mapMutations } from "vuex";

// import tree component
import Treeselect from "vue3-treeselect";

// import the styles
import "vue3-treeselect/dist/vue3-treeselect.css";

// Arrows
import LeaderLine from "leader-line-new";

// RDF
import rdfParser from "rdf-parse";

// Quadstore & Co
import { Engine } from "quadstore-comunica";
import { storeStream } from "rdf-store-stream";
import { query } from "@/components/query";
</script>

<script>
export default {
  name: "Home-SGN",
  // mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      onto_example: onto_example,

      updateHeightIntervall: false,
      openCloseSecondStepView: "close", // this is the export component. Use 'open' or 'close'

      sourceFilename: "",
      targetFilename: "",
      mappingtableFilename: "",

      arrows: [],

      tree: {
        value: { source: [], target: [] }, // selected items
        options: { source: [], target: [] }, // tree content
        reloadKey: { source: 0, target: 0 }, // reload index for VUE reloads
        skos_flag: { source: false, target: false }, // we need to modify queries if it's a skos notation
      },

      rdfObj: {
        engines: { source: [], target: [], mapping: {} },
        classes: { source: {}, target: {} }, // A helper object to indicate unused classes (owl:Class) for error recognition
      },
      query: query, // external stored queries for a better readability
      // queueCount: 0, // Using for debug functionality

      dropdownSelectedItem: 0,
      dropdownItems: [
        // "skos:mappingRelation",
        "skos:closeMatch",
        "skos:exactMatch",
        "skos:broadMatch",
        "skos:narrowMatch",
        "skos:relatedMatch",
      ],

      dropdownExportFormat: [
        "Export",
        "CSV",
        "RDF/XML",
        "RDF/TTL",
        "RDF/JSON-LD (tbc)",
        "SSSOM (TTL)",
        "SSSOM/JSON-LD",
      ],
      dropdownExtension: ["", "csv", "rdf", "ttl", "json", "sssom", "sssom"],
      dropdownExportFormatItem: 0,
    };
  },

  methods: {
    // vuex store
    ...mapMutations({
      newMessage: "messenger/newMessage",
      setFile: "mappingtable/setFile",
      addMappingItem: "mappingtable/addMappingItem",
    }),

    // Load
    load_onto_example(position) {
      /* Description: Here you can load an example instead of an external source
        position = 'source' or 'target'
      */

      console.group("load_onto_example", position);

      // Reset the widgets and data
      this.resetArrows();

      this.tree.options[position] = []; // Reset Nodes from the tree
      this.rdfObj.engines[position] = []; // Use an own engine for each position (source and target)

      // Set new value
      this.tree.options[position] = this.onto_example[position];
      console.groupEnd();
    },

    loadOntology(event, position) /**/ {
      console.group("loadOntology", position);
      var time_test; // TODO:Delete me after the test and optimization

      let message = { content: "Loading data", kind: "primary" };
      this.newMessage(message);

      // Reset the widgets and data
      this.resetArrows();

      this.tree.options[position] = []; // Reset Nodes from the tree
      var tree_options = []; // temp structure

      this.rdfObj.engines[position] = []; // Use an own engine for each position (source and target)

      // Load local files
      for (let file of event.target.files) {
        let fileExtension = file.name.split(".").slice(-1)[0].toLowerCase();

        let reader = new FileReader();
        let mimeType = ""; // "text/turtle" or "application/rdf+xml"

        // Reader definition
        time_test = new Date();

        reader.onload = async (e, that = this) => {
          // Inner functions
          async function step1_getAllClasses() {
            console.log("step1_getAllClasses.getAllClasses()");

            let tempBindingsStream = null;

            tempBindingsStream = await that.rdfObj.engines[position][
              idxEngine
            ].queryBindings(that.query.getAllClasses_OWL);

            tempBindingsStream.on("data", (bindings) => {
              // console.log("debug bindings", bindings);
              let classID = bindings.entries.hashmap.node.children[0].value.id;
              if (!that.rdfObj.classes[position][classID]) {
                that.rdfObj.classes[position][classID] = false;
              }
            });

            tempBindingsStream.on("error", (error) => console.log(error));

            tempBindingsStream.on("end", () => {
              console.log(
                "step1_getAllClasses ready",
                that.rdfObj.classes[position]
              );

              step2_firstLevelClasses();
            });
          }

          async function step2_firstLevelClasses() {
            console.log("Data loaded in sec:", (new Date() - time_test) / 1000);

            let tempBindingsStream = null;

            // Select the query
            if (that.tree.skos_flag[position]) {
              tempBindingsStream = await that.rdfObj.engines[position][
                idxEngine
              ].queryBindings(that.query.firstLevelClass_SKOS);
            } else {
              tempBindingsStream = await that.rdfObj.engines[position][
                idxEngine
              ].queryBindings(that.query.firstLevelClass_OWL);
            }
            // that.queueCount++;

            // Catch data
            tempBindingsStream.on("data", (bindings) => {
              // console.log("bindings", bindings);

              // detected classes
              that.rdfObj.classes[position][
                bindings.entries.hashmap.node.children[0].value.id
              ] = true;

              const id =
                bindings.entries.hashmap.node.children[0].value.id.replaceAll(
                  '"',
                  ""
                ) + `_${position}`;

              var oldEneteryFlag = false;

              // You can use only "@en" labels. On this way "en-US" is valid too
              let labelValid =
                (that.tree.skos_flag[position] &&
                  bindings.entries.hashmap.node.children[1].value.id.includes(
                    "@en"
                  )) ||
                !that.tree.skos_flag[position];

              if (labelValid) {
                for (var treeItem of tree_options) {
                  if (treeItem.id == id) {
                    oldEneteryFlag = true;
                  }
                }

                if (!oldEneteryFlag) {
                  // that
                  //   .loadOntologyChild(that.cleanSuffix(id), position)
                  //   .then((children) => {
                  //     tree_options.push({
                  //       id: id,
                  //       label:
                  //         bindings.entries.hashmap.node.children[1].value.id.replaceAll(
                  //           '"',
                  //           ""
                  //         ),
                  //       children: children,
                  //       position: position, // for the sparql engine (source or engine, left or right) //TODO: do we still need it?
                  //     });
                  //   });

                  tree_options.push({
                    id: id,
                    label:
                      bindings.entries.hashmap.node.children[1].value.id.replaceAll(
                        '"',
                        ""
                      ),
                    children: null,
                    position: position, // for the sparql engine (source or engine, left or right) //TODO: do we still need it?
                  });
                }
              }
            });

            tempBindingsStream.on("error", (error) => console.log(error));

            tempBindingsStream.on("end", () => {
              console.log(
                "Data and first level loaded in sec:",
                (new Date() - time_test) / 1000
              );

              console.log("tree_options", tree_options);

              that.tree.options[position] = tree_options;

              // that.queueCount--;

              console.log("step2_firstLevelClasses ready");
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ontologyStream = require("streamify-string")(e.target.result);

          const quadStream = rdfParser.parse(ontologyStream, {
            contentType: mimeType,
            baseIRI: "http://example.org",
          });

          const store = await storeStream(quadStream);
          that.rdfObj.engines[position].push(new Engine(store));
          let idxEngine = that.rdfObj.engines[position].length - 1;

          // Detect if skos
          this.tree.skos_flag[position] =
            e.target.result.includes("xmlns:skos");

          // Step 1 - detect all classes
          // At first for OWL
          // step1_getAllClasses();

          // Step 2 - detect all first level classes ( not a subclass from another one)
          // Chained from step 1
          step2_firstLevelClasses();

          // Step 3 - detect all children-nodes
          // Chained from step 2

          // Step 4 - detect all unmasked classes and build a new first leven structure
        };

        // Read file
        // TTL
        if (fileExtension == "ttl") {
          mimeType = "text/turtle";
          reader.readAsText(file);
        }
        // RDF/XML
        else if (fileExtension == "rdf" || fileExtension == "xml") {
          console.log("RDF detected");
          mimeType = "application/rdf+xml";
          reader.readAsText(file);
        }
        // ERROR
        else {
          // TODO: ERROR
        }
      }

      console.groupEnd();
    },

    // TODO: remove bevor beta
    async testFKT() {
      return "ack";
    },

    async loadOntologyChild(param) {
      // async loadOntologyChild(id, position) {

      /*       Whenever an unloaded branch node gets expanded, 
      loadOptions({ action, parentNode, callback, instanceId }) 
      will be called, then you can perform the job requesting data from a remote server
       */

      // console.group("loadOntologyChild", param);
      var nodeChildren = [];
      var query = "";

      var id = this.cleanSuffix(param.parentNode.id);
      var position = param.parentNode.position;

      if (this.tree.skos_flag[position]) {
        query = this.query.subclassOf_SKOS.replaceAll("ID_HERE", id);
      } else {
        query = this.query.subclassOf_OWL.replaceAll("ID_HERE", id);
      }
      // console.log("query", query);

      for (var singleEngine of this.rdfObj.engines[position]) {
        var bindingsStream = await singleEngine.queryBindings(query);

        this.queueCount++;

        bindingsStream.on("data", (bindings) => {
          // console.log("bindings", bindings);
          const childID =
            bindings.entries.hashmap.node.children[1].value.id.replaceAll(
              '"',
              ""
            ) + `_${position}`;

          var oldEneteryFlag = false;

          // You can use only "@en" labels. On this way "en-US" is valid too
          let labelValid =
            (this.tree.skos_flag[position] &&
              bindings.entries.hashmap.node.children[0].value.id.includes(
                "@en"
              )) ||
            !this.tree.skos_flag[position];
          if (labelValid) {
            for (var treeItem of nodeChildren) {
              if (treeItem.id == id) {
                oldEneteryFlag = true;
              }
            }
          }
          if (!oldEneteryFlag && labelValid) {
            // this.loadOntologyChild(
            //   bindings.entries.hashmap.node.children[1].value.id,
            //   position
            // ).then((children) => {
            //   nodeChildren.push({
            //     id: childID,
            //     label:
            //       bindings.entries.hashmap.node.children[0].value.id.replaceAll(
            //         '"',
            //         ""
            //       ),
            //     children: children,
            //     position: position, // for the sparql engine
            //   });
            // });

            nodeChildren.push({
              id: childID,
              label:
                bindings.entries.hashmap.node.children[0].value.id.replaceAll(
                  '"',
                  ""
                ),
              children: null,
              position: position, // for the sparql engine
            });
          }
        });
        bindingsStream.on("end", () => {
          // console.log("nodeChildren .end", nodeChildren);
          // this.queueCount--;
          // return nodeChildren; // null if no one child or [children...]
          // return null; //nodeChildren; // null if no one child or [children...]

          param.parentNode.children = nodeChildren;
          param.callback();
        });
      }

      // console.groupEnd();
    },

    loadMappingTable(event) /**OK */ {
      let file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      let reader = new FileReader();

      reader.onload = async (e) => {
        this.setFile({
          fileText: e.target.result,
          fileExtension: fileExtension,
        });
      };

      // Read file
      reader.readAsText(file);
    },

    // Mapping interactions
    addMapping() /**OK */ {
      /*
      Here you add a selected mapping config to the mapping table
  */

      if (
        this.tree.value.source.length > 0 &&
        this.tree.value.target.length > 0
      ) {
        for (var left of this.tree.value.source) {
          for (var right of this.tree.value.target) {
            var value = {};

            var sourceTitle = document
              .querySelectorAll(`[data-id='${left}']`)[0]
              .getElementsByTagName("label")[0].innerText;

            var targetTitle = document
              .querySelectorAll(`[data-id='${right}']`)[0]
              .getElementsByTagName("label")[0].innerText;

            value = {
              left: this.cleanSuffix(left),
              right: this.cleanSuffix(right),
              sourceTitle: sourceTitle,
              targetTitle: targetTitle,
              relation: this.dropdownItems[this.dropdownSelectedItem],
              comment: "",
            };

            this.addMappingItem(value);
          }
        }

        // TODO: use watcher after split
        this.resetArrows();
      }

      // Warning
      else {
        // TODO: Error here
      }

      console.groupEnd();
    },

    // Tree interactions
    // TODO: remove after split
    selectValue() {
      /*
          Here you check current selection of the ontologies and
          rewrite the arrows each call
      */
      // console.group("selectValue");

      for (var arrow of this.arrows) {
        arrow.remove();
      }
      this.arrows = [];

      if (
        this.tree.value.source.length > 0 &&
        this.tree.value.target.length > 0
      ) {
        for (var left of this.tree.value.source) {
          for (var right of this.tree.value.target) {
            var from = document.querySelectorAll(`[data-id='${left}']`)[0];
            var to = document.querySelectorAll(`[data-id='${right}']`)[0];

            if (from != null && to != null) {
              this.arrows.push(new LeaderLine(from, to));
              from = null;
              to = null;
            }
          }
        }
      }

      // console.groupEnd();
    },

    // TODO: remove after split
    resetArrows() {
      // console.group("resetArrows");
      this.tree.value.source = [];
      this.tree.reloadKey.source++;

      this.tree.value.target = [];
      this.tree.reloadKey.target++;

      this.selectValue();
      this.updateHeight();

      // console.groupEnd();
    },

    // TODO: remove after split
    showArrowFromMappingtable(uniqueIndex) {
      // console.group("showArrowFromMappingtable", uniqueIndex);

      uniqueIndex--;
      this.resetArrows();

      this.tree.value.source = [
        window.mappingDataTable.getCtrlValue("sourceLink", uniqueIndex),
      ];

      this.tree.value.target = [
        window.mappingDataTable.getCtrlValue("targetLink", uniqueIndex),
      ];

      this.selectValue();
      // console.groupEnd();
    },

    // TODO: remove after split
    showAllArrowsFromMappingtable() {
      console.group("showAllArrowsFromMappingtable");
      this.resetArrows();

      var columns = window.mappingDataTable.getAllValue();
      var arrows = []; // Format: [{source: value, target: value},...]

      for (var singleColumn of columns) {
        arrows.push({
          source: singleColumn.sourceLink,
          target: singleColumn.targetLink,
        });
      }

      if (arrows.length > 0) {
        for (var singleArrow of arrows) {
          var from = document.querySelectorAll(
            `[data-id='${singleArrow.source}']`
          )[0];
          var to = document.querySelectorAll(
            `[data-id='${singleArrow.target}']`
          )[0];

          if (from != null && to != null) {
            this.arrows.push(new LeaderLine(from, to));
            from = null;
            to = null;
          }
        }
      }

      console.groupEnd();
    },

    // TODO: remove after split
    updateHeight() {
      var clearMyInterval = (param = this.updateHeightIntervall) =>
        clearInterval(param);

      this.updateHeightIntervall = setInterval(function () {
        var treesToHandle = document.getElementsByClassName(
          "vue-treeselect__menu"
        );
        for (var item of treesToHandle) {
          if (item.style["max-height"]) {
            item.style.removeProperty("max-height");
            clearMyInterval();
          }
        }
      }, 100);
    },

    // Helper
    cleanSuffix(input) /**OK */ {
      return input.replace("_source", "").replace("_target", "");
    },

    showSecondStep() /**OK */ {
      // if (this.dropdownExportFormatItem > 0) {
      //   this.openCloseSecondStepView = "open";
      // }

      this.openCloseSecondStepView =
        this.dropdownExportFormatItem > 0 ? "open" : "close";
    },
  },

  computed: {
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
  // async mounted() /* TODO: remove after split */ {
  // console.log("mount");
  // console.log("def tree");
  // this.tree = {
  //   value: { source: [], target: [] },
  //   options: {
  //     source: [
  //       { label: "leaf alternate placement", id: 1 },
  //       { label: "perianth color", id: 6 },
  //       { label: "fruit pilosity", id: 5 },
  //       { label: "whole plant lifestyle", id: 2 },
  //       { label: "leaf morphology", id: 3 },
  //       { label: "stamen morphology", id: 4 },
  //     ],
  //     target: [
  //       { label: "life cycle habit", id: 8 },
  //       { label: "fruit hairiness", id: 11 },
  //       { label: "phyllotaxy", id: 7 },
  //       { label: "microsporophyll morphlogy trait", id: 10 },
  //       { label: "tepal color", id: 12 },
  //       { label: "leaf morphology trait", id: 9 },
  //     ],
  //   },
  //   reloadKey: { source: 0, target: 0 }, // reload index for VUE reloads
  //   skos_flag: { source: false, target: false }, // we need to modify queries if it's a skos notation
  // };
  // function callback() {
  //   console.log("TEST");
  //   var allDivs = document.getElementsByTagName("*");
  //   var source = [1, 2, 3, 4, 5, 6];
  //   var target = [7, 8, 9, 10, 11, 12];
  //   for (var left in source) {
  //     var from = null,
  //       to = null;
  //     for (var singleDiv of allDivs) {
  //       console.log("left", source[left]);
  //       if (singleDiv.getAttribute("data-id") == source[left]) {
  //         from = singleDiv;
  //       } else if (singleDiv.getAttribute("data-id") == target[left]) {
  //         to = singleDiv;
  //       }
  //       if (from != null && to != null) {
  //         new LeaderLine(from, to);
  //         from = null;
  //         to = null;
  //         break;
  //       }
  //     }
  //   }
  // }
  // console.log("setTimeout");
  // setTimeout(function () {
  //   console.log("Callback Funktion wird aufgerufen");
  //   callback(this.tree);
  // }, 2000);
  // },

  watch: {
    queueCount: {
      handler(newValue) {
        if (newValue === 0) {
          this.resetArrows();
        }
      },
      deep: false,
    },
  },
};
</script>

<style scoped>
.second-step {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 80%;
  height: auto;
  min-height: 20%;
  background: ivory;

  /* align-items: center;
  justify-content: center; */
}
</style>
