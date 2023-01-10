import { shallowMount } from "@vue/test-utils";

import CameratrapLandingpage from "@/views/CameratrapLandingpage.vue";

describe("About", () => {
  it("is online", () => {
    const mockRoute = {
      params: {
        id: "6216f8a75fd5bb3d5f22",
      },
    };
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = shallowMount(CameratrapLandingpage, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
          $keycloak_token: () =>
            "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5ZDRhN2RsOVZTSS1jYUd5ZTRMVUhrbi1fWW5lbFpLUHBOV1FLS0pSVHY4In0.eyJleHAiOjE2NDYzMjU3NjUsImlhdCI6MTY0NjMyNTQ2NSwiYXV0aF90aW1lIjoxNjQ2MzI1NDY0LCJqdGkiOiI0ZGMwMGU1ZC1jMTJmLTQ5ZmUtYjA4ZS1iNmZlOWFiNWIwMDEiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvYXV0aC9yZWFsbXMvd2lsZGxpdmUtcG9ydGFsIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjIxNWRjMDY3LTI5ZjktNDc3Mi1iNmUwLTFjMDAxZDkyNWE5NCIsInR5cCI6IkJlYXJlciIsImF6cCI6IndpbGRsaXZlLWZyb250ZW5kIiwibm9uY2UiOiI1ZTE0NzljNi04M2E0LTQ5ODctYWMyZS03MjBjMGUzZTg3MDAiLCJzZXNzaW9uX3N0YXRlIjoiMzdjYzMwZDItNjE3Zi00ODU4LWFiYmQtMDc1ODEwMTVkMjZjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNvcmRyYTpjYXB0dXJlZXZlbnQ6Y3JlYXRlIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtd2lsZGxpdmUtcG9ydGFsIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjM3Y2MzMGQyLTYxN2YtNDg1OC1hYmJkLTA3NTgxMDE1ZDI2YyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6InRlc3QgdGVzdCIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QiLCJnaXZlbl9uYW1lIjoidGVzdCIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmRlIn0.LpLlP4rY7fE52Y_HGHUFhfe_ggJ9ip2HBMqBcKAlaZuJ9ua4yqCvRYCd057QRM7F7xEGYEISSi2NOaRtwRB12L8uT_pjCgmxLECxrC86VM0PM7fD1tR9eHXAKeq9jzeptHhbcMA7HPW4Oanrb00xAl35SWxQVsmzs9N1u_ZlChxygkQNLFVZjwOeYnZ7csZjPkFA5QqgFy6FM2qtSaFXuN8psdd8QOn41S3Jm11gC2g8giY6fTBccfD8ZmtcZYUJQNhLObmSOs8yKQ_NOniglNSm5coMCmhUCc36CdpNcDm3L_sOI9Tze-IuYYbKhmbf5RJKTTGxqz-XtZygUpiIdQ",
        },
      },
    });

    console.log("My wrapper", wrapper);

    const expectation = "Back to overview";
    expect(wrapper.find("[data-testid='BackToOverview']")).toContain(
      expectation
    );
  });
});
