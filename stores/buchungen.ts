import { HauptbuchBooking } from './../mixins/types';
import { defineStore } from 'pinia'


/*
0 "Datum"
1 "Wer"
2 "km (Endstand)"
3 "km"
4 "km seit letzter Tankung"
5 "Liter getankt"
6 "Verbrauch/l"
7 "Benzin↵preis"
8 "Amount"
9 "Was"
10 "V-Schlüssel"
*/
//https://docs.google.com/spreadsheets/d/1xkTQDGJkq9UKvZfFJTEK_W1EdM2AAy7xIFikxTCGhnk/edit#gid=1039570943&range=5490:5490

const parseHauptbuch = (data: Array<any>, url: string): Array<HauptbuchBooking> => data.map(value => {
  return {
    nr: '<a target="_blank" href=' + url + '#range=' + (value.rowNr + 2) + ':' + (value.rowNr + 2) + '>' + value.rowNr + '</a>',
    date: value["Datum"],
    account: value["Wer"],
    km: value["km (Endstand)"],
    kmSinceLastEntry: value["km"],
    kmSinceLastFuelFill: value["km seit letzter Tankung"],
    liters: value["Liter getankt"],
    consumption: value["Verbrauch/l"],
    fuelPriceInEuro: value["Benzin↵preis"],
    amount: value["Amount"],
    description: value["Was"],
    key: value["V-Schlüssel"],
    rowNr: value.rowNr,
  }
})


export const useBuchungenStore = defineStore('buchungen', {
  state: () => {
    return {
      bookings: [] as Array<HauptbuchBooking>,
    }
  },
  actions: {
    loadData(data: Array<any>, url: string) {
      //console.log("buchungen.loadData")
      this.bookings = parseHauptbuch(data, url)
    },
  },
})
