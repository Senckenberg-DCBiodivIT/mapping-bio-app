<template>
  <div>
    <TreeView :kind="source" />
    <TreeView :kind="target" />
  </div>
</template>

<script setup>
import TreeView from "@/components/TreeView";
</script>

<script>
export default {
  name: "TheTreeStructure",

  data() {
    return {};
  },
};
</script>
