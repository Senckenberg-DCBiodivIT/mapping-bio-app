<template>
  <TheMessenger />

  <!-- mappping table, CSV, RDF projection -->
  <TheMappingtable
    :externalMappingTable="mappingfile"
    @ackNewMapping="newMappingRow = []"
  />

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
              >{{ sourceFilename }}
            </span>
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
          :default-expand-level="100"
        />
        <!-- :load-options="loadOntologyChild" -->
        <!-- :default-expand-level="1" -->
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
          :default-expand-level="100"
        />
        <!-- :load-options="loadOntologyChild" -->
        <!-- :default-expand-level="2" -->
      </div>
    </div>
  </div>

  <div class="second-step" v-if="openCloseSecondStepView">
    <form class="box">
      <p class="title is-6 has-text-right">
        V {{ secondStepData.versionMapper }}
      </p>
      <div class="field">
        <label class="label">Author</label>
        <div class="control">
          <input class="input" type="text" v-model="secondStepData.author" />
        </div>
      </div>
      <div class="field">
        <label class="label">Mapping set title</label>
        <div class="control">
          <input
            class="input"
            type="text"
            v-model="secondStepData.mappingSetTitle"
          />
        </div>
      </div>

      <div class="field">
        <label class="label">Comment</label>
        <div class="control">
          <textarea
            class="textarea"
            rows="2"
            v-model="secondStepData.comment"
          />
        </div>
      </div>

      <div class="field">
        <label class="label">License</label>
        <div class="control">
          <input class="input" type="text" v-model="secondStepData.license" />
        </div>
      </div>

      <div class="columns">
        <div class="column has-text-centered">
          <o-button variant="warning" @click="openCloseSecondStepView = false"
            >Cancel</o-button
          >
        </div>
        <div class="column has-text-centered">
          <o-button variant="primary" @click="exportMapping">Download</o-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// Own components
import TheMessenger from "@/components/TheMessenger";
import TheMappingtable from "@/components/TheMappingtable";

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
import rdf from "@rdfjs/data-model";

// Quadstore & Co
import { Engine } from "quadstore-comunica";
import { storeStream } from "rdf-store-stream";
import { query } from "@/components/query";

// Export RDF
import { Readable } from "readable-stream";

import prefixes from "@zazuko/rdf-vocabularies/prefixes";

import {
  turtle,
  rdfXml,
  jsonld,
} from "@rdfjs-elements/formats-pretty/serializers";

import getStream from "get-stream";
</script>

