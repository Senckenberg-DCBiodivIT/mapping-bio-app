<template>
  <section class="box">
    <o-collapse
      :open="true"
      aria-id="mappingTableUI_ID"
      @open="openCloseTableView = true"
      @close="openCloseTableView = false"
    >
      <template #trigger>
        <div class="has-text-centered">
          <div
            class="has-text-centered"
            style="margin-top: 1em; font-size: 2em"
          >
            Mapping Editor&nbsp;<o-button
              variant="primary"
              aria-controls="mappingTableUI_ID"
              iconPack="fa"
              :iconLeft="openCloseTableView ? 'arrow-up' : 'arrow-down'"
            >
            </o-button>
          </div>
        </div>
        <br />
      </template>
      <div class="notification">
        <div class="columns">
          <div class="column is-one" />
          <div class="column is-10"><table id="mapppingtable" /></div>
          <div class="column is-one" />
        </div>
      </div>
    </o-collapse>
  </section>
</template>

<script setup>
// Mapping table
import AppendGrid from "jquery.appendgrid";

// Store
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

// RDF
import rdfParser from "rdf-parse";

// Quadstore & Co
import { Engine } from "quadstore-comunica";
import { storeStream } from "rdf-store-stream";
import { query } from "@/components/query";
</script>

<script>
export default {
  name: "TheMappingtable",
  props: [""],
  emit: [""],
  data() {
    return {
      query: query, // external stored queries for a better readability

      openCloseTableView: true, // false: closed, true: open

      rdfObj_engines_mapping: {},

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
          name: "confidence",
          display: "confidence (sssom)",
          type: "text",
        },

        {
          name: "review",
          display: "Review (sssom)",
          type: "checkbox",
          cellClass: "has-text-centered",
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
    };
  },
  computed: {
    ...mapGetters({
      // file: { fileText: "", fileExtension: "" }
      getFile: "mappingtable/getFile",
      getMappingtable: "mappingtable/getMappingtable",
      // updateMaping: "mappingtable/updateMaping",
    }),
  },
  methods: {
    ...mapMutations({ setMappingtable: "mappingtable/setMappingtable" }),

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
      // console.log("this.mappingtable", this.mappingtable);

      for (var idxSource in this.getMappingtable) {
        // console.log("idxSource", idxSource);
        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          currentState.push({
            relation: this.getMappingtable[idxSource][idxTarget]["relation"]
              .replaceAll("(", "")
              .replaceAll(")", ""),
            sourceTitle:
              this.getMappingtable[idxSource][idxTarget]["sourceTitle"],
            sourceLink: idxSource,
            targetTitle:
              this.getMappingtable[idxSource][idxTarget]["targetTitle"],
            targetLink: idxTarget,
            comment: this.getMappingtable[idxSource][idxTarget]["comment"],
          });
        }
      }

      // console.log("currentState", currentState);

      if (currentState.length == 0) {
        window.mappingDataTable.load([[]]);
        window.mappingDataTable.removeRow(0);
      } else {
        window.mappingDataTable.load(currentState);
      }

      // console.groupEnd();
    },

    updateMapping(id, param) /* TODO */ {
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

      // TODO: rewrite => Update the tree view
      // this.showArrowFromMappingtable(id + 1); // This function works with internal table-widget index. Table counts from 1 to n

      console.groupEnd();
    },

    loadCSV(data) {
      // console.group("Load CSV mapping table");

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
      var mappingtable = [];
      var mappingtableRows = data.split("\n");
      mappingtableRows.pop();
      // console.log("mappingtableRows", mappingtableRows);
      for (var cell of mappingtableRows) {
        var cellInRow = cell.split(",");
        if (mappingtable[cellInRow[2]] == undefined) {
          mappingtable[cellInRow[2]] = {};
        }
        mappingtable[cellInRow[2]][cellInRow[4]] = {
          sourceTitle: cellInRow[1],
          targetTitle: cellInRow[3],
          relation: cellInRow[0],
          comment: cellInRow[5],
        };
      }
      this.setMappingtable(mappingtable);
      // this.refreshMappingtableUI();

      // console.groupEnd();
    },

    async loadRDF(data) {
      console.log("Load RDF (XML, TTL or SSSOM) mapping table");

      var mimeType = "";
      var mappingtable = [];

      if (data.fileExtension == "ttl" || data.fileExtension == "sssom") {
        // TODO: take care about sssom
        mimeType = "text/turtle";
      }
      // RDF/XML
      else if (data.fileExtension == "rdf" || data.fileExtension == "xml") {
        mimeType = "application/rdf+xml";
      }

      console.log("mimeType", mimeType);

      // Reader definition
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ontologyStream = require("streamify-string")(data.fileText);

      const quadStream = rdfParser.parse(ontologyStream, {
        contentType: mimeType,
        baseIRI: "http://example.org",
      });

      const store = await storeStream(quadStream);
      this.rdfObj_engines_mapping = new Engine(store);

      var bindingsStream = await this.rdfObj_engines_mapping.queryBindings(
        this.query.testQuery
      );
      // ].queryBindings(this.query.mappingRow);

      bindingsStream.on("data", (bindings) => {
        // console.log("bindings", bindings);
        // console.log(
        //   "bindings.entries.hashmap.node",
        //   bindings.entries.hashmap.node
        // );

        if (
          mappingtable[bindings.entries.hashmap.node.children[0].value.value] ==
          undefined
        ) {
          mappingtable[bindings.entries.hashmap.node.children[0].value.value] =
            {};
        }
        mappingtable[bindings.entries.hashmap.node.children[0].value.value][
          bindings.entries.hashmap.node.children[1].value.value
        ] = {
          sourceTitle: "Enter a title for the CSV export here",
          targetTitle: "Enter a title for the CSV export here",
          relation: bindings.entries.hashmap.node.children[2].value.value,
          comment: "Enter a comment for the CSV export here",
        };
      });

      bindingsStream.on("end", () => {
        console.log("mappingtable", mappingtable);

        this.setMappingtable(mappingtable);
        // this.refreshMappingtableUI();
      });
    },
  },

  async mounted() {
    // console.log("mount mappingtable");

    window.mappingDataTable = new AppendGrid({
      element: document.getElementById("mapppingtable"),
      initRows: 0,
      uiFramework: "bulma",
      iconFramework: "default",
      hideButtons: {
        // Hide some buttons on each row
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
  },

  watch: {
    getFile: {
      handler(newData) {
        if (newData.fileExtension === "csv") {
          this.loadCSV(newData.fileText);
        } else if (
          newData.fileExtension === "rdf" ||
          newData.fileExtension === "xml" ||
          newData.fileExtension === "ttl" ||
          newData.fileExtension === "sssom"
        ) {
          this.loadRDF(newData);
        } else {
          // TODO: create a warning message
        }
      },
      deep: true,
    },
    getMappingtable: {
      handler(newData) {
        console.log("Watcher getMappingtable");
        this.refreshMappingtableUI();
      },
      deep: true,
    },
  },
};
</script>
