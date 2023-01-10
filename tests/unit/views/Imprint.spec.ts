import { shallowMount } from "@vue/test-utils";
import Imprint from "@/views/Imprint.vue";

describe("Imprint", () => {
  it("Check for titles", () => {
    const wrapper = shallowMount(Imprint, {
      //   props: { msg },
    });

    let expectation = "Imprint, Copyright, and Disclaimer";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Responsible content provider according to §5 of the TMG";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Board of Directors";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Supervisory Authority";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Data Protection";
    expect(wrapper.text()).toContain(expectation);

    expectation =
      "Legal Basis for the Processing of Data according to the DSGVO";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Transmission into Third Countries";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Consent and Right to Objection";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Personal Data";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Newsletter";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Server Logfiles/Access Data";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Incorporation of third-party Services and Content";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Cookies";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Facebook and Twitter Button";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Firewall";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Storage Limits";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Data Protection Notice According to § 13 of the TMG";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Copyright";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Liability for Links";
    expect(wrapper.text()).toContain(expectation);

    expectation = "Imprint";
    expect(wrapper.text()).toContain(expectation);
  });
});
