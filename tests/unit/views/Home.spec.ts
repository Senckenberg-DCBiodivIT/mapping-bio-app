import { shallowMount } from "@vue/test-utils";
import Home from "@/views/Home.vue";

describe("Home", () => {
  it("...is online", () => {
    const wrapper = shallowMount(Home, {
      //   props: { msg },
    });

    const expectation = "Welcome to the Senckenberg Wildlive portal";
    expect(wrapper.text()).toContain(expectation);
  });
});
