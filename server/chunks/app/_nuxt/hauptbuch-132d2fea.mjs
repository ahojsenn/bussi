import { H as HauptbuchBooking } from './types-50913745.mjs';
import { d as defineStore } from '../server.mjs';
import Papa from 'papaparse';
import { u as useAppConfig } from './config-845b9774.mjs';

const appConfig = useAppConfig();
const GURL = "https://docs.google.com/spreadsheets/d/";
const GdataUrl$1 = GURL + appConfig.GKEY;
const URL = GdataUrl$1;
const getDataFromGoogle = (url) => {
  const ret = new Promise(function(resolve, reject) {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    });
  });
  console.log("hauptbuch.getDataFromGoogle: ", ret);
  return ret;
};
const GMAGIC = "/gviz/tq?tqx=out:csv";
const GEDIT = "/edit#gid=1543409034";
const GdataUrl = URL + GMAGIC;
const toEuro = (s) => s.indexOf("\u20AC") > 0 ? s : parseFloat(s == "" ? "0" : s) + " \u20AC";
const useHauptbuchStore = defineStore("hauptbuch", {
  state: () => ({
    bookings: [],
    _url: URL + GEDIT
  }),
  actions: {
    async loadBussiData(period) {
      const gdata = await getDataFromGoogle(GdataUrl);
      let data1 = gdata.data.map((e, i) => {
        e.rowNr = i;
        return e;
      });
      if (Number(period))
        data1 = data1.filter((e) => e["Datum"].substring(0, 4) === period);
      const linkTo = (s, rnr) => '<a target="_blank" href=' + this._url + "#range=" + (rnr + 2) + ":" + (rnr + 2) + ">" + s + "</a>";
      this.bookings = data1.map((b) => new HauptbuchBooking(
        linkTo(b.rowNr, b.rowNr),
        b["Datum"],
        b["Wer"],
        b["km (Endstand)"],
        b["Liter getankt"],
        b["Benzinpreis"],
        toEuro(b["Betrag"]),
        b["Was"],
        b["V-Schl\xFCssel"],
        b["km"],
        b["km seit letzter Tankung"],
        b["Verbrauch/l"]
      ));
    }
  },
  getters: {
    url: (state) => state._url
  }
});

export { URL as U, useHauptbuchStore as u };
//# sourceMappingURL=hauptbuch-132d2fea.mjs.map
