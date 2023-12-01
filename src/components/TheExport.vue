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
import rdf_data_model from "@rdfjs/data-model";

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
import CordraMixin from "@/mixins/cordra";

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
      license: "https://creativecommons.org/licenses/by/4.0/",
    };
  },
  mixins: [CordraMixin],

  computed: {
    ...mapGetters({ getMappingtable: "mappingtable/getMappingtable" }),
  },

  methods: {
    ...mapMutations({}), // Later maybe we need an error message

    async exportSSSOM() {
      console.group("exportSSSOM");
      const XSDDateURI = rdf_data_model.namedNode(
        "http://www.w3.org/2001/XMLSchema#date"
      );

      var input = [];
      var mappingSet = [];
      var singleMappings = [];
      var singleMappingsIDs = [];

      const sssom_json_ld = {
        "@id": "",
        "@type": "",
        comment: "",
        license: "",

        mapping_date: "",
        mapping_provider: "",
        mapping_set_id: "",

        mapping_set_source: [], // TODO: check that

        mapping_set_title: "",
        mapping_set_version: "",
        mapping_tool: "",
        mapping_tool_version: "",

        mappings: [],
      };

      // Clean data
      for (var idxSource in this.getMappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);
          const single_node = {
            "@id": "",
            "@type": "",
            comment: "",
            mapping_cardinality: "",
          };

          // Create mapping node

          input.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(clean_idxSource),
              rdf_data_model.namedNode(
                this.getMappingtable[idxSource][idxTarget]["relation"].replace(
                  "skos:",
                  "http://www.w3.org/2004/02/skos/core#"
                )
              ),
              rdf_data_model.namedNode(clean_idxTarget)
            )
          );

          // Discribe mapping

          let singleMappingsID = `${clean_idxSource}_${clean_idxTarget}`;

          single_node["@id"] = singleMappingsID;
          // TODO: remove later
          singleMappingsIDs.push(singleMappingsID);

          single_node["@type"] = "sssom:Mapping";
          // TODO: remove later
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              ),
              rdf_data_model.namedNode("https://w3id.org/sssom/Mapping")
            )
          );

          single_node["@comment"] =
            this.getMappingtable[idxSource][idxTarget]["comment"];
          // TODO: remove later
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode(
                "http://www.w3.org/2000/01/rdf-schema#comment"
              ),
              rdf_data_model.literal(
                this.getMappingtable[idxSource][idxTarget]["comment"]
              )
            )
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/confidence"),
              rdf_data_model.literal("empty here") // TODO: link data here
            )
          );

          single_node["last_updated"] = new Date().toUTCString();
          // TODO: remove later
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(`${clean_idxSource}_${clean_idxTarget}`),
              rdf_data_model.namedNode("https://w3id.org/sssom/last_updated"),
              rdf_data_model.literal(new Date().toUTCString())
            )
          );

          single_node["mapping_cardinality"] = "empty here"; // TODO: check and put here (1:1 or 1:n. Any other comopsition is not available)
          // TODO: remove later
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode(
                "https://w3id.org/sssom/mapping_cardinality"
              ),
              rdf_data_model.literal("empty here")
            )
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("http://purl.org/pav/authoredOn"),
              rdf_data_model.literal(
                new Date().toISOString().split("T")[0],
                undefined,
                XSDDateURI
              )
            )
            // TODO: Use the creation date here, if there is an available
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/mappings"),
              rdf_data_model.literal(`[${clean_idxSource}, ${clean_idxTarget}`)
            )
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/object_id"),
              rdf_data_model.literal(clean_idxTarget)
            )
          );
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/object_label"),
              rdf_data_model.literal("Put label here") // TODO: Put label here
            )
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/predicate_id"),
              rdf_data_model.literal(
                this.getMappingtable[idxSource][idxTarget]["relation"]
              )
            )
          );

          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/subject_id"),
              rdf_data_model.literal(clean_idxSource)
            )
          );
          singleMappings.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(singleMappingsID),
              rdf_data_model.namedNode("https://w3id.org/sssom/subject_label"),
              rdf_data_model.literal("Put label here") // TODO: Put label here
            )
          );

          sssom_json_ld["mappings"].push(single_node);
        }
      }

      // Create mapping set here
      sssom_json_ld["@id"] = "MappingSet";
      sssom_json_ld["@type"] = "MappingSet"; // TODO: Check if the table is not empty
      sssom_json_ld["comment"] = this.comment;

      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
          ),
          rdf_data_model.namedNode("https://w3id.org/sssom/MappingSet")
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/author_label"),
          rdf_data_model.literal(this.author)
        )
      );

      sssom_json_ld["mapping_tool"] = "mapping.bio";
      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/mapping_tool"),
          rdf_data_model.literal("mapping.bio")
        )
      );

      sssom_json_ld["mapping_tool_version"] = this.versionMapper;
      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "https://w3id.org/sssom/mapping_tool_version"
          ),
          rdf_data_model.literal(this.versionMapper)
        )
      );

      sssom_json_ld["mapping_provider"] = "https://mapping.bio";
      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/mapping_provider"),
          rdf_data_model.namedNode("https://mapping.bio")
        )
      );

      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "http://www.w3.org/2000/01/rdf-schema#comment"
          ),
          rdf_data_model.literal(this.comment)
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/imports"),
          rdf_data_model.literal("")
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/last_updated"),
          rdf_data_model.literal(new Date().toUTCString())
        )
      );

      // TODO: Use dropdown on the form before
      if (
        !(typeof this.license === "string" && this.license.startsWith("http"))
      ) {
        // NOTE: The SSSOM schema always requires a license and it must be a URI (= named node)
        this.license = "http://nolicense";
      }

      sssom_json_ld["license"] = this.license;

      // TODO: remove later
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("http://purl.org/dc/terms/license"),
          rdf_data_model.namedNode(this.license)
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("http://purl.org/pav/authoredOn"),
          rdf_data_model.literal(
            new Date().toISOString().split("T")[0],
            undefined,
            XSDDateURI
          )
          // TODO: Use the creation date here, if there is an available
          // Note: The SSSOM JSON Schema requires a date string in format yyyy-MM-dd
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "https://w3id.org/sssom/mapping_registry_description"
          ),
          rdf_data_model.literal("")
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "https://w3id.org/sssom/mapping_registry_id"
          ),
          rdf_data_model.literal("")
        )
      );

      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode(
            "https://w3id.org/sssom/mapping_registry_title"
          ),
          rdf_data_model.literal("")
        )
      );

      sssom_json_ld["mapping_set_id"] = "http://mapping.example";
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("https://w3id.org/sssom/mapping_set_id"),
          rdf_data_model.namedNode("http://mapping.example") // TODO: a bigger part to do. Use the old one if available
          // NOTE: SSSOM requires a namedNode here, not a literal .
          // NOTE: On the server-side (Cordra) the mapping_set_id value gets anyway
          // overwritten with the generated Cordra ID.

          // TODO: Take care about edited mappings
        )
      );
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("http://www.w3.org/ns/prov#wasDerivedFrom"),
          rdf_data_model.namedNode("http://exampleDerived") // TODO: open discussion
          // NOTE: SSSOM requires a namedNode here, not a literal .
        )
      );
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("http://purl.org/dc/terms/title"),
          rdf_data_model.literal(this.mappingSetTitle)
        )
      );
      mappingSet.push(
        rdf_data_model.quad(
          rdf_data_model.namedNode("MappingSet"),
          rdf_data_model.namedNode("http://www.w3.org/2002/07/owl#versionInfo"),
          rdf_data_model.literal("") // TODO: Format?
        )
      );

      // include single mappings
      for (var item of singleMappingsIDs) {
        console.log("item", item);
        mappingSet.push(
          rdf_data_model.quad(
            rdf_data_model.namedNode("MappingSet"),
            rdf_data_model.namedNode("https://w3id.org/sssom/mappings"),
            rdf_data_model.namedNode(item)
          )
        );
      }

      var runExportFlag = true;

      if (runExportFlag) {
        var exportArray = input.concat(mappingSet).concat(singleMappings);
        // console.log("exportArray", exportArray);

        let readable = Readable.from(exportArray);

        const sssom_context =
          "https://raw.githubusercontent.com/mapping-commons/sssom/0.15.0/src/sssom_schema/context/sssom_schema.context.jsonld";
        const context = { "@context": sssom_context };

        const serializerJsonld = new SerializerJsonld({
          baseIRI: "http://example.org/",
          context,
          // compact: true,
          frame: {
            "@context": sssom_context,
            "@type": "MappingSet",
          },
          // encoding: "string",
          prettyPrint: true,
        });

        console.log("-- test jsonld --");
        console.log("serializer", serializerJsonld);
        console.log("readable", readable);

        const output = serializerJsonld.import(readable);

        output.on("data", (jsonldGraph) => {
          console.log("jsonldGraph created", jsonldGraph);
          console.log("");

          // as soon as there are several IRIs in the output, the serializer
          // produces a JSON-LD @graph structure. However, the first element
          // shoult be the MappingSet according to JSON-LD frame, so we are
          // only interested in this
          const jsonld = jsonldGraph["@graph"][0];

          // There are several wrong properties which in the SSSOM Schema are not
          // allowed on type MappingSet, see: https://mapping-commons.github.io/sssom/MappingSet/
          // Provisionally delete them here, but they should be completely removed from the code
          delete jsonld["mapping_registry_description"];
          delete jsonld["mapping_registry_title"];
          delete jsonld["sssom:imports"];
          delete jsonld["sssom:last_updated"];
          delete jsonld["sssom:mapping_registry_id"];

          // "author_label" is also wrong on MappingSet but should be defined on
          // the individual mapping see https://mapping-commons.github.io/sssom/author_label/
          delete jsonld["author_label"];

          // The following bug is strange:
          // The specific datatype declaration as XSDDateURI for "pav:authoredOn"
          // does not seem to be acknowledged by the json-ld serializer, and
          // therefore the json-ld context does not make the correct alias
          // replacement with "mapping_date".
          // Provisional fix:
          if ("pav:authoredOn" in jsonld) {
            jsonld["mapping_date"] = jsonld["pav:authoredOn"];
            delete jsonld["pav:authoredOn"];

            sssom_json_ld["mapping_date"] = jsonld["pav:authoredOn"];
          }
          if ("mappings" in jsonld) {
            const mappings = jsonld["mappings"];
            if (Array.isArray(mappings)) {
              mappings.forEach((mapping) => {
                if ("pav:authoredOn" in mapping) {
                  mapping["mapping_date"] = mapping["pav:authoredOn"];
                  sssom_json_ld["mapping_date"] = mapping["pav:authoredOn"];

                  delete mapping["pav:authoredOn"];

                  // TODO: implement for sssom_json_ld
                }
              });
            }
          }

          // The following seems to have no other option, more a bug in the SSOM / LinkML schema:
          if ("mapping_set_source" in jsonld) {
            const mapping_set_source = jsonld["mapping_set_source"];
            if (!Array.isArray(mapping_set_source)) {
              jsonld["mapping_set_source"] = [mapping_set_source];
            }
          }

          console.log("Content created", jsonld);
          console.log("sssom_json_ld", sssom_json_ld);

          var cordra_prev_obj = this.cordraCreateDocument({
            type: "MappingSet",
            content: jsonld,
          });

          var cordra_submit_obj = this.cordraCreateDocument({
            type: "MappingSet",
            content: sssom_json_ld,
          });

          console.log("cordra cordra_submit_obj ", cordra_submit_obj);
          console.log("cordra cordra_prev_obj ", cordra_prev_obj);

          // this.downloadMappingExport(jsonld, "sssom");
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
          //   rdf_data_model.quad(
          //     rdf_data_model.namedNode("owl:class"),
          //     rdf_data_model.namedNode("rdf:about"),
          //     rdf_data_model.literal(`${cleanElement}`)
          //   )
          // );
          //   // Create new label
          input.push(
            rdf_data_model.quad(
              rdf_data_model.namedNode(`${cleanElement}`),
              rdf_data_model.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
              rdf_data_model.literal(this.getMappingtable[idxSource][idxTarget][title])
            )
          );
          labelReady.push(rowElement);
        }
      };*/

      var mappingIndex = 2;
      var input = [
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
          ),
          rdf_data_model.namedNode(
            `http://purl.obolibrary.org/obo/envo.owl#Alignment`
          )
        ),
        // TODO: Hier nur für XML
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#xml"
          ),
          rdf_data_model.literal(`yes`)
        ),
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#level"
          ),
          rdf_data_model.literal(`0`)
        ),
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#type"
          ),
          rdf_data_model.literal(`??`)
        ),

        // TODO: currently static only
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#onto1"
          ),
          rdf_data_model.literal(`http://data.bioontology.org/ontologies/ENVO`)
        ),

        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#onto2"
          ),
          rdf_data_model.literal(`http://data.bioontology.org/ontologies/SWEET`)
        ),
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#uri1"
          ),
          rdf_data_model.literal(`http://data.bioontology.org/ontologies/ENVO`)
        ),
        rdf_data_model.quad(
          rdf_data_model.blankNode(`genid1`),
          rdf_data_model.namedNode(
            "http://purl.obolibrary.org/obo/envo.owl#uri2"
          ),
          rdf_data_model.literal(`http://data.bioontology.org/ontologies/SWEET`)
        ),
      ];

      for (var idxSource in this.getMappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          //Map
          input.push(
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid1`),
              rdf_data_model.namedNode(
                "http://purl.obolibrary.org/obo/envo.owl#map"
              ),
              rdf_data_model.blankNode(`genid${mappingIndex}`)
            )
          );

          //Cell
          var cell = [
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid${mappingIndex}`),
              rdf_data_model.namedNode(
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              ),
              rdf_data_model.literal(
                `http://purl.obolibrary.org/obo/envo.owl#Cell`
              )
            ),
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid${mappingIndex}`),
              rdf_data_model.namedNode(
                "purl.obolibrary.org/obo/envo.owl#entity1"
              ),
              rdf_data_model.literal(`${clean_idxSource}`)
            ),
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid${mappingIndex}`),
              rdf_data_model.namedNode(
                "purl.obolibrary.org/obo/envo.owl#entity2"
              ),
              rdf_data_model.literal(`${clean_idxTarget}`)
            ),
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid${mappingIndex}`),
              rdf_data_model.namedNode(
                "http://purl.obolibrary.org/obo/envo.owl#measure"
              ),
              rdf_data_model.literal(`1`)
            ),
            rdf_data_model.quad(
              rdf_data_model.blankNode(`genid${mappingIndex}`),
              rdf_data_model.namedNode(
                "http://purl.obolibrary.org/obo/envo.owl#relation"
              ),
              rdf_data_model.literal(
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
