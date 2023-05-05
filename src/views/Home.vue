<template>
  <!-- TODO: mappingTable as an own component with an store segment? -->
  <div class="has-text-centered" style="margin-top: 1em; font-size: 2em">
    Mapping Editor
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

      <!-- Buttons "Load" ... "Download CSV" -->
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
                  <i class="fas fa-upload"></i>
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
            @update:modelValue="exportMapping"
          >
            <template #trigger="{ active }">
              <o-button variant="primary">
                <span>{{
                  dropdownExportFormat[dropdownExportFormatItem]
                }}</span>

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

      <hr />
    </o-collapse>
  </section>

  <!-- Debug -->
  <!-- this.tree.value: {{ this.tree.value }}<br /><br /> -->
  <!-- this.tree: {{ this.tree }} -->
  <!-- <br />
  <hr /> -->
  <!-- Debug END -->

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
              <i class="fas fa-upload"></i>
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
        :load-options="loadOntologyChild"
      />
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
              <i class="fas fa-upload"></i>
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
        :load-options="loadOntologyChild"
      />
      <!-- :default-expand-level="2" -->
    </div>
  </div>
</template>

<script setup>
// import the component
import Treeselect from "vue3-treeselect";
// import the styles
import "vue3-treeselect/dist/vue3-treeselect.css";

// Arrows
import LeaderLine from "leader-line-new";

