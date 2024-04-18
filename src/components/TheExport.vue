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
      <label class="label">Author ORCID</label>
      <div class="control">
        <input class="input" type="text" v-model="authorOrcid" />
      </div>
    </div>
    <div class="field">
      <label class="label">Mapping set title</label>
      <div class="control">
        <input class="input" type="text" v-model="mapping_set_title" />
      </div>
    </div>

    <div class="field">
      <label class="label">Comment</label>
      <div class="control">
        <textarea class="textarea" rows="2" v-model="comment" />
      </div>
    </div>

    <div class="field">
      <div class="control">
        <o-field label="License:" variant="">
          <o-dropdown aria-role="list" v-model="license_dropdown.selected_item">
            <template #trigger="{ active }">
              <o-button variant="primary">
                <span>{{
                  license_dropdown.items[license_dropdown.selected_item]
                }}</span>

                <o-icon
                  pack="fa"
                  :icon="active ? 'chevron-down' : 'chevron-up'"
                ></o-icon>
              </o-button>
            </template>

            <o-dropdown-item
              v-for="(item, key) in license_dropdown.items"
              :key="key"
              :value="key"
              aria-role="listitem"
            >
              {{ license_dropdown.items[key] }}</o-dropdown-item
            >
          </o-dropdown>
        </o-field>
      </div>
    </div>

    <div class="columns">
      <div class="column has-text-centered">
        <o-button variant="warning" @click="$emit('openClose', 'close')"
          >Cancel</o-button
        >
      </div>
      <div class="column has-text-centered">
        <o-button variant="primary" @click="exportMapping">{{
          fileExtension === "save" ? "Save" : "Download"
        }}</o-button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { mapMutations, mapGetters } from "vuex";
import CordraMixin from "@/mixins/cordra";

// RDF
import rdf_data_model from "@rdfjs/data-model";

// Export RDF
import { Readable } from "readable-stream";
import formats from "@rdfjs/formats-common";

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
  name: "TheExport",
  props: ["fileExtension"],
  emits: ["openClose"],

  data() {
    return {
      versionMapper: process.env.VUE_APP_VERSION,
      author: this.$keycloak_name() ? this.$keycloak_name() : "",
      authorOrcid: this.$keycloak_orcid() ? this.$keycloak_orcid() : "",
      mapping_set_title: "",
      comment: "",

      license_dropdown: {
        selected_item: 0,
        items: [
          "CC BY 4.0",
          "CC BY-NC 4.0",
          "CC BY-NC-ND 4.0",
          "CC BY-NC-SA 4.0",
          "CC BY-ND 4.0",
          "CC BY-SA 4.0",
        ],
        links: [
          "https://creativecommons.org/licenses/by/4.0/",
          "https://creativecommons.org/licenses/by-nc/4.0/",
          "https://creativecommons.org/licenses/by-nc-nd/4.0/",
          "https://creativecommons.org/licenses/by-nc-sa/4.0/",
          "https://creativecommons.org/licenses/by-nd/4.0/",
          "https://creativecommons.org/licenses/by-sa/4.0/",
        ],
      },
    };
  },
  mixins: [CordraMixin],

  computed: {
    ...mapGetters({ getMappingtable: "mappingtable/getMappingtable" }),
  },

  methods: {
    ...mapMutations({}), // Later maybe we need an error message

    async create_sssom_ttl() {
      /* Description: Use create_sssom_json_ld and convert the result*/

      console.group("create_sssom_ttl");

      // Step 1, reate SSSOM
      var sssom_json_ld = await this.create_sssom_json_ld();

      // Step 2, convert to ttl
      var quads = []; // Storage for parsed sssom
      var ttl_export_stream;
      var ttl_export = "";

      const quad_parse_json = formats.parsers.import(
        "application/ld+json",
        Readable.from(JSON.stringify(sssom_json_ld))
      );

      quad_parse_json.on("data", (quad) => quads.push(quad));
      quad_parse_json.on("prefix", (prefix, ns) => quads.push(prefix, ns)); // TODO: Copy from Cordra

      // Step 3, serializer
      quad_parse_json.on("end", () => {
        ttl_export_stream = formats.serializers.import(
          "text/turtle",
          Readable.from(quads)
        );

        ttl_export_stream.on("data", (data) => (ttl_export += data));
        ttl_export_stream.on(
          "end",
          // () => null
          console.log("ttl_export", ttl_export)
          // TODO: Step 4, send to Cordra or download a file
        );
      });

      console.groupEnd();
    },

    async create_sssom_json_ld() {
      /*
      Here we create a SSSOM JSON Object to use them for Cordra or other needs
      */
      console.group("create_jsonLD_export");

      const sssom_json_ld = {
        "@id": "", // Handling by Cordra
        "@type": "", // Handling by Cordra
        comment: this.comment,
        license:
          this.license_dropdown.items[this.license_dropdown.selected_item],
        mapping_date: new Date().toISOString().split("T")[0],
        mapping_provider: "https://mapping.bio",
        mapping_set_id: "", // Handling by Cordra

        mapping_set_source: [],
        mapping_set_title: this.mapping_set_title, // TODO: Currently empty
        mapping_set_version: "", // TODO: Currently empty

        mapping_tool: "mapping.bio",
        mapping_tool_version: this.versionMapper,

        mappings: [],
      };

      // Clean data
      for (var idxSource in this.getMappingtable) {
        var clean_idxSource = this.cleanSuffix(idxSource);

        for (var idxTarget of Object.keys(this.getMappingtable[idxSource])) {
          var clean_idxTarget = this.cleanSuffix(idxTarget);

          var sssom_json_ld_temp_single_mapping = {
            subject_id: clean_idxSource,
            predicate_id: this.getMappingtable[idxSource][idxTarget][
              "relation"
            ].replace("skos:", "http://www.w3.org/2004/02/skos/core#"),

            object_id: clean_idxTarget,

            mapping_justification: "semapv:ManualMappingCuration",

            curation_rule: [
              "https://w3id.org/sssom/commons/disease/curation-rules/MPR2",
            ],
            see_also: [], // TODO: a new input field on the viz table?
          };

          sssom_json_ld["mappings"].push(sssom_json_ld_temp_single_mapping);
        }
      }

      console.groupEnd();
      return sssom_json_ld;
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

    async saveMappingSetInRepo() {
      let sssom_json_ld = await this.create_sssom_json_ld();
      // Create Document in Cordra
      this.cordraCreateDocument({
        type: "MappingSet",
        content: sssom_json_ld,
      }).then((createdObject) => {
        if (createdObject.id) {
          this.$router.push({ path: "/mappingsets/" + createdObject.id });
        }
      });
    },

    async exportMapping() {
      if (this.fileExtension === "csv") {
        this.exportCSV();
      } else if (this.fileExtension === "sssom") {
        let sssom_json_ld = await this.create_sssom_json_ld();
        this.downloadMappingExport(JSON.stringify(sssom_json_ld), "sssom");
      } else if (this.fileExtension === "save") {
        this.saveMappingSetInRepo();
      } else this.exportRDF(this.fileExtension); // TODO: better an else with a warning
    },
  },
};
</script>
