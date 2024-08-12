import { HauptbuchBooking } from './../mixins/types';
import { defineStore } from 'pinia'
import Papa from 'papaparse'
import logd from '../mixins/logDebug'
import { URL } from '../mixins/url'

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
  console.log("hauptbuch.getDataFromGoogle: ", ret)
  return ret
}

const GMAGIC = '/gviz/tq?tqx=out:csv'
const GEDIT = '/edit#gid=1543409034'
const GSN_sheet = '&sheet=FahrtenbuchV-'
const GdataUrl = URL + GMAGIC + GSN_sheet
const toEuro = (s: string): string => s.indexOf('€') > 0 ? s : parseFloat(s == '' ? '0' : s) + ' €'

export const useHauptbuchStore = defineStore('hauptbuch', {
  state: () => ({
    bookings: [] as Array<HauptbuchBooking>,
    _url: URL + GEDIT
  }),
  actions: {
    async loadBussiData(period?: string) {

      console.log("hauptbuch.loadBussiData: ", period, GdataUrl)
      const gdata = await getDataFromGoogle(GdataUrl)
      // console.log("hauptbuch.loadBussiData: ", period, gdata.data.length, gdata.data)

      // add rowNr to the raw dataset before any filters are applied
      let data1 = gdata.data.map((e: any, i: number) => {
        e.rowNr = i
        return e
      })

      if (Number(period)) data1 = data1.filter((e: any) => e["Datum"].substring(0, 4) === period)

      // if 'period' contains 'alles bis' then filter out all rows after the given date
      if (period && period.indexOf('bis') > 0) {
        const date = period.split('bis')[1].trim()
        data1 = data1.filter((e: any) => e["Datum"].substring(0, 4) <= date)
      }

      console.log("hauptbuch.loadBussiData: ", period, data1.length, data1)
      /* create a ling in the text filed >*/
      const linkTo = (s: string, rnr: number): string =>
        '<a target="_blank" href='
        + this._url + '#range=' + (rnr + 2) + ':' + (rnr + 2) + '>' + s + '</a>'

      this.bookings = data1.map((b: any) => new HauptbuchBooking(
        linkTo(b.rowNr, b.rowNr),
        b["Datum"],
        b["Wer"],
        b["km (Endstand)"],
        b["Liter getankt"],
        b["Benzinpreis"],
        toEuro(b["Betrag"]),
        b["Was"],
        b["V-Schlüssel"],
        b["km"],
        b["km seit letzter Tankung"],
        parseFloat(b["Verbrauch/l"].replace(',', '.')) || 0,
      ))
      logd("hauptbuch.loadBussiData: ", period, this.bookings.length, this.bookings)
    },
  },
  getters: {
    url: (state) => state._url
  }
})