// Mapping table
import AppendGrid from "jquery.appendgrid";

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
      testObj: {},
      intervalPerformance: false,

      openCloseTableView: true, // false: closed, true: open

      mappingDataTableConfig: [
        {
          name: "relation",
          display: "Relation",
          type: "select",

          ctrlOptions: [
            "skos:closeMatch",
            "skos:exactMatch",
            "skos:broadMatch",
            "skos:narrowMatch",
            "skos:relatedMatch",
          ],
          events: {
            change: (e, that = this) => {
              that.updateMapping(e.uniqueIndex, "relation");
            },
          },
        },

        {
          name: "sourceTitle",
          display: "Source title",
          type: "readonly",
          events: {
            click: (e, that = this) => {
              that.showArrowFromMappingtable(e.uniqueIndex);
            },
          },
        },
        {
          name: "sourceLink",
          display: "Source link",
          type: "readonly",
          events: {
            click: (e, that = this) => {
              that.showArrowFromMappingtable(e.uniqueIndex);
            },
          },
        },
        {
          name: "targetTitle",
          display: "Target title",
          type: "readonly",
          events: {
            click: (e, that = this) => {
              that.showArrowFromMappingtable(e.uniqueIndex);
            },
          },
        },
        {
          name: "targetLink",
          display: "Target link",
          type: "readonly",
          events: {
            click: (e, that = this) => {
              that.showArrowFromMappingtable(e.uniqueIndex);
            },
          },
        },

        {
          name: "comment",
          display: "Comment",
          type: "text",
          events: {
            click: (e, that = this) => {
              that.showArrowFromMappingtable(e.uniqueIndex);
            },
            change: (e, that = this) => {
              that.updateMapping(e.uniqueIndex, "comment");
            },
          },
        },
      ],

      mappingtableFilename: "",
      mappingtableExtension: "", // csv, rdf/xml or ttl, if available
      mappingtableOrig: "", // Loaded data from the file, if you need to reset

      mappingtable: [], // Definition look at loadMappingTable(). For the UI take mappingtableUI!

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
        "SSSOM (tbc)",
      ],
      dropdownExtension: ["", "csv", "rdf", "ttl", "json", "sssom"],
      dropdownExportFormatItem: 0,
    };
  },

  methods: {
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
        } else
          this.exportRDF(this.dropdownExtension[this.dropdownExportFormatItem]);
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
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          // Label source
          // Check namedNodes
          if (!labelReady.includes(idxSource)) {
            input.push(
              rdf.quad(
                rdf.namedNode("owl:class"),
                rdf.namedNode("id"),
                rdf.literal(`${idxSource}`)
              )
            );
            //   // Create new label
            input.push(
              rdf.quad(
                rdf.namedNode(`${idxSource}`),
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
                rdf.literal(`${idxSource}`)
              )
            );
            // Create new label
            input.push(
              rdf.quad(
                rdf.namedNode(`${idxTarget}`),
                rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
                rdf.literal(
                  this.mappingtable[idxSource][idxTarget]["targetTitle"]
                )
              )
            );
            labelReady.push(idxTarget);
          }
          input.push(
            rdf.quad(
              rdf.namedNode(`${idxSource}`),
              rdf.namedNode(`${idxTarget}`),
              rdf.literal(
                // TODO: check prefix
                "rel:" + this.mappingtable[idxSource][idxTarget]["relation"]
              )
            )
          );

          input.push(
            rdf.quad(
              rdf.namedNode(`${idxSource}`),

              rdf.namedNode(`${idxTarget}`),
              rdf.literal(
                // TODO: check that
                "mes:" + '"1.0"^^<http://www.w3.org/2001/XMLSchema#float>'
              )
            )
          );

          //////
          // input.push(
          //   rdf.quad(
          //     rdf.namedNode("http://example.org/sheldon-cooper"),
          //     rdf.namedNode("http://schema.org/givenName"),
          //     rdf.literal("Sheldon")
          //   )
          // );
          // input.push(
          //   rdf.quad(
          //     rdf.namedNode("http://example.org/sheldon-cooper"),
          //     rdf.namedNode("http://schema.org/familyName"),
          //     rdf.literal("Cooper")
          //   )
          // );
          // input.push(
          //   rdf.quad(
          //     rdf.namedNode("http://example.org/sheldon-cooper"),
          //     rdf.namedNode("http://schema.org/knows"),
          //     rdf.namedNode("http://example.org/amy-farrah-fowler")
          //   )
          // );

          //////
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

          // First level visualisation
          var bindingsStream = null;

          if (this.tree.skos_flag[position]) {
            bindingsStream = await that.rdfObj.engines[position][
              idxEngine
            ].queryBindings(that.query.firstLevelClass_SKOS);
          } else {
            bindingsStream = await that.rdfObj.engines[position][
              idxEngine
            ].queryBindings(that.query.firstLevelClass_OWL);
          }
          bindingsStream.on("data", (bindings) => {
            console.log("bindings", bindings);

            const id =
              bindings.entries.hashmap.node.children[0].value.id.replaceAll(
                '"',
                ""
              ) + `_${position}`;

            var oldEneteryFlag = false;
            // You can use only "@en" labels. On this way "en-US" is valid too

            let labelValid =
              (this.tree.skos_flag[position] &&
                bindings.entries.hashmap.node.children[1].value.id.includes(
                  "@en"
                )) ||
              !this.tree.skos_flag[position];

            if (labelValid) {
              for (var treeItem of tree_options) {
                if (treeItem.id == id) {
                  oldEneteryFlag = true;
                }
              }

              if (!oldEneteryFlag) {
                tree_options.push({
                  id: id,
                  label:
                    bindings.entries.hashmap.node.children[1].value.id.replaceAll(
                      '"',
                      ""
                    ),
                  children: null,
                  position: position, // for the sparql engine (source or engine, left or right)
                });
              }
            }
          });

          bindingsStream.on("error", (error) => console.log(error));

          bindingsStream.on("end", () => {
            console.log("tree_options", tree_options);
            that.tree.options[position] = tree_options;

            var treesToHandle = document.getElementsByClassName(
              "vue-treeselect__menu"
            );
            for (var item of treesToHandle) {
              item.style.removeProperty("max-height");
            }
            console.log("ready");
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

    async loadOntologyChild(param) {
      console.group("loadOntologyChild", param);
      var tempChild = [];

      var id = param.parentNode.id
        .replace("_source", "")
        .replace("_target", "");

      var position = param.parentNode.position;
      var parentNode = param.parentNode;

      var query = "";
      if (this.tree.skos_flag[position]) {
        query = this.query.subclassOf_SKOS.replaceAll("ID_HERE", id);
      } else {
        query = this.query.subclassOf_OWL.replaceAll("ID_HERE", id);
      }

      for (var singleEngine of this.rdfObj.engines[position]) {
        var bindingsStream = await singleEngine.queryBindings(query);

        bindingsStream.on("data", (bindings) => {
          console.log("bindings", bindings);
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
            for (var treeItem of tempChild) {
              if (treeItem.id == id) {
                oldEneteryFlag = true;
              }
            }
          }

          if (!oldEneteryFlag && labelValid) {
            tempChild.push({
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
          // console.log("tempChild", tempChild[0]);
          parentNode.children = tempChild;
          param.callback();
        });
      }

      console.groupEnd();
    },

    loadMappingTable(event) {
      /*
          Here you can load a mapping table as a CSV, RDF(XML) or turtle file
      */
      console.group("loadMappingTable, event:", event);

      let file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      let reader = new FileReader();
      let mimeType = "";

      reader.onload = async (e) => {
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
          mappingtableRows.pop();
          console.log("mappingtableRows", mappingtableRows);

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
          console.log("RDF or TTL selected");

          // Reader definition
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ontologyStream = require("streamify-string")(e.target.result);

          const quadStream = rdfParser.parse(ontologyStream, {
            contentType: mimeType,
            baseIRI: "http://example.org",
          });

          const store = await storeStream(quadStream);
          this.rdfObj.engines["mapping"] = new Engine(store);

          var bindingsStream = await this.rdfObj.engines[
            "mapping"
          ].queryBindings(this.query.mappingRow);

          bindingsStream.on("data", (bindings) => {
            // console.log("bindings", bindings);
            // console.log(
            //   "bindings.entries.hashmap.node",
            //   bindings.entries.hashmap.node
            // );

            if (
              this.mappingtable[
                bindings.entries.hashmap.node.children[0].value.value
              ] == undefined
            ) {
              this.mappingtable[
                bindings.entries.hashmap.node.children[0].value.value
              ] = {};
            }
            this.mappingtable[
              bindings.entries.hashmap.node.children[0].value.value
            ][bindings.entries.hashmap.node.children[1].value.value] = {
              sourceTitle: "Enter a title for the CSV export here",
              targetTitle: "Enter a title for the CSV export here",
              relation: bindings.entries.hashmap.node.children[2].value.value,
              // .replace("&lt;", "<")
              // .replace("&gt;", ">"),
              comment: "Enter a comment for the CSV export here",
            };
          });

          bindingsStream.on("end", (bindings) => {
            console.log("this.mappingtable", this.mappingtable);

            this.mappingtableFilename = file.name;
            this.refreshMappingtableUI();
          });
        }

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
        this.refreshMappingtableUI();
        this.resetArrows();
      }

      // Warning
      else {
        // TODO: Error here
      }

      console.groupEnd();
    },

    updateMapping(id, param) {
      /*
      Here you can update the mapping table data after a change in the UI
      like "relation" or "comment"
      */

      id--; // Table-widget counts from 1 to n

      console.group("updateMapping", id, param);

      // Get updated value
      var updatedValue = window.mappingDataTable.getCtrlValue(param, id);
      var mappingtableSourceID = window.mappingDataTable.getCtrlValue(
        "sourceLink",
        id
      );
      var mappingtableTargetID = window.mappingDataTable.getCtrlValue(
        "targetLink",
        id
      );

      // Set updated value
      this.mappingtable[mappingtableSourceID][mappingtableTargetID][param] =
        updatedValue;

      // Update the tree view
      this.showArrowFromMappingtable(id + 1); // This function works with internal table-widget index. Table counts from 1 to n

      console.groupEnd();
    },

    refreshMappingtableUI() {
      /*
          Here you can manually refresh the UI state based on the current mapping state like
          - a loaded CSV
          - a loaded RDF with XML notation
          - a changed state after an activity from user
            - create a new
            - or delete a relation between two ontologies
      */

      // console.group("refreshMappingtableUI");
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
      window.mappingDataTable.load(currentState);

      // console.groupEnd();
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
  async mounted() /* OK */ {
    window.mappingDataTable = new AppendGrid({
      element: document.getElementById("mapppingtableCSV"),
      initRows: 0,
      uiFramework: "bulma",
      iconFramework: "default",
      hideButtons: {
        // Hide the move up and move down button on each row
        moveUp: true,
        moveDown: true,
        insert: true,
        append: true,
        removeLast: true,
      },
      columns: this.mappingDataTableConfig,
      sectionClasses: {
        table: "is-narrow is-fullwidth",
      },
    });
    this.refreshMappingtableUI();

    // this.tree = {
    //   value: { source: [1, 2, 3, 4, 5, 6], target: [] },
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
    // };

    // function callback() {
    //   var allDivs = document.getElementsByTagName("*");
    //   for (var left of [1, 2, 3, 4, 5, 6]) {
    //     var from = null,
    //       to = null;
    //     var temp = left + 6;
    //     for (var singleDiv of allDivs) {
    //       console.log("left", left);
    //       if (singleDiv.getAttribute("data-id") == left) {
    //         from = singleDiv;
    //       } else if (singleDiv.getAttribute("data-id") == `${temp}`) {
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

    // setTimeout(function () {
    //   console.log("Callback Funktion wird aufgerufen");
    //   callback(this.tree);
    // }, 2000);
  },
};
</script>
