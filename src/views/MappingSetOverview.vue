<template>
  <div>
    <!-- DEBUG: {{ cordraSearchResult }}<br /><br /> -->
    <div class="columns">
      <div class="column"></div>
      <div class="column is-10">
        <nav class="panel">
          <div class="panel-heading title is-size-3">
            <div>Mappings overview</div>
          </div>
          <div class="panel-block">
            <p class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Search"
                @input="cordraSearch"
                v-model="cordraSearchInput"
              />
              <span class="icon is-left">
                <i class="fa fa-search" aria-hidden="true"></i>
              </span>
            </p>
          </div>
        </nav>

        <section>
          <hr />

          <div v-if="cordraSearchResult.length > 0">
            <div v-for="item in pagination_showSegment" :key="item.id">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                    <div class="media-content">
                      <p class="title is-4">
                        Title:
                        <span v-if="item.content.mapping_set_title">
                          {{ item.content.mapping_set_title }}</span
                        >
                        <span v-else class="is-italic">No title</span>
                      </p>
                      <p class="subtitle is-6">{{ item.id }}</p>
                      <p>Mappings: {{ item.content.mappings.length }}</p>
                      <p>
                        Creator:
                        <span v-if="item.content.creator_id">
                          <span
                            v-for="(creator_id, i) in item.content.creator_id"
                            :key="creator_id"
                          >
                            <a :href="creator_id">{{
                              item.content.creator_label[i]
                                ? item.content.creator_label[i]
                                : creator_id
                            }}</a>
                          </span>
                        </span>
                        <span
                          v-else
                          v-for="creator_label in item.content.creator_label"
                          :key="creator_label"
                        >
                          {{ creator_label }}
                        </span>
                      </p>
                      <p>Created: {{ new Date(item.metadata.createdOn) }}</p>
                    </div>
                  </div>

                  <nav class="level">
                    <p class="level-item has-text-centered">
                      <router-link :to="'/mappingsets/' + item.id">
                        <o-button
                          variant="info"
                          outlined
                          style="width: 100%"
                          class="is-size-6"
                          >Click here for more</o-button
                        ></router-link
                      >
                    </p>
                  </nav>
                </div>
              </div>
              <br />
            </div>
          </div>
          <div v-else>There are no datasets</div>

          <hr />
        </section>

        <!-- define cordraSearchResult.length: {{ cordraSearchResult.length }} -->
        <Paginator
          :contentToShow="cordraSearchResult"
          :perpage="5"
          @setSegmentToShow="(segment) => (pagination_showSegment = segment)"
        />

        <!-- Create and show own -->
        <div v-if="keycloakReady">
          <br />

          <div class="columns">
            <div class="column has-text-centered">
              <!-- <div v-if="$route.params.area === 'cameratraps'">
                <router-link to="/createInArea/cameratraps">
                  <o-button variant="primary">Create new camera trap</o-button>
                </router-link>
              </div> -->
              <!-- <div v-if="$route.params.area === 'captureevent'">
                <router-link to="/createInArea/captureevent">
                  <o-button variant="primary"
                    >Create new capture event</o-button
                  >
                </router-link>
              </div> -->
              <div v-if="$route.params.area === 'projects'">
                <router-link to="/createInArea/projects">
                  <o-button variant="primary">Create a new project</o-button>
                </router-link>
              </div>
            </div>

            <div class="column has-test-centered">
              <o-button
                variant="primary"
                @click="
                  cordraOnlyOwnDatasetFlag = !cordraOnlyOwnDatasetFlag;
                  cordraSearch();
                "
                >{{
                  cordraOnlyOwnDatasetFlag
                    ? "Show all datasets"
                    : "Show own datasets"
                }}</o-button
              >
            </div>
          </div>
        </div>
        <!-- Debug serach Result: {{ cordraSearchResult }} -->
      </div>
      <div class="column"></div>
    </div>
    <br />
  </div>
</template>

<script setup>
// import CameraOverview from "@/components/CameraOverview.vue";
import Paginator from "@/components/Paginator.vue";
</script>

<script>
import { mapGetters } from "vuex";

import CordraMixin from "@/mixins/cordra";

export default {
  name: "ShowArea",
  mixins: [CordraMixin],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      pagination_showSegment: [],
      docType: "MappingSet",
    };
  },

  methods: {},

  created() {
    this.cordraSearch();
  },

  computed: {
    ...mapGetters({ keycloakReady: "keycloak/getStatusAuthenticated" }),
  },
};
</script>
