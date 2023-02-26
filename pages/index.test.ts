// https://medium.com/@fgoessler/set-up-nuxt3-with-jest-typescript-80aa4d3cfabc
import { mount, shallowMount } from '@vue/test-utils'
import Page from "./index.vue"

describe("index page", () => {
  it("finds indes page with Bussi on it", async () => {
    const page = shallowMount(Page)
    expect(page.text()).toContain("Bussi")
    //    const button = page.find("button")
    //    await button.trigger("click")
    //    expect(page.text()).toContain("1 clicks")
  })
})
