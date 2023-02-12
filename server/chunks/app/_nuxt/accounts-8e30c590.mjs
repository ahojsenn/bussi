import { d as defineStore } from '../server.mjs';
import Papa from 'papaparse';

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
  return ret;
};
const GURL = "https://docs.google.com/spreadsheets/d/";
const GKEY = "1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M";
const GMAGIC = "/gviz/tq?tqx=out:csv";
const GSN_sheet = "&sheet=konten";
const GdataUrl = GURL + GKEY + GMAGIC + GSN_sheet;
const useAccountsStore = defineStore("accounts", {
  state: () => ({
    accounts: []
  }),
  actions: {
    async loadDataFromGoogle() {
      const gdata = await getDataFromGoogle(GdataUrl);
      this.accounts = gdata.data;
    }
  },
  getters: {
    accountNames: (state) => state.accounts.map((s) => s["Name"]),
    accountBezeichnungen: (state) => state.accounts.map((s) => s["Bezeichnung"])
  }
});

export { useAccountsStore as u };
//# sourceMappingURL=accounts-8e30c590.mjs.map
