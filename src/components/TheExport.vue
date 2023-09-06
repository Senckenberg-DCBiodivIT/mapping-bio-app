<template>
  <form class="box">
    <p class="title is-6 has-text-right">V {{ versionMapper }}</p>
    <div class="field">
      <label class="label">Author</label>
      <div class="control">
        <input class="input" type="text" v-model="author" />
      </div>
    </div>
    <div class="field">
      <label class="label">Mapping set title</label>
      <div class="control">
        <input class="input" type="text" v-model="mappingSetTitle" />
      </div>
    </div>

    <div class="field">
      <label class="label">Comment</label>
      <div class="control">
        <textarea class="textarea" rows="2" v-model="comment" />
      </div>
    </div>

    <div class="field">
      <label class="label">License</label>
      <div class="control">
        <input class="input" type="text" v-model="license" />
      </div>
    </div>

    <div class="columns">
      <div class="column has-text-centered">
        <o-button variant="warning" @click="$emit('openClose', 'close')"
          >Cancel</o-button
        >
      </div>
      <div class="column has-text-centered">
        <o-button variant="primary" @click="exportMapping">Download</o-button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { mapMutations, mapGetters } from "vuex";
</script>

<script>
export default {
  name: "TheExport",
  props: ["fileExtension"],
  emits: ["openClose"],

  data() {
    return {
      versionMapper: process.env.VUE_APP_VERSION,
      author: "",
      mappingSetTitle: "",
      comment: "",
      license: "",
    };
  },

  computed: {
    ...mapGetters({ getMappingtable: "mappingtable/getMappingtable" }),
  },

  methods: {
    ...mapMutations({}),

    downloadMappingExport(txtContent, fileExtension) /**OK */ {
      var exportElement = document.createElement("a");
      exportElement.href =
        "data:text/csv;charset=utf-8," + encodeURIComponent(txtContent);
      exportElement.target = "_blank";

      exportElement.download = `Mapping_Table.${fileExtension}`;
      exportElement.click();
    },

    exportMapping() /**OK */ {
      if (this.fileExtension === "csv") {
        this.exportCSV();
      } else if (this.fileExtension == "sssom") {
        this.exportSSSOM();
      } else this.exportRDF(this.fileExtension);
    },
    /*
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
    },*/

    exportCSV() /**OK */ {
      var currentState = [];
      for (var idxSource in this.getMappingtable) {
        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          currentState.push([
            this.getMappingtable[idxSource][idxTarget]["relation"],
            this.getMappingtable[idxSource][idxTarget]["sourceTitle"],
            idxSource,
            this.getMappingtable[idxSource][idxTarget]["targetTitle"],
            idxTarget,
            this.getMappingtable[idxSource][idxTarget]["comment"],
          ]);
        }
      }
      var csv = "";

      currentState.forEach(function (row) {
        csv += row.join(",");
        csv += "\n";
      });

      this.downloadMappingExport(csv, "csv");
    },

    /*
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
    },*/
  },
};
</script>
