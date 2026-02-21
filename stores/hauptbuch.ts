import { HauptbuchBooking } from './../types';
import { defineStore } from 'pinia'
import Papa from 'papaparse'
import logd from '../utils/logDebug'
import { GSHEET_URL } from '../utils/url'

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
  //logd("hauptbuch.getDataFromGoogle: ", ret)
  return ret
}

/* --- Hilfsfunktionen außerhalb des Stores (Pure Functions) --- */
const sToZahl = (s: string): number =>
  parseFloat(s.replace('€', '').replace(/\./g, '').replace(',', '.').trim()) || 0;

const generateLink = (baseUrl: string, label: string | number, rowNr: number): string => {
  const range = rowNr + 2;
  return `<a target="_blank" href="${baseUrl}#range=${range}:${range}">${label}</a>`;
};

// https://docs.google.com/spreadsheets/d/1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M/edit?gid=1543409034#gid=1543409034

const GMAGIC = '/gviz/tq?tqx=out:csv'
const GEDIT = '/edit#gid=1543409034'
const GSN_sheet = '&sheet=Fahrtenbuch'
const GdataUrl = GSHEET_URL + GMAGIC + GSN_sheet

export const useHauptbuchStore = defineStore('hauptbuch', {
  state: () => ({
    bookings: [] as Array<HauptbuchBooking>,
    _url: URL + GEDIT,
    access_token: ""
  }),
  actions: {
    async loadHauptbuch(period?: string) {

      // logd("hauptbuch.loadHauptbuch: ", period, GdataUrl)
      const gdata = await getDataFromGoogle(GdataUrl)
      // console.log("hauptbuch.loadHauptbuch: ", period, gdata.data.length, gdata.data)

      // 1. Data Sanitization - add rowNr to the raw dataset before any filters are applied
      // for Debug purposes load only the first 10 entries, if Limit <= 0, load all entries
      const Limit = 0 // set to 0 to load all entries, or set to a positive number 
      let rawData = gdata.data.map((row: any, index: number) => ({
        ...row,
        rowNr: index
      }));
      if (Limit > 0) {
        rawData = rawData.slice(0, Limit);
      }

      // 2. Refined Filtering Logic
      if (period && !isNaN(Number(period))) {
        rawData = rawData.filter((e: any) => e["Datum"]?.startsWith(period));
      } else if (period?.includes('bis')) {
        const cutoffYear = period.split('bis')[1].trim();
        rawData = rawData.filter((e: any) => e["Datum"]?.substring(0, 4) <= cutoffYear);
      }

      // 3. Mapping with a formal Constructor
      this.bookings = rawData.map((b: any) => {
        const rowRef = b.rowNr + 2;
        const link = `<a target="_blank" href="${this._url}#range=${rowRef}:${rowRef}">${b.rowNr}</a>`;
        /* create a ling in the text filed >*/
        const linkTo = (s: string, rnr: number): string =>
          '<a target="_blank" href='
          + this._url + '#range=' + (rnr + 2) + ':' + (rnr + 2) + '>' + s + '</a>'
      })


      this.bookings = rawData.map((b: any) => new HauptbuchBooking(
        generateLink(this._url, b.rowNr, b.rowNr), // Jetzt sauber zugreifbar
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
      // logd("hauptbuch.loadHauptbuch: ", period, this.bookings.length, this.bookings)
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
