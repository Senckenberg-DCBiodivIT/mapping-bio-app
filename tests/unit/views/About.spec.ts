import { shallowMount } from "@vue/test-utils";
import About from "@/views/About.vue";

describe("About", () => {
  it("is online", () => {
    const wrapper = shallowMount(About, {
      //   props: { msg },
    });

    const expectation = "About the Senckenberg Wildlive Portal";
    expect(wrapper.text()).toContain(expectation);
  });
});
