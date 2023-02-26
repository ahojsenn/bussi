// https://medium.com/@fgoessler/set-up-nuxt3-with-jest-typescript-80aa4d3cfabc
import { mount, shallowMount } from '@vue/test-utils'
import Page from "./Table.vue"


describe("Table", () => {
  it("finds Table with text on it", async () => {
    const page = mount(Page)

    await expect(page.text()).toContain("Table")
  })
})
