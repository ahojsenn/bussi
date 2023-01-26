import { Account } from './../mixins/types';
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
  //  console.log("perioden .getDataFromGoogle: ", ret)
  return ret
}

const GMAGIC = '/gviz/tq?tqx=out:csv'
const GSN_sheet = '&sheet=perioden'
const GdataUrl = URL + GMAGIC + GSN_sheet

export const usePeriodenStore = defineStore('perioden', {
  state: () => ({
    _perioden: [] as Array<any>,
    _currentPeriod: '',
  }),
  actions: {
    async loadDataFromGoogle() {
      const gdata = await getDataFromGoogle(GdataUrl)
      this._perioden = gdata.data
      this._currentPeriod = this._perioden[gdata.data.length - 2]["Periode"]
      // logd("perioden.loadDataFromGoogle: ", this.perioden)
    },
    setPeriod(p: string) {
      //logd("perioden.setPeriod: ", p)
      this._currentPeriod = p
    },
  },
  getters: {
    reparaturpauschale: (state) =>
      (periodstr: string): string => {
        return state._perioden.find(p => p["Periode"] === periodstr)["Reparaturpauschale"]
      },
    listOfPeriods: (state) => state._perioden.map(p => p["Periode"]),
    currentPeriod: (state) => state._currentPeriod,
  }
})
