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
</script>

<script>
export default {
  name: "TheMappingtable",
  props: ["externalMappingTable"],
  emit: [],
  data() {
    return {
      openCloseTableView: true, // false: closed, true: open

      mappingtable: [],
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
  methods: {
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

      for (var idxSource in this.mappingtable) {
        // console.log("idxSource", idxSource);
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

      // console.log("currentState", currentState);

      if (currentState.length == 0) {
        window.mappingDataTable.load([[]]);
        window.mappingDataTable.removeRow(0);
      } else {
        window.mappingDataTable.load(currentState);
      }

      // console.groupEnd();
    },

    loadCSV(data) {
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

      var mappingtableRows = data.split("\n");
      mappingtableRows.pop();
      // console.log("mappingtableRows", mappingtableRows);
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
      this.refreshMappingtableUI();
    },

    loadRDF(data) {
      console.log("load RDF");
    },
  },

  async mounted() {
    console.log("mount mappingtable");

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
    externalMappingTable: {
      handler(newData) {
        if (newData.fileExtension == "csv") {
          this.loadCSV(newData.result);
        } else if (
          newData.fileExtension === "rdf" ||
          newData.fileExtension === "xml" ||
          newData.fileExtension === "ttl" ||
          newData.fileExtension === "sssom"
        ) {
          this.loadRDF(newData.result);
        } else {
          // TODO: create a warning message
        }
      },
      deep: true,
    },
  },
};
</script>
