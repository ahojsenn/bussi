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
const GSN_sheet = "&sheet=stakeholder";
const GdataUrl = GURL + GKEY + GMAGIC + GSN_sheet;
const useStakeholderStore = defineStore("stakeholder", {
  state: () => ({
    stakeholder: []
  }),
  actions: {
    async loadStakeholder() {
      const gdata = await getDataFromGoogle(GdataUrl);
      this.stakeholder = gdata.data;
    }
  },
  getters: {
    stakeholderListe: (state) => state.stakeholder.map((s) => s["Name"]),
    personen: (state) => state.stakeholder.filter((s) => s["Name"] && s["Verteilung"].indexOf(",") === -1 && s["Name"] !== "Bussi").map((s) => s["Name"]),
    shVerteilung: (state) => function(shName) {
      return state.stakeholder.find((s) => s["Name"] == shName)["Verteilung"];
    }
  }
});

export { useStakeholderStore as u };
//# sourceMappingURL=stakeholder-9eb935ef.mjs.map
