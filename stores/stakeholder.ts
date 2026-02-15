import { defineStore } from 'pinia'
import Papa from 'papaparse'
import { URL } from '../utils/url'
import logd from '../utils/logDebug'
import { type RawStakeholder } from '../types'

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
    stakeholder: [] as Array<RawStakeholder>,
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
      const v = state.stakeholder.find(s => s.Name == shName)?.Verteilung
      // if (v != shName) logd("in shVerteilung, found ", shName, " --> ", v)
      return v
    },
    // get a List of of people that appear in the "Verteilung" field of any stakeholder, split by comma and trim spaces
    verteilungPersonen: (state) => {
      const personenSet = new Set<string>()
      state.stakeholder.forEach(s => {
        if (s.Verteilung) {
          s.Verteilung.split(',').forEach(p => {
            const person = p.trim()
            if (person) {
              personenSet.add(person)
            }
          })
        }
      })
      return Array.from(personenSet)
    }
  }
})
