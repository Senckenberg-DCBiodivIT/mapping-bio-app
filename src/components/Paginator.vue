/* Use props "contentToShow" and "perpage" for defninition and emit
setSegmentToShow for interaction

<Paginator
  :contentToShow="cordraSearchResult"
  :perpage="5"
  @setSegmentToShow="(segment) => (pagination_showSegment = segment)"
/>
*/

<template>
  <div>
    <!-- Better than a watch function -->
    {{
      contentToShow.length > 0 && current === 0 ? pagination_checkPage(1) : ""
    }}

    <o-pagination
      :total="pagination_getTotal"
      :current="current"
      :range-before="1"
      :range-after="1"
      :order="'default'"
      :size="'default'"
      :simple="false"
      :rounded="false"
      :per-page="perpage"
      iconPack="fa"
      :icon-prev="'chevron-left'"
      :icon-next="'chevron-right'"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      @change="pagination_checkPage"
      v-if="pagination_getTotal > 0"
    >
    </o-pagination>
    <div v-if="pagination_getTotal > 0">
      Showing {{ (current - 1) * perpage + 1 }} to
      {{
        current * perpage > pagination_getTotal
          ? pagination_getTotal
          : current * perpage
      }}
      of {{ pagination_getTotal }} results
    </div>
  </div>
</template>

<script>
export default {
  name: "PaginatorComponent",
  props: ["contentToShow", "perpage"],
  emits: ["setSegmentToShow"],

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      current: 0,
    };
  },

  methods: {
    pagination_checkPage(position) {
      console.group("pagination_checkPage, position:", position);
      this.current = position;

      let from = this.perpage * (this.current - 1);

      let to = this.perpage * (this.current - 1) + this.perpage;

      let result = this.contentToShow.slice(from, to);

      this.$emit("setSegmentToShow", result);

      console.groupEnd();
    },
  },

  computed: {
    pagination_getTotal() {
      return this.contentToShow.length;
    },
  },

  watch: {
    contentToShow: {
      handler() {
        this.pagination_checkPage(0);
      },
      deep: true, // Shallow watcher is't enough
    },
  },
};
</script>
