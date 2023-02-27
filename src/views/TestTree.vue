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
                <span class="file-label">Choose a mapping file...</span>
              </span>
              <span class="file-name" v-if="hasMappingFileName"
                >{{ mappingtableFilename }}
              </span>
            </label>
          </div>
        </div>
        <div class="column is-3">
          <o-button
            :label="'Export CSV'"
            @click="exportCSV"
            :variant="'primary'"
          />
        </div>
        <div class="column is-3">
          <o-button
            :label="'Export RDF/XML'"
            @click="exportRDF"
            :variant="'primary'"
          />
        </div>
        <div class="column is-3">
          <o-button
            :label="'(In progress) Export TTL'"
            @click="exportTTL"
            :variant="'warning'"
          />
        </div>
      </div>

      <hr />
    </o-collapse>
  </section>
  <br /><br />

  <!-- Debug -->
  <!-- metadataFromQuad: {{ metadataFromQuad }}  -->
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
            <span class="file-label">Choose a RDF/XML or TTL file…</span>
          </span>
          <span class="file-name" v-if="hasSourceFileName"
            >{{ sourceFilename }}
          </span>
        </label>
      </div>

      <treeselect
        v-model="tree.value.source"
        :multiple="true"
        :options="tree.options.source"
        :alwaysOpen="true"
        :open-direction="'below'"
        :load-options="loadOntologyChild"
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
            <span class="file-label">Choose a RDF/XML or TTL file…</span>
          </span>
          <span class="file-name" v-if="hasTargetFileName"
            >{{ targetFilename }}
          </span>
        </label>
      </div>
      <treeselect
        v-model="tree.value.target"
        :multiple="true"
        :options="tree.options.target"
        :alwaysOpen="true"
        :open-direction="'bottom'"
        :load-options="loadOntologyChild"
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

// Quadstore & Co
import { Engine } from "quadstore-comunica";
import { storeStream } from "rdf-store-stream";
import { query } from "@/components/query";

// Export RDF
import { RdfXmlParser } from "rdfxml-streaming-parser";

