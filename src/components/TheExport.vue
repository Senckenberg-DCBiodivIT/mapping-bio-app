<!-- Here you go the "export" component with you create 
the exported data and the file output.
You can also enter the author, licence and other informations, if necessary. -->

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

// RDF
import rdf from "@rdfjs/data-model";

// Export RDF
import { Readable } from "readable-stream";

import prefixes from "@zazuko/rdf-vocabularies/prefixes";

import {
  turtle,
  rdfXml,
  jsonld,
} from "@rdfjs-elements/formats-pretty/serializers";

import SerializerJsonld from "@rdfjs/serializer-jsonld-ext";

import getStream from "get-stream";
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
    ...mapMutations({}), // Later maybe we need a error message

    async exportSSSOM() {
      console.group("exportSSSOM");

      var input = [];
      var mappingSet = [];
      var singleMappings = [];
      var singleMappingsIDs = [];

      // Clean data
      for (var idxSource in this.getMappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          // Create mapping node
          input.push(
            rdf.quad(
              rdf.namedNode(clean_idxSource),
              rdf.blankNode(
                this.getMappingtable[idxSource][idxTarget]["relation"]
              ),
              rdf.namedNode(clean_idxTarget)
            )
          );

          // Discribe mapping

          let singleMappingsID = `${clean_idxSource}_${clean_idxTarget}`;
          singleMappingsIDs.push(singleMappingsID);

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("rdf:type"),
              rdf.blankNode("owl:Axiom")
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:comment"),
              rdf.literal(this.getMappingtable[idxSource][idxTarget]["comment"])
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:confidence"),
              rdf.literal("empty here") // TODO: link data here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(`${clean_idxSource}_${clean_idxTarget}`),
              rdf.blankNode("sssom:last_updated"),
              rdf.literal(new Date().toUTCString())
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:mapping_cardinality"),
              rdf.literal("empty here") // TODO: check and put here (1:1 or 1:n. Any other comopsition is not available)
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:mapping_date"),
              rdf.literal("empty here") // TODO: Use the creation date here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:mappings"),
              rdf.literal(`[${clean_idxSource}, ${clean_idxTarget}`)
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:object_id"),
              rdf.literal(clean_idxTarget)
            )
          );
          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:object_label"),
              rdf.literal("Put label here") // TODO: Put label here
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:predicate_id"),
              rdf.literal(
                this.getMappingtable[idxSource][idxTarget]["relation"]
              )
            )
          );

          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:subject_id"),
              rdf.literal(clean_idxSource)
            )
          );
          singleMappings.push(
            rdf.quad(
              rdf.namedNode(singleMappingsID),
              rdf.blankNode("sssom:subject_label"),
              rdf.literal("Put label here") // TODO: Put label here
            )
          );
        }
      }

      // Create mapping set here
      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#type"),
          rdf.namedNode("https://w3id.org/sssom/MappingSet")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:author_label"),
          rdf.literal(this.author)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_tool"),
          rdf.literal("mapping.bio")
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_tool_version"),
          rdf.literal(this.versionMapper)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_provider"),
          rdf.literal("https://mapping.bio")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:comment"),
          rdf.literal(this.comment)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:imports"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:last_updated"),
          rdf.literal(new Date().toUTCString())
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:license"),
          rdf.literal(this.license)
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_date"),
          rdf.literal(new Date().toUTCString()) // TODO: Use the creation date here, if there is an available
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_registry_description"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_registry_id"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_registry_title"),
          rdf.literal("")
        )
      );

      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_set_id"),
          rdf.literal("") // TODO: a bigger part to do. Use the old one if available
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_set_source"),
          rdf.literal("") // TODO: open discussion
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_set_title"),
          rdf.literal(this.mappingSetTitle)
        )
      );
      mappingSet.push(
        rdf.quad(
          rdf.namedNode("MappingSet"),
          rdf.blankNode("sssom:mapping_set_version"),
          rdf.literal("") // TODO: Format?
        )
      );

      // include single mappings
      for (var item of singleMappingsIDs) {
        mappingSet.push(
          rdf.quad(
            rdf.namedNode("MappingSet"),
            rdf.blankNode("sssom:mappings"),
            rdf.blankNode(item)
          )
        );
      }

      const { schema, dcterms, foaf, rdfs, rdf, skos, owl } = prefixes;
      const sssom = "https://w3id.org/sssom/";

      var runExportFlag = true;

      // var sink = await turtle({
      // var sink = await rdfXml({
      // var sink = await jsonld({
      //   prefixes: {
      //     schema,
      //     dcterms,
      //     foaf,
      //     rdfs,
      //     skos,
      //     owl,
      //     sssom,
      //   },
      // });
      // console.log("sink", sink);
      // console.log("prefixes", prefixes);

      if (runExportFlag) {
        var exportArray = input.concat(mappingSet).concat(singleMappings);
        // console.log("exportArray", exportArray);

        let readable = Readable.from(exportArray);

        // console.log("Try to create a stream with sink");
        // const stream = await sink.import(readable);
        // console.log("stream", stream);

        ///////////////////
        const context = {
          schema,
          dcterms,
          foaf,
          rdfs,
          skos,
          owl,
          sssom,
        };

        const serializerJsonld = new SerializerJsonld({
          baseIRI: "http://example.org/",
          context,
          compact: true,
          encoding: "string",
          prettyPrint: true,
        });

        const output = serializerJsonld.import(readable);

        output.on("data", (jsonld) => {
          console.log(jsonld);
          console.log("Content created", jsonld);
          this.downloadMappingExport(jsonld, "sssom");
        });
        ///////////////////////////////

        // let content = await getStream(stream);
        // console.log("Content created", content);
        // this.downloadMappingExport(content, "sssom"); // TODO: set json later
      }

      console.groupEnd();
    },

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

    async exportRDF(fileExtension) {
      console.group(`exportRDF as a ${fileExtension}`);

      // In the following loop this function is used to create new labels AND classes without duplicating them
      /*const setNewClassLabel = (varName) => {
        // varName is "idxSource" or "idxTarget" only 

        const rowElement = eval(varName);
        const cleanElement = this.cleanSuffix(rowElement);
        const title = varName === "idxSource" ? "sourceTitle" : "targetTitle";

        if (!labelReady.includes(rowElement)) {
          // input.push(
          //   rdf.quad(
          //     rdf.namedNode("owl:class"),
          //     rdf.namedNode("rdf:about"),
          //     rdf.literal(`${cleanElement}`)
          //   )
          // );
          //   // Create new label
          input.push(
            rdf.quad(
              rdf.namedNode(`${cleanElement}`),
              rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
              rdf.literal(this.getMappingtable[idxSource][idxTarget][title])
            )
          );
          labelReady.push(rowElement);
        }
      };*/

      var mappingIndex = 2;
      var input = [
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          rdf.namedNode(`http://purl.obolibrary.org/obo/envo.owl#Alignment`)
        ),
        // TODO: Hier nur für XML
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#xml"),
          rdf.literal(`yes`)
        ),
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#level"),
          rdf.literal(`0`)
        ),
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#type"),
          rdf.literal(`??`)
        ),

        // TODO: currently static only
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#onto1"),
          rdf.literal(`http://data.bioontology.org/ontologies/ENVO`)
        ),

        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#onto2"),
          rdf.literal(`http://data.bioontology.org/ontologies/SWEET`)
        ),
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#uri1"),
          rdf.literal(`http://data.bioontology.org/ontologies/ENVO`)
        ),
        rdf.quad(
          rdf.blankNode(`genid1`),
          rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#uri2"),
          rdf.literal(`http://data.bioontology.org/ontologies/SWEET`)
        ),
      ];

      for (var idxSource in this.getMappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          //Map
          input.push(
            rdf.quad(
              rdf.blankNode(`genid1`),
              rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#map"),
              rdf.blankNode(`genid${mappingIndex}`)
            )
          );

          //Cell
          var cell = [
            rdf.quad(
              rdf.blankNode(`genid${mappingIndex}`),
              rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
              rdf.literal(`http://purl.obolibrary.org/obo/envo.owl#Cell`)
            ),
            rdf.quad(
              rdf.blankNode(`genid${mappingIndex}`),
              rdf.namedNode("purl.obolibrary.org/obo/envo.owl#entity1"),
              rdf.literal(`${clean_idxSource}`)
            ),
            rdf.quad(
              rdf.blankNode(`genid${mappingIndex}`),
              rdf.namedNode("purl.obolibrary.org/obo/envo.owl#entity2"),
              rdf.literal(`${clean_idxTarget}`)
            ),
            rdf.quad(
              rdf.blankNode(`genid${mappingIndex}`),
              rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#measure"),
              rdf.literal(`1`)
            ),
            rdf.quad(
              rdf.blankNode(`genid${mappingIndex}`),
              rdf.namedNode("http://purl.obolibrary.org/obo/envo.owl#relation"),
              rdf.literal(
                `${this.getMappingtable[idxSource][idxTarget]["relation"]}`
              )
            ),
          ];

          input = input.concat(cell);

          mappingIndex += 1;
        }
      }

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
            ns0: "http://purl.obolibrary.org/obo/envo.owl#",
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
            ns0: "http://purl.obolibrary.org/obo/envo.owl#",
          },
        });

        runExportFlag = true;
      } else if (fileExtension === "json") {
        console.log("jsonLD");
        console.log("sssom: work in progres");

        sink = await jsonld({
          prefixes: {
            schema,
            dcterms,
            foaf,
            rdfs,
            skos,
          },
        });

        runExportFlag = true;
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

    // Helper
    cleanSuffix(input) /**OK */ {
      return input.replace("_source", "").replace("_target", "");
    },

    downloadMappingExport(txtContent, fileExtension) /**OK */ {
      var exportElement = document.createElement("a");
      exportElement.href =
        "data:text/csv;charset=utf-8," + encodeURIComponent(txtContent);
      exportElement.target = "_blank";

      exportElement.download = `Mapping_Table.${fileExtension}`;
      exportElement.click();

      this.$emit("openClose", "close");
    },

    exportMapping() {
      if (this.fileExtension === "csv") {
        this.exportCSV();
      } else if (this.fileExtension == "sssom") {
        this.exportSSSOM();
      } else this.exportRDF(this.fileExtension); // TODO: better an else with a warning
    },
  },
};
</script>
