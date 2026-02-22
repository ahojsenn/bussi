import { Account, type RawPeriode } from '@/types';
import { defineStore } from 'pinia'
import { GSHEET_URL } from '../utils/url'
import logd from '../utils/logDebug'
import { getDataFromGoogle } from './getDataFromGoogle';

const csvData = "Date,Amount,Category,Date,Status"; // Example with duplicate 'Date'


const GMAGIC = '/gviz/tq?tqx=out:csv'
const GSN_sheet = '&sheet=perioden'
const GdataUrl = GSHEET_URL + GMAGIC + GSN_sheet

export const usePeriodenStore = defineStore('perioden', {
  state: () => ({
    _perioden: [] as Array<RawPeriode>,
    _currentPeriod: 'unbekannte Peroiode',
  }),
  actions: {
    async loadDataFromGoogle() {
      const gdata = await getDataFromGoogle(GdataUrl)
      this._perioden = gdata.data
      this._currentPeriod = this._perioden[0]?.Periode || ''
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
        return state._perioden.find(p => p.Periode === periodstr)?.Reparaturpauschale || 'unbekannte Peroiode'
      },
    listOfPeriods: (state) => state._perioden.map(p => p.Periode),
    currentPeriod: (state) => state._currentPeriod,
    perioden: (state) => state._perioden,
  }
})
