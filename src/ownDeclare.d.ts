declare module "@recogito/annotorious";

// Mixins

declare module "@/mixins/camAndCapture" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@/mixins/pagination" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@/mixins/cordra" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Store
import { Store } from "@/store"; // path to store file

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store;
  }
}
