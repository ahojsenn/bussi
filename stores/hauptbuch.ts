import { HauptbuchBooking } from './../types';
import { defineStore } from 'pinia'
import Papa from 'papaparse'
import logd from '../utils/logDebug'
import { URL } from '../utils/url'
import * as bookingHelpers from '../composables/bookingHelpers'

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

// https://docs.google.com/spreadsheets/d/1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M/edit?gid=1543409034#gid=1543409034

const GMAGIC = '/gviz/tq?tqx=out:csv'
const GEDIT = '/edit#gid=1543409034'
const GSN_sheet = '&sheet=Fahrtenbuch'
const GdataUrl = URL + GMAGIC + GSN_sheet

export const useHauptbuchStore = defineStore('hauptbuch', {
  state: () => ({
    bookings: [] as Array<HauptbuchBooking>,
    _url: URL + GEDIT,
    access_token: ""
  }),
  actions: {
    async loadHauptbuch(period?: string) {

      logd("hauptbuch.loadHauptbuch: ", period, GdataUrl)
      const gdata = await getDataFromGoogle(GdataUrl)
      // console.log("hauptbuch.loadBussiData: ", period, gdata.data.length, gdata.data)

      // add rowNr to the raw dataset before any filters are applied
      let data1 = gdata.data.map((e: any, i: number) => {
        e.rowNr = i
        return e
      })

      // if 'period' contains 'alles bis' then filter out all rows after the given date
      if (period && period.indexOf('bis') > 0) {
        const date = period.split('bis')[1].trim()
        data1 = data1.filter((e: any) => e["Datum"].substring(0, 4) <= date)
      }
      else if (isNaN(Number(period))) {    // ignore the selector and do not filter, i.e. take all values
      }
      else {
        data1 = data1.filter((e: any) => e["Datum"].substring(0, 4) === period)
      }

      /* create a ling in the text filed >*/
      const linkTo = (s: string, rnr: number): string =>
        '<a target="_blank" href='
        + this._url + '#range=' + (rnr + 2) + ':' + (rnr + 2) + '>' + s + '</a>'


      const sToZahl = (s: string): number => parseFloat(s.replace('€', '').replace(/\./g, '').replace(',', '.').trim()) || 0

      this.bookings = data1.map((b: any) => new HauptbuchBooking(
        linkTo(b.rowNr, b.rowNr),
        b["Datum"],
        b["Wer"],
        sToZahl(b["km (Endstand)"]),
        sToZahl(b["km"]),
        sToZahl(b["km seit letzter Tankung"]),
        sToZahl(b["Liter getankt"]),
        sToZahl(b["Verbrauch/l"]),
        sToZahl(b["Benzinpreis"]),
        sToZahl(b["Betrag"]),
        b["Was"],
        b["V-Schlüssel"],
        b.rowNr = b.rowNr
      ))
      // logd("hauptbuch.loadBussiData: ", period, this.bookings.length, this.bookings)
    },
    async createBooking(b: HauptbuchBooking): Promise<Response> {
      let response = new Response()
      // I would like to append a row to the google spreadsheet
      logd("hauptbuch.createBooking: ", b)
      const values = b.toSpreadsheetRow()
      logd("Hauptbuch.createBooking: values to send to bussiserver: ", values)

      // send a post request to the bussiserver with the data
      try {
        logd("Hauptbuch.createBooking: trying to send POST request to bussi_server...")
        const url = "/adddata"
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        })
        logd("Hauptbuch.createBooking: response=", await response.clone())
      } catch (error) {
        console.error('Error sending request to bussiserver', error);
      }
      return await response
    },
    async deleteBooking(b: HauptbuchBooking): Promise<Response> {
      let response = new Response()
      logd("hauptbuch.deleteBooking: ", b)
      const values = b.toSpreadsheetRow()
      try {
        logd("Hauptbuch.deleteBooking: trying to send POST request to bussi_server...")
        const url = "/deletebooking"
        response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        })
        logd("Hauptbuch.deleteBooking: response=", await response.clone())
      } catch (error) {
        console.error('Error sending request to bussiserver', error);
      }
      return await response
    }
  },
  getters: {
    url: (state) => state._url,
    hauptbuch: (state) => state.bookings,
  }
})
