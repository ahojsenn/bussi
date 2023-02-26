// https://medium.com/@fgoessler/set-up-nuxt3-with-jest-typescript-80aa4d3cfabc
import { mount, shallowMount } from '@vue/test-utils'
import Page from "./hauptbuch.vue"


describe("hauptbuch", () => {
  it("finds hauptbuch page with text on it", async () => {
    const page = mount(Page)

    await expect(page.text()).toContain("Das Bussi Fahrtenbuch")
  })
})