<script>
export default {
  name: "Home-SGN",
  // mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      test: { queueCount: 0 },
      intervalPerformance: false,

      message: [], //Format: ["text", "kind"]

      // TODO: remove after split
      openCloseSecondStepView: false, // false: closed, true: open

      mappingtable: [],
      mappingfile: {}, //  {result, fileExtension}
      newMappingRow: [],

      sourceFilename: "",
      targetFilename: "",

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

      dropdownSelectedItem: 0,
      dropdownItems: [
        // "skos:mappingRelation",
        "skos:closeMatch",
        "skos:exactMatch",
        "skos:broadMatch",
        "skos:narrowMatch",
        "skos:relatedMatch",
      ],
      dropdownItemsMatching: {
        // TODO: ask Claus about...
        // "skos:mappingRelation",
        "skos:closeMatch": { csv: "skos:closeMatch" },
        "skos:exactMatch": { csv: "skos:exactMatch" },
        "skos:broadMatch": { csv: "skos:broadMatch" },
        "skos:narrowMatch": { csv: "skos:narrowMatch" },
        "skos:relatedMatch": { csv: "skos:relatedMatch" },
      },

      dropdownExportFormat: [
        "Export",
        "CSV",
        "RDF/XML",
        "RDF/TTL",
        "RDF/JSON-LD (tbc)",
        "SSSOM (TTL)",
      ],
      dropdownExtension: ["", "csv", "rdf", "ttl", "json", "sssom"],
      dropdownExportFormatItem: 0,

      secondStepData: {
        versionMapper: process.env.VUE_APP_VERSION,
        author: "",
        mappingSetTitle: "",
        comment: "",
        license: "",
      },
    };
  },

  methods: {
    ...mapMutations({ newMessage: "messenger/newMessage" }),

    // Exports
    downloadMappingExport(txtContent, fileExtension) {
      var exportElement = document.createElement("a");
      exportElement.href =
        "data:text/csv;charset=utf-8," + encodeURIComponent(txtContent);
      exportElement.target = "_blank";

      exportElement.download = `Mapping_Table.${fileExtension}`;
      exportElement.click();
    },

    exportMapping() {
      console.group("exportMapping");

      if (this.dropdownExportFormatItem > 0) {
        if (this.dropdownExportFormatItem == 1) {
          this.exportCSV();
        } else if (this.dropdownExportFormatItem == 5) {
          this.exportSSSOM();
        } else
          this.exportRDF(this.dropdownExtension[this.dropdownExportFormatItem]);
      }
      console.groupEnd();
    },

    async exportSSSOM() {
      // Export SSSOM here as a json-ld for Cordra and other purposes
      console.group("exportSSSOM");

      var input = [];
      var mappingSet = [];
      var singleMappings = [];
      var singleMappingsIDs = [];

      // Clean data
      for (var idxSource in this.mappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          // Create mapping node
          input.push(
            rdf.quad(
              rdf.namedNode(clean_idxSource),
              rdf.namedNode(
                this.mappingtable[idxSource][idxTarget]["relation"]
              ),
              rdf.namedNode(clean_idxTarget)
            )
          );

          // Discribe mapping
          let singleMappingsID = `${clean_idxSource}_${clean_idxTarget}`;
          singleMappingsIDs.push(singleMappingsID);

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("rdf:type"),
              rdf.namedNode("owl:Axiom")
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:comment"),
              rdf.literal(this.mappingtable[idxSource][idxTarget]["comment"])
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:confidence"),
              rdf.literal("empty here") // TODO: link data here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(`${clean_idxSource}_${clean_idxTarget}`),
              rdf.namedNode("sssom:last_updated"),
              rdf.literal(new Date().toUTCString())
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:mapping_cardinality"),
              rdf.literal("empty here") // TODO: check and put here (1:1 or 1:n. Any other comopsition is not available)
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:mapping_date"),
              rdf.literal("empty here") // TODO: Use the creation date here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:mappings"),
              rdf.literal(`[${clean_idxSource}, ${clean_idxTarget}`)
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:object_id"),
              rdf.literal(clean_idxTarget)
            )
          );
          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:object_label"),
              rdf.literal("Put label here") // TODO: Put label here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:predicate_id"),
              rdf.literal(this.mappingtable[idxSource][idxTarget]["relation"])
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:subject_id"),
              rdf.literal(clean_idxSource)
            )
          );
          singleMappings.push(
            rdf.quad(
              rdf.blankNode(singleMappingsID),
              rdf.namedNode("sssom:subject_label"),
              rdf.literal("Put label here") // TODO: Put label here
            )
          );
        }
      }

      // Create mapping set here
      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("rdf:type"),
          rdf.literal("sssom:MappingSet")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:author_label"),
          rdf.literal(this.secondStepData.author)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_tool"),
          rdf.literal("mapping.bio")
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_tool_version"),
          rdf.literal(this.secondStepData.versionMapper)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_provider"),
          rdf.literal("https://mapping.bio")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:comment"),
          rdf.literal(this.secondStepData.comment)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:imports"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:last_updated"),
          rdf.literal(new Date().toUTCString())
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:license"),
          rdf.literal(this.secondStepData.license)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_date"),
          rdf.literal(new Date().toUTCString()) // TODO: Use the creation date here, if there is an available
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_registry_description"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_registry_id"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_registry_title"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_set_id"),
          rdf.literal("") // TODO: a bigger part to do. Use the old one if available
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_set_source"),
          rdf.literal("") // TODO: open discussion
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_set_title"),
          rdf.literal(this.secondStepData.mappingSetTitle)
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.blankNode("MappingSet"),
          rdf.namedNode("sssom:mapping_set_version"),
          rdf.literal("") // TODO: Format?
        )
      );

      // include single mappings
      for (var item of singleMappingsIDs) {
        mappingSet.push(
          rdf.quad(
            rdf.blankNode("MappingSet"),
            rdf.namedNode("sssom:mappings"),
            rdf.blankNode(item)
          )
        );
      }

      const { schema, dcterms, foaf, rdfs, skos, owl } = prefixes;
      const sssom = "https://w3id.org/sssom/";

      var runExportFlag = true;

      var sink = await turtle({
        // var sink = await rdfXml({
        // var sink = await jsonld({
        prefixes: {
          schema,
          dcterms,
          foaf,
          rdfs,
          skos,
          owl,
          sssom,
        },
      });
      // console.log("sink", sink);

      if (runExportFlag) {
        var exportArray = input.concat(mappingSet).concat(singleMappings);
        console.log("exportArray", exportArray);

        console.log("Try to create a stream with sink");
        const stream = await sink.import(Readable.from(exportArray));

        let content = await getStream(stream);
        console.log("Content created", content);
        this.downloadMappingExport(content, "sssom"); // TODO: set json later
      }

      console.groupEnd();
    },

    exportCSV() {
      console.group("exportCSV");

      var currentState = [];
      for (var idxSource in this.mappingtable) {
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          currentState.push([
            this.mappingtable[idxSource][idxTarget]["relation"],
            this.mappingtable[idxSource][idxTarget]["sourceTitle"],
            idxSource,
            this.mappingtable[idxSource][idxTarget]["targetTitle"],
            idxTarget,
            this.mappingtable[idxSource][idxTarget]["comment"],
          ]);
        }
      }
      var csv = "";

      currentState.forEach(function (row) {
        csv += row.join(",");
        csv += "\n";
      });

      this.downloadMappingExport(csv, "csv");

      console.groupEnd();
    },

    async exportRDF(fileExtension) {
      console.group(`exportRDF as a ${fileExtension}`);

      var input = [];
      var labelReady = []; // To prevent doubling

      for (var idxSource in this.mappingtable) {
        // Clean data
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          // Label source

          // Clean data
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          if (!labelReady.includes(idxSource)) {
            input.push(
              rdf.quad(
                rdf.namedNode("owl:class"),
                rdf.namedNode("id"),
                rdf.literal(`${clean_idxSource}`)
              )
            );
            //   // Create new label
            input.push(
              rdf.quad(
                rdf.namedNode(`${clean_idxSource}`),
                rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
                rdf.literal(
                  this.mappingtable[idxSource][idxTarget]["sourceTitle"]
                )
              )
            );
            labelReady.push(idxSource);
          }
          // // Label Target
          if (!labelReady.includes(idxTarget)) {
            // Check namedNodes
            input.push(
              rdf.quad(
                rdf.namedNode("owl:class"),
                rdf.namedNode("id"),
                rdf.literal(`${clean_idxTarget}`)
              )
            );
            // Create new label
            input.push(
              rdf.quad(
                rdf.namedNode(`${clean_idxTarget}`),
                rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
                rdf.literal(
                  this.mappingtable[idxSource][idxTarget]["targetTitle"]
                )
              )
            );
            labelReady.push(idxTarget);
          }

          // TODO
          // input.push(
          //   rdf.quad(
          //     rdf.namedNode(`${idxSource}`),
          //     rdf.namedNode(
          //       // TODO: check prefix
          //       this.mappingtable[idxSource][idxTarget]["relation"]
          //       // "TEST_123"
          //     ),
          //     rdf.namedNode(`${idxTarget}`)
          //   )
          // );

          // input.push(
          //   rdf.quad(
          //     rdf.namedNode(`${idxSource}`),

          //     rdf.namedNode(`${idxTarget}`),
          //     rdf.literal(
          //       // TODO: check that
          //       "mes:" + '"1.0"^^<http://www.w3.org/2001/XMLSchema#float>'
          //     )
          //   )
          // );
        }
      }
      console.log(input);

      const { schema, dcterms, foaf, rdfs, skos } = prefixes;
      var sink;
      var runExportFlag = false;

      if (fileExtension === "ttl") {
        sink = await turtle({
          prefixes: {
            schema,
            dcterms,
            foaf,
            rdfs,
            skos,
          },
        });

        runExportFlag = true;
      } else if (fileExtension === "rdf") {
        sink = await rdfXml({
          prefixes: {
            schema,
            dcterms,
            foaf,
            rdfs,
            skos,
          },
        });

        runExportFlag = true;
      } else if (fileExtension === "json") {
        console.log("jsonLD");
        console.log("sssom: work in progres");

        // sink = await jsonld({
        //   prefixes: {
        //     schema,
        //     dcterms,
        //     foaf,
        //     rdfs,
        // skos
        //   },
        // });

        runExportFlag = false;
      } else if (fileExtension === "sssom") {
        console.log("sssom: work in progres");
        // sink = await jsonld({
        //   prefixes: {
        //     schema,
        //     dcterms,
        //     foaf,
        //     rdfs,
        // skos
        //   },
        // });

        runExportFlag = false;
      }

      if (runExportFlag) {
        const streamtest = Readable.from(input);
        console.log("stream", streamtest);

        console.log("Try to create a stream with sink");
        const stream = await sink.import(Readable.from(input));

        let content = await getStream(stream);
        console.log("Content created", content);
        this.downloadMappingExport(content, fileExtension);
      }
      console.groupEnd();
    },

    // Load
    loadOntology(event, position) /**/ {
      console.group("loadOntology", position);

      let message = { content: "Loading data", kind: "primary" };
      this.newMessage(message);

      // Reset the widget
      this.resetArrows();

      this.tree.options[position] = []; // Reset Nodes in the tree
      var tree_options = []; // temp structure

      this.rdfObj.engines[position] = []; //

      // Load local files
      for (let file of event.target.files) {
        let fileExtension = file.name.split(".").slice(-1)[0].toLowerCase();

        let reader = new FileReader();
        let mimeType = ""; // "text/turtle" or "application/rdf+xml"

        // Reader definition
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
            //
            let tempBindingsStream = null;

            if (that.tree.skos_flag[position]) {
              tempBindingsStream = await that.rdfObj.engines[position][
                idxEngine
              ].queryBindings(that.query.firstLevelClass_SKOS);
            } else {
              tempBindingsStream = await that.rdfObj.engines[position][
                idxEngine
              ].queryBindings(that.query.firstLevelClass_OWL);
            }
            that.test.queueCount++;

            tempBindingsStream.on("data", (bindings) => {
              // console.log("bindings", bindings);

              // detected class
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
                  that
                    .loadOntologyChild(that.cleanSuffix(id), position)
                    .then((children) => {
                      tree_options.push({
                        id: id,
                        label:
                          bindings.entries.hashmap.node.children[1].value.id.replaceAll(
                            '"',
                            ""
                          ),
                        children: children,
                        position: position, // for the sparql engine (source or engine, left or right) //TODO: do we still need it?
                      });
                    });
                }
              }
            });

            tempBindingsStream.on("error", (error) => console.log(error));

            tempBindingsStream.on("end", () => {
              console.log("tree_options", tree_options);

              that.tree.options[position] = tree_options;
              that.test.queueCount--;

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
          step1_getAllClasses();

          // Step 2 - detect all first level classes ( not a subclass from another one)
          // Chained from step 1

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

    async testFKT() {
      return "ack";
    },

    async loadOntologyChild(id, position) {
      console.group("loadOntologyChild", id);
      var nodeChildren = [];
      var query = "";

      // console.log("id", id);
      // console.log("position", position);

      if (this.tree.skos_flag[position]) {
        query = this.query.subclassOf_SKOS.replaceAll("ID_HERE", id);
      } else {
        query = this.query.subclassOf_OWL.replaceAll("ID_HERE", id);
      }
      // console.log("query", query);

      for (var singleEngine of this.rdfObj.engines[position]) {
        var bindingsStream = await singleEngine.queryBindings(query);

        this.test.queueCount++;

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
            this.loadOntologyChild(
              bindings.entries.hashmap.node.children[1].value.id,
              position
            ).then((children) => {
              nodeChildren.push({
                id: childID,
                label:
                  bindings.entries.hashmap.node.children[0].value.id.replaceAll(
                    '"',
                    ""
                  ),
                children: children,
                position: position, // for the sparql engine
              });
            });
          }
        });
        bindingsStream.on("end", () => {
          console.log("nodeChildren .end", nodeChildren);
          this.test.queueCount--;

          // return nodeChildren; // null if no one child or [children...]
          // return null; //nodeChildren; // null if no one child or [children...]
        });

        return nodeChildren;
      }

      console.groupEnd();
      // return null; // null if no one child or [children...]
    },

    // TODO: Reduce after split
    loadMappingTable(event) {
      /*
          Here you can load a mapping table as a CSV, RDF(XML) or a turtle file
      */
      console.group("loadMappingTable, event:", event);

      let file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      let reader = new FileReader();

      reader.onload = async (e) => {
        this.mappingfile = {
          result: e.target.result,
          fileExtension: fileExtension,
        };

        // CSV
        if (this.mappingtableExtension === "csv") {
          //
        }

        // RDF(XML)
        else if (
          this.mappingtableExtension === "rdf" ||
          this.mappingtableExtension === "xml" ||
          this.mappingtableExtension === "ttl" ||
          this.mappingtableExtension === "sssom"
        ) {
          //
        } else {
          // TODO: Error
        }
      };

      // Read file
      reader.readAsText(file);

      console.groupEnd();
    },

    // Mapping interactions
    addMapping() {
      /*
      Here you add a selected mapping config to the mapping table
  */

      if (
        this.tree.value.source.length > 0 &&
        this.tree.value.target.length > 0
      ) {
        for (var left of this.tree.value.source) {
          for (var right of this.tree.value.target) {
            var sourceTitle = document
              .querySelectorAll(`[data-id='${left}']`)[0]
              .getElementsByTagName("label")[0].innerText;

            var targetTitle = document
              .querySelectorAll(`[data-id='${right}']`)[0]
              .getElementsByTagName("label")[0].innerText;

            if (this.mappingtable[left] == undefined) {
              this.mappingtable[left] = {};
            }

            this.mappingtable[left][right] = {
              sourceTitle: sourceTitle,
              targetTitle: targetTitle,
              relation:
                this.dropdownItemsMatching[
                  this.dropdownItems[this.dropdownSelectedItem]
                ].csv, // TODO: set the selected relation, but current we have different values in CSV and RDF...
              comment: "",
            };
          }
        }
        // this.refreshMappingtableUI();
        this.resetArrows();
      }

      // Warning
      else {
        // TODO: Error here
      }

      console.groupEnd();
    },

    // updateMapping(id, param) {
    //   /*
    //   Here you can update the mapping table data after a change in the UI
    //   like "relation" or "comment"
    //   */

    //   id--; // Table-widget counts from 1 to n

    //   console.group("updateMapping", id, param);

    //   // Get updated value
    //   var updatedValue = window.mappingDataTable.getCtrlValue(param, id);
    //   var mappingtableSourceID = window.mappingDataTable.getCtrlValue(
    //     "sourceLink",
    //     id
    //   );
    //   var mappingtableTargetID = window.mappingDataTable.getCtrlValue(
    //     "targetLink",
    //     id
    //   );

    //   // Set updated value
    //   this.mappingtable[mappingtableSourceID][mappingtableTargetID][param] =
    //     updatedValue;

    //   // Update the tree view
    //   this.showArrowFromMappingtable(id + 1); // This function works with internal table-widget index. Table counts from 1 to n

    //   console.groupEnd();
    // },

    // TODO: remove after split
    refreshMappingtableUI() {
      /*
          Here you can manually refresh the UI state based on the current mapping state like
          - a loaded CSV
          - a loaded RDF with XML notation
          - a changed state after an activity from user
            - create a new
            - or delete a relation between two ontologies
      */

      console.group("refreshMappingtableUI");
      var currentState = [];
      console.log("this.mappingtable", this.mappingtable);

      for (var idxSource in this.mappingtable) {
        console.log("idxSource", idxSource);
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          currentState.push({
            relation: this.mappingtable[idxSource][idxTarget]["relation"]
              .replaceAll("(", "")
              .replaceAll(")", ""),
            sourceTitle: this.mappingtable[idxSource][idxTarget]["sourceTitle"],
            sourceLink: idxSource,
            targetTitle: this.mappingtable[idxSource][idxTarget]["targetTitle"],
            targetLink: idxTarget,
            comment: this.mappingtable[idxSource][idxTarget]["comment"],
          });
        }
      }

      // if (currentState.length == 0) {
      //   currentState.push({
      //     relation: "",
      //     sourceTitle: "",
      //     sourceLink: "",
      //     targetTitle: "",
      //     targetLink: "",
      //     comment: "",
      //   });
      // }
      console.log("currentState", currentState);

      if (currentState.length == 0) {
        window.mappingDataTable.load([[]]);
        window.mappingDataTable.removeRow(0);
      } else {
        window.mappingDataTable.load(currentState);
      }

      console.groupEnd();
    },

    // Tree interactions
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

    updateHeight() {
      var clearMyInterval = (param = this.intervalPerformance) =>
        clearInterval(param);

      this.intervalPerformance = setInterval(function () {
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
    cleanSuffix(input) {
      return input.replace("_source", "").replace("_target", "");
    },

    showSecondStep() {
      console.group("showSecondStep");

      this.openCloseSecondStepView = true;

      console.log("this", this);
      console.log("this.$", this.$);
      console.groupEnd();
    },
  },

  computed: /* TODO: remove after split */ {
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
  async mounted() /* TODO: remove after split */ {
    console.log("mount");
    // window.mappingDataTable = new AppendGrid({
    //   element: document.getElementById("mapppingtableCSV"),
    //   initRows: 0,
    //   uiFramework: "bulma",
    //   iconFramework: "default",
    //   hideButtons: {
    //     // Hide the move up and move down button on each row
    //     moveUp: true,
    //     moveDown: true,
    //     insert: true,
    //     append: true,
    //     removeLast: true,
    //   },
    //   columns: this.mappingDataTableConfig,
    //   sectionClasses: {
    //     table: "is-narrow is-fullwidth",
    //   },
    // });
    // this.refreshMappingtableUI();

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
  },
  watch: {
    test: {
      handler(newValue) {
        if (newValue.queueCount === 0) {
          console.log("newValue", newValue);

          console.log("detected: ", this.rdfObj.classes);

          console.log("that.tree.options", this.tree.options);

          this.resetArrows();
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.second-step {
  position: absolute;
  top: 20%;
  right: 10%;
  width: 80%;
  height: auto;
  min-height: 20%;
  background: ivory;

  /* align-items: center;
  justify-content: center; */
}
</style>