export default {
  name: "Editor-Main",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      testQuad: [],

      openCloseTableView: true, // false: closed, true: open

      mappingDataTableConfig: [
        {
          name: "relation",
          display: "Relation",
          type: "select",
          ctrlOptions: ["", "=", "<", ">"],
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

      tree: {
        value: { source: [], target: [] },
        options: { source: [], target: [] },
      },

      rdfObj: {
        engines: { source: {}, target: {}, mapping: {} },
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
        "skos:closeMatch": { rdf: 0.65, csv: "" },
        "skos:exactMatch": { rdf: 1, csv: "(=)" },
        "skos:broadMatch": { rdf: 0.75, csv: ">" },
        "skos:narrowMatch": { rdf: 0.65, csv: "<" },
        "skos:relatedMatch": { rdf: 0.5, csv: "" },
      },
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

    exportCSV() /*(OK)*/ {
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

    exportRDF() {
      console.group("exportRDF");
      var currentState = "";
      const myParser = new RdfXmlParser();

      var baseIRI = "http://example.org";

      myParser
        .on("data", console.log)

        .on("error", console.error);
      // .on("end", () => console.log("All triples were parsed!", myParser));

      currentState += `<?xml version='1.0' encoding='utf-8' standalone='no'?>
      `;
      myParser.write(`<?xml version='1.0' encoding='utf-8' standalone='no'?>`);

      currentState += `<rdf:RDF xmlns='http://knowledgeweb.semanticweb.org/heterogeneity/alignment#'
            xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
            xmlns:xsd='http://www.w3.org/2001/XMLSchema#'
            xmlns:align='http://knowledgeweb.semanticweb.org/heterogeneity/alignment#'>`;
      myParser.write(`<rdf:RDF xmlns='http://knowledgeweb.semanticweb.org/heterogeneity/alignment#'
         xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'
         xmlns:xsd='http://www.w3.org/2001/XMLSchema#'
         xmlns:align='http://knowledgeweb.semanticweb.org/heterogeneity/alignment#'>`);

      currentState += `<Alignment>
           <xml>yes</xml>
           <level>0</level>
           <type>**</type>`;
      myParser.write(`<Alignment>
        <xml>yes</xml>
        <level>0</level>
        <type>**</type>`);

      currentState += `<onto1>
           <Ontology rdf:about="null">
             <location>null</location>
           </Ontology>
         </onto1>`;
      myParser.write(`<onto1>
        <Ontology rdf:about="${baseIRI}">
          <location>null</location>
        </Ontology>
      </onto1>`);

      currentState += `<onto2>
           <Ontology rdf:about="null">
             <location>null</location>
           </Ontology>
         </onto2>`;
      myParser.write(`<onto2>
        <Ontology rdf:about="${baseIRI}">
          <location>null</location>
        </Ontology>
      </onto2>`);

      for (var idxSource in this.mappingtable) {
        for (var idxTarget of Object.keys(this.mappingtable[idxSource])) {
          currentState += `<map>
            <Cell>
              <entity1 rdf:resource='${idxSource}'/>
              <entity2 rdf:resource='${idxTarget}'/>
              <relation>${this.mappingtable[idxSource][idxTarget]["relation"]
                .replace("<", "&lt;")
                .replace(">", "&gt;")}</relation>
              <measure rdf:datatype='http://www.w3.org/2001/XMLSchema#float'>1.0</measure>
            </Cell>
          </map>`;

          console.log("loop write");
          myParser.write(`<map>
            <Cell>
              <entity1 rdf:resource='${idxSource}'/>
              <entity2 rdf:resource='${idxTarget}'/>
              <relation>${this.mappingtable[idxSource][idxTarget]["relation"]
                .replace("<", "&lt;")
                .replace(">", "&gt;")}</relation>
              <measure rdf:datatype='http://www.w3.org/2001/XMLSchema#float'>1.0</measure>
            </Cell>
          </map>`);
        }
      }

      currentState += `</Alignment>`;
      myParser.write(`</Alignment>`);

      currentState += `</rdf:RDF>`;
      myParser.write(`</rdf:RDF>`);

      myParser.end();

      this.downloadMappingExport(currentState, "rdf");

      console.groupEnd();
    },

    exportTTL() {
      console.group("exportTTL");
      //

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ttl_write = require("@graphy/content.ttl.write");

      let ds_writer = ttl_write({
        prefixes: {
          dbr: "http://dbpedia.org/resource/",
          ex: "http://ex.org/",
        },
      });

      ds_writer.on("data", (s_turtle) => {
        console.log(s_turtle + "");
      });

      ds_writer.write({
        type: "c3",
        value: {
          "dbr:Banana": {
            "ex:lastSeen": new Date(),
          },
        },
      });

      console.groupEnd();
    },

    loadOntology(event, position) /**/ {
      console.group("loadOntology", position);

      // reset the widget
      this.tree.value[position] = [];
      this.tree.options[position] = [];

      // Load a local file
      var file = event.target.files[0];
      let fileExtension = event.target.files[0].name
        .split(".")
        .slice(-1)[0]
        .toLowerCase();

      var reader = new FileReader();
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
        that.rdfObj.engines[position] = new Engine(store);

        // First level visualisation
        var bindingsStream = await that.rdfObj.engines[position].queryBindings(
          that.query.firstLevelClass
        );

        bindingsStream.on("data", (bindings) => {
          const id =
            bindings.entries.hashmap.node.children[0].value.id.replaceAll(
              '"',
              ""
            ) + `_${position}`;
          that.tree.options[position].push({
            id: id,
            label:
              bindings.entries.hashmap.node.children[1].value.id.replaceAll(
                '"',
                ""
              ),
            children: null,
            position: position, // for the sparql engine
          });
        });
        bindingsStream.on("end", () => {
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
        mimeType = "application/rdf+xml";
        reader.readAsText(file);
      }
      // ERROR
      else {
        // TODO: ERROR
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

      var query = this.query.subclassOf.replaceAll("ID_HERE", id);

      var bindingsStream = await this.rdfObj.engines[position].queryBindings(
        query
      );

      bindingsStream.on("data", (bindings) => {
        console.log("bindings", bindings);
        const childID =
          bindings.entries.hashmap.node.children[1].value.id.replaceAll(
            '"',
            ""
          ) + `_${position}`;
        tempChild.push({
          id: childID,
          label: bindings.entries.hashmap.node.children[0].value.id.replaceAll(
            '"',
            ""
          ),
          children: null,
          position: position, // for the sparql engine
        });
      });

      bindingsStream.on("end", () => {
        console.log("tempChild", tempChild[0]);
        parentNode.children = tempChild;
        param.callback();
      });

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
      console.group("selectValue");

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

      console.groupEnd();
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
      console.group("refreshMappingtableUI");
      var currentState = [];
      for (var idxSource in this.mappingtable) {
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
      this.resetArrows();
      console.groupEnd();
    },

    resetArrows() /* TODO: Fix reactivity*/ {
      console.group("resetArrows");
      this.tree.value.source = [];
      this.tree.value.target = [];
      this.selectValue();
      console.groupEnd();
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
      uiFramework: "bulma",
      iconFramework: "default",
      columns: this.mappingDataTableConfig,
      sectionClasses: {
        table: "is-narrow is-fullwidth",
      },
      afterRowAppended: () => {
        this.selectValue();
      },
      afterRowInserted: () => {
        this.selectValue();
      },
      afterRowRemoved: () => {
        this.selectValue();
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

  watch: /*OK*/ {
    treealueLeft: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },

    treeValuetarget: {
      handler() {
        this.selectValue();
      },
      deep: true,
    },
  },
};
</script>
