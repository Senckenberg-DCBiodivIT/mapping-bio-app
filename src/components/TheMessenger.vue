/* FYI variant: // primary // info // warning // danger How to use: 1. In
methods(){} set at first ...mapMutations({ newMessage: 'messenger/newMessage' })
Don't forget import { mapMutations } from 'vuex'; 2. Use in a function: let
message = { content: 'An error has occurred: ' + YourTextVar, kind: 'danger', };
this.newMessage(message); */

<template>
  <div>
    <div class="columns">
      <div class="column"></div>
      <div class="column is-8">
        <div
          style="margin-bottom: 1rem"
          v-for="message in messages"
          :key="message.id"
        >
          <o-notification
            :duration="5000"
            autoClose
            closable
            :variant="message.severity"
            aria-close-label="Close notification"
          >
            {{ message.content }}
          </o-notification>
        </div>
      </div>
      <div class="column"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TheMessenger",

  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    messages() {
      return this.$store.getters["messenger/getMessages"];
    },
  },
};
</script>
