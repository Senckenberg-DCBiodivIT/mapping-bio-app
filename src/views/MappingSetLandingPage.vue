<template>
  <div class="columns">
    <div class="column is-1"></div>

    <div class="column is-10">
      <nav class="panel">
        <div class="panel-heading title is-size-3">
          {{ cordraObject.content.mapping_set_title }}
        </div>
      </nav>
      <div class="columns">
        <div class="column is-10">
          <o-field label="Type">MappingSet</o-field>
          <o-field label="PID"
            ><a :href="'https://hdl.handle.net/' + cordraObject.id">
              hdl:{{ cordraObject.id }}</a
            ></o-field
          >
          <o-field label="Created on">
            {{ new Date(cordraObject.metadata.createdOn) }}</o-field
          >
          <o-field label="Description">
            {{ cordraObject.content.mapping_set_description }}</o-field
          >
          <o-field label="License"> {{ cordraObject.content.license }}</o-field>
          <o-field label="Creator"
            ><div v-if="cordraObject.content.creator_id">
              <div
                v-for="(creator_id, i) in cordraObject.content.creator_id"
                :key="creator_id"
              >
                <a :href="creator_id">{{
                  Array.isArray(cordraObject.content.creator_label) &&
                  cordraObject.content.creator_label[i]
                    ? cordraObject.content.creator_label[i]
                    : creator_id
                }}</a>
              </div>
            </div>
            <div
              v-else
              v-for="creator_label in cordraObject.content.creator_label"
              :key="creator_label"
            >
              {{ creator_label }}
            </div>
          </o-field>
        </div>
        <div class="column is-2">
          <p>
            <a
              class="button is-primary"
              :href="getDownloadURL()"
              download="mappingset_sssom.json"
              >Download SSSOM</a
            >
          </p>
          <p>
            <a
              class="button is-secondary"
              :href="getROCrateURL()"
              target="_blank"
              >Get as RO-Crate</a
            >
          </p>
          <p>
            <a
              class="button is-secondary"
              :href="'http://hdl.handle.net/' + cordraObject.id + '?noredirect'"
              target="_blank"
              >Inspect FDO Record</a
            >
          </p>
        </div>
      </div>

      <TheMappingtable :isModifiable="false" :isNew="false" />
    </div>

    <div class="column is-1"></div>
  </div>
</template>

<script setup>
import TheMappingtable from "@/components/TheMappingtable";
</script>

<script>
import CordraMixin from "@/mixins/cordra";
import { mapMutations } from "vuex";

export default {
  name: "MappingSetLandingPage",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      objectID: this.$route.params.id,
      cordraObject: {
        content: {},
        metadata: {},
      },
    };
  },

  methods: {
    // vuex store
    ...mapMutations({
      addMappingItem: "mappingtable/addMappingItem",
      setMappingtable: "mappingtable/setMappingtable",
    }),
    mapRelationURIToLabel(predicate_id) {
      return predicate_id.replace(
        "http://www.w3.org/2004/02/skos/core#",
        "skos:"
      );
    },
    getDownloadURL() {
      return (
        process.env.VUE_APP_CORDRA_URL + "/objects/" + this.cordraObject.id
      );
    },
    getROCrateURL() {
      return (
        process.env.VUE_APP_CORDRA_URL +
        "/call?method=getAsROCrate&objectId=" +
        this.cordraObject.id
      );
    },
  },

  created() {
    this.setMappingtable(null);
    this.cordraCreateTemporaryClient()
      .get(this.objectID)
      .then((result) => {
        this.cordraObject = result;
        this.cordraObject.content.mappings.forEach((mapping) => {
          const mappingValue = {
            left: mapping.subject_id,
            right: mapping.object_id,
            sourceTitle: mapping.subject_label,
            targetTitle: mapping.object_label,
            relation: this.mapRelationURIToLabel(mapping.predicate_id),
            comment: "",
          };
          if (mappingValue.relation === undefined) {
            mappingValue.relation = "";
          }
          this.addMappingItem(mappingValue);
        });
      });
  },
};
</script>
