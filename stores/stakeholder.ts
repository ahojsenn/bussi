import { defineStore } from 'pinia'
import Papa from 'papaparse'
import { URL } from '../mixins/url'
import logd from '../mixins/logDebug'

const getDataFromGoogle = (url: string): Promise<any> => {
  const ret = new Promise(function (resolve, reject) {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    })
  })
  //  console.log("hauptbuch.getDataFromGoogle: ", ret)
  return ret
}

logd("store.stakeholder: at start...")

const GMAGIC = '/gviz/tq?tqx=out:csv'
const GSN_sheet = '&sheet=stakeholder'
const GdataUrl = URL + GMAGIC + GSN_sheet

export const useStakeholderStore = defineStore('stakeholder', {
  state: () => ({
    stakeholder: [] as Array<any>,
  }),
  actions: {
    async loadStakeholder() {
      //logd("loadStakeholder")
      const gdata = await getDataFromGoogle(GdataUrl)
      this.stakeholder = gdata.data
    },
  },

  getters: {
    stakeholderListe: (state) => state.stakeholder.map(s => s["Name"]),
    personen: (state) => state.stakeholder
      .filter(s => s["Name"] && s["Verteilung"].indexOf(',') === -1 && s["Name"] !== "Bussi")
      .map(s => s["Name"]),
    shVerteilung: (state) => function (shName: string) {
      return state.stakeholder.find(s => s["Name"] == shName)["Verteilung"]
    }
  }
})
