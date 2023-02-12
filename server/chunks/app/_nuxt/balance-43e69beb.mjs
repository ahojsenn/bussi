import { useSSRContext, defineComponent, withAsyncContext, mergeProps, unref, reactive, getCurrentInstance, watch } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { d as defineStore, _ as _export_sfc } from '../server.mjs';
import Papa from 'papaparse';
import { U as URL, u as useHauptbuchStore } from './hauptbuch-132d2fea.mjs';
import { l as logd$1, _ as __nuxt_component_0 } from './Table-3e4c8c19.mjs';
import { u as useStakeholderStore } from './stakeholder-9eb935ef.mjs';
import { B as BussiAccountSystem, a as Booking } from './types-50913745.mjs';
import { u as useAccountsStore } from './accounts-8e30c590.mjs';
import 'ofetch';
import 'hookable';
import 'unctx';
import 'ufo';
import 'h3';
import '@unhead/vue';
import '@unhead/dom';
import '@unhead/ssr';
import 'vue-router';
import 'defu';
import '../../nitro/config.mjs';
import 'destr';
import 'scule';
import './config-845b9774.mjs';

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
const GMAGIC = "/gviz/tq?tqx=out:csv";
const GSN_sheet = "&sheet=perioden";
const GdataUrl = URL + GMAGIC + GSN_sheet;
const usePeriodenStore = defineStore("perioden", {
  state: () => ({
    _perioden: [],
    _currentPeriod: ""
  }),
  actions: {
    async loadDataFromGoogle() {
      const gdata = await getDataFromGoogle(GdataUrl);
      this._perioden = gdata.data;
      this._currentPeriod = this._perioden[0]["Periode"];
    },
    setPeriod(p) {
      this._currentPeriod = p;
    }
  },
  getters: {
    reparaturpauschale: (state) => (periodstr) => {
      return state._perioden.find((p) => p["Periode"] === periodstr)["Reparaturpauschale"];
    },
    listOfPeriods: (state) => state._perioden.map((p) => p["Periode"]),
    currentPeriod: (state) => state._currentPeriod
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "YearSwitch",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const periods = usePeriodenStore();
    [__temp, __restore] = withAsyncContext(() => periods.loadDataFromGoogle()), await __temp, __restore();
    const years = periods.listOfPeriods;
    periods.currentPeriod;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ id: "my-global" }, _attrs))}><span>Welches Jahr m\xF6chtest du sehen?<select><!--[-->`);
      ssrRenderList(unref(years), (p) => {
        _push(`<option>${ssrInterpolate(p)}</option>`);
      });
      _push(`<!--]--></select></span></form>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/YearSwitch.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const book = (bk, from, to) => {
  if (bk === null)
    return;
  const bk1 = new Booking(bk.nr, bk.date, bk.soll, bk.haben, bk.description, bk.kmStart);
  const bk2 = new Booking(bk.nr, bk.date, bk.haben, bk.soll, bk.description, bk.kmStart);
  from.bookings.push(bk1);
  to.bookings.push(bk2);
};
const bookingIsTanken = (booking) => +(booking.kmSinceLastFuelFill || "0") != 0 || "Tanken".indexOf(booking.description) > 0;
const euroToNumber = (e) => typeof e === "string" ? parseFloat(e.replaceAll(".", "").replace("\u20AC", "").trim().replace(",", ".")) : Number.isNaN(e) ? 0 : e;
const liter = (b) => bookingIsTanken(b) ? +b.liters.replace("l", "").trim().replace(",", ".") : 0;
const berechneVerbrauch = (l, km) => Math.round(100 * 100 * l / km) / 100;
const kmPerFill = (b) => parseFloat(b.kmSinceLastFuelFill || "0");
let benzinpreis = 0;
let verbrauch = 0;
const bookEverythingtoBS = (bs, allBookingsOfPeriod, shStore, perioden) => {
  logd$1("bookEverythingtoBS: ", perioden.currentPeriod);
  for (var booking of allBookingsOfPeriod) {
    let bookingWasUsed = false;
    const splits = shStore.shVerteilung(booking.account).split(",");
    splits.length > 1;
    for (var split of splits) {
      const splitAccount = split.trim();
      const reparatur = (b) => +b.key > 0;
      if (reparatur(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 3");
        const to = bs.findAccount("Bussi", "Konto 3");
        const betrag = euroToNumber(booking.amount) / splits.length;
        const text = booking.account + " Reparatur " + booking.description + " " + betrag + " " + booking.amount;
        const bk = new Booking(
          booking.nr,
          booking.date,
          0,
          betrag,
          text,
          +booking.km - +(booking.kmSinceLastEntry || "0")
        );
        book(bk, from, to);
        bookingWasUsed = true;
      }
      if (bookingIsTanken(booking)) {
        const amount = Math.round(100 * euroToNumber(booking.amount)) / 100;
        benzinpreis = Math.round(1e3 * amount / liter(booking)) / 1e3;
        verbrauch = berechneVerbrauch(liter(booking), kmPerFill(booking));
        const from = bs.findAccount("Bussi", "Konto 2");
        const to = bs.findAccount(splitAccount, "Konto 2");
        const text = booking.account + ": Tanken f\xFCr " + amount + "\u20AC, " + liter(booking) + " Liter, <br> Verbrauch: " + verbrauch + " l/100km, <br>" + splitAccount + "-->Bussi<br>Benzinpreis: " + benzinpreis + " \u20AC/l";
        const betrag = euroToNumber(booking.amount) / splits.length;
        const bk = new Booking(booking.nr, booking.date, betrag, 0, text);
        book(bk, from, to);
        bookingWasUsed = true;
      }
      const kilometerWurdenGefahren = (b) => parseFloat(b.kmSinceLastEntry + "") != 0;
      if (kilometerWurdenGefahren(booking)) {
        const from = bs.findAccount(splitAccount, "Kilometer");
        const to = bs.findAccount("Bussi", "Kilometer");
        const km = parseFloat(booking.kmSinceLastEntry || "0") / splits.length;
        const kmEnde = +booking.km;
        kmEnde - parseFloat(booking.kmSinceLastEntry || "0");
        const benzingeld = Math.round(benzinpreis * km * verbrauch) / 100;
        const reppausch = Math.round(100 * +perioden.reparaturpauschale(perioden.currentPeriod).replace(",", ".") * km) / 100;
        const text = booking.account + " Kilometer " + km + " von " + booking.kmSinceLastEntry + " km, " + splitAccount + "-->Bussi " + booking.description + "<br>Benzingeld: " + benzingeld + " \u20AC, Reparaturgeld: " + reppausch + " \u20AC f\xFCr " + km + " km";
        const bk = new Booking(booking.nr, booking.date, km, 0, text);
        book(bk, from, to);
        bookingWasUsed = true;
        const from1 = bs.findAccount(splitAccount, "Konto 2");
        const to1 = bs.findAccount("Bussi", "Konto 2");
        const text1 = "Benzingeld: " + benzingeld + " \u20AC f\xFCr " + km + " km, Benzinpreis: " + benzinpreis + "\u20AC/L, Verbrauch: " + verbrauch + " ergibt: " + Math.round(benzinpreis * verbrauch) / 100 + " \u20AC/km";
        const bk1 = new Booking(booking.nr, booking.date, benzingeld, 0, text1);
        book(bk1, from1, to1);
        const from2 = bs.findAccount("Bussi", "Konto 3");
        const to2 = bs.findAccount(splitAccount, "Konto 3");
        const bk2 = new Booking(
          booking.nr,
          booking.date,
          0,
          reppausch,
          "Reparaturpauschale " + perioden.reparaturpauschale(perioden.currentPeriod) + " \u20AC/km * " + km + " km = " + reppausch + " \u20AC : " + splitAccount + " --> Bussi"
        );
        book(bk2, from2, to2);
      }
      const nutzungsunabhaengig = (b) => b.key === "gleich";
      if (nutzungsunabhaengig(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 1");
        const to = bs.findAccount("Bussi", "Konto 1");
        const betrag = euroToNumber(booking.amount) / splits.length;
        const text = booking.account + " Konto 1 " + booking.description + " " + betrag + " " + booking.amount;
        const bk = new Booking(booking.nr, booking.date, 0, betrag, text, +booking.km);
        book(bk, from, to);
        bookingWasUsed = true;
      }
      const isAusgleichszahlung = (b) => {
        const receipient = booking && booking.key && typeof booking.key === "string" && booking.key.split(" ").length > 0 ? booking.key.split(" ")[1] : "";
        return b.key.split(" ")[0] === "an" && receipient !== "" && (receipient === "Bussi" || shStore.personen.indexOf(receipient) >= 0);
      };
      if (isAusgleichszahlung(booking)) {
        const from = bs.findAccount(splitAccount, "Ausgleichskonto");
        const receipient = booking.key.split(" ")[1];
        const to = bs.findAccount(receipient, "Ausgleichskonto");
        const text = booking.account + "-->" + receipient + ": " + booking.description + " " + euroToNumber(booking.amount) + " " + booking.amount;
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km);
        book(bk, from, to);
        bookingWasUsed = true;
      }
      if (euroToNumber(booking.amount) === 0 && +(booking.kmSinceLastEntry || "0") === 0) {
        bookingWasUsed = true;
        logd$1("Nullbuchung ignoriert: ", booking);
      }
      if (!bookingWasUsed) {
        logd$1("Fehler: ", booking, isAusgleichszahlung(booking));
        const from = bs.findAccount("System", "Errors");
        const to = bs.findAccount("System", "Errors1");
        const text = booking.account + " Konto 1 " + booking.description + " <br> amount:" + booking.amount + " " + euroToNumber(booking.amount) + "<br> kmSinceLastEntry:" + booking.kmSinceLastEntry + "<br> splits:" + splits + "<br> booking:" + JSON.stringify(booking);
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km);
        book(bk, from, to);
      }
    }
  }
  return bs;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "balance",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toRender = reactive({
      bookings: [],
      name: ""
    });
    const shStore = useStakeholderStore();
    [__temp, __restore] = withAsyncContext(() => shStore.loadStakeholder()), await __temp, __restore();
    const stakeholderNames = shStore.stakeholder.filter((e) => e.Verteilung.indexOf(",") === -1).map((k) => k.Verteilung);
    const perioden = usePeriodenStore();
    [__temp, __restore] = withAsyncContext(() => perioden.loadDataFromGoogle()), await __temp, __restore();
    logd$1("balance.currentPeriod ", perioden.currentPeriod, perioden);
    const hauptbuch = useHauptbuchStore();
    const accountStore = useAccountsStore();
    [__temp, __restore] = withAsyncContext(() => accountStore.loadDataFromGoogle()), await __temp, __restore();
    accountStore.accountBezeichnungen;
    const accountNames = accountStore.accountNames;
    let allBookingsOfPeriod = reactive(hauptbuch.bookings);
    let bs = reactive(new BussiAccountSystem(stakeholderNames, accountNames, allBookingsOfPeriod));
    bs.findAccount("System", "Errors");
    const vueInstance = getCurrentInstance();
    watch(
      // reload the whole dammned thing
      perioden.$state,
      async (previous, current) => {
        await hauptbuch.loadBussiData(perioden.currentPeriod);
        allBookingsOfPeriod = reactive(hauptbuch.bookings);
        bs = new BussiAccountSystem(stakeholderNames, accountNames, allBookingsOfPeriod);
        bs = bookEverythingtoBS(bs, allBookingsOfPeriod, shStore, perioden);
        bs = balanceKonto1(bs, allBookingsOfPeriod, shStore, perioden);
        if (vueInstance && vueInstance.proxy)
          vueInstance.proxy.$forceUpdate();
        toRender.bookings = [];
        toRender.name = "";
      }
    );
    const allKm = () => bs.findAccount("Bussi", "Kilometer").saldoY(perioden.currentPeriod);
    const allLiter = () => Math.round(allBookingsOfPeriod.reduce((acc, b) => acc + liter2(b), 0));
    const tonnenCO2 = () => Math.round(100 * allLiter() * 2.37 / 1e3) / 100;
    const verbrauchOverall = () => Math.round(allLiter() / allKm() * 1e4) / 100;
    const liter2 = (b) => bookingIsTanken2(b) ? +b.liters.replace("l", "").trim().replace(",", ".") : 0;
    const bookingIsTanken2 = (booking) => +(booking.kmSinceLastFuelFill || "0") !== 0 || "Tanken".indexOf(booking.description) > 0;
    logd$1("bs after bookEverythingtoBS", bs);
    const balanceKonto1 = (bs2, allBookingsOfPeriod2, shStore2, perioden2) => {
      const from = bs2.findAccount("Bussi", "Konto 1");
      const amount = -from.saldoY(perioden2.currentPeriod) / shStore2.personen.length;
      for (var tn of shStore2.personen) {
        const to = bs2.findAccount(tn, "Konto 1");
        const b = new Booking(
          "9999",
          perioden2.currentPeriod + "-12-31",
          0,
          amount,
          "Ausgleichsbuchung Konto1 " + perioden2.currentPeriod + " " + from.owner + ":" + from.name + " -> " + to.owner + ":" + to.name
        );
        book(b, from, to);
      }
      return bs2;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_YearSwitch = _sfc_main$1;
      const _component_Table = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-7b6d2f89>`);
      _push(ssrRenderComponent(_component_YearSwitch, null, null, _parent));
      _push(`<h1 data-v-7b6d2f89>Bilanz ${ssrInterpolate(unref(perioden).currentPeriod)}, ${ssrInterpolate(unref(allBookingsOfPeriod).length)} Buchungen </h1>`);
      if (unref(bs).findAccount("Bussi", "Errors").bookings.length > 0) {
        _push(`<div data-v-7b6d2f89><a class="errors" href="#" data-v-7b6d2f89> Errors: ${ssrInterpolate(unref(bs).findAccount("Bussi", "Errors").bookings.length)}</a></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div data-v-7b6d2f89>Kilometer: ${ssrInterpolate(allKm())} km</div><div data-v-7b6d2f89>Benzin: ${ssrInterpolate(allLiter())} Liter</div><div data-v-7b6d2f89>CO2: ${ssrInterpolate(tonnenCO2())} Tonnen CO2 </div><div data-v-7b6d2f89>Verbrauch: ${ssrInterpolate(verbrauchOverall())} Liter/100km</div><div data-v-7b6d2f89>Reparaturpauschale: ${ssrInterpolate(unref(perioden).reparaturpauschale("2022"))}\u20AC</div><div data-v-7b6d2f89>\xA0</div>`);
      if (toRender.bookings.length != 0) {
        _push(`<div data-v-7b6d2f89><div class="center" data-v-7b6d2f89><button class="green" data-v-7b6d2f89>hit \u2318+&lt;Enter&gt; to go back</button>`);
        if (toRender.bookings.length > 0) {
          _push(`<div data-v-7b6d2f89></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_Table, {
          selectedBookingsToRender: toRender.bookings,
          konto: toRender.name
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div data-v-7b6d2f89><table data-v-7b6d2f89><!--[-->`);
        ssrRenderList(unref(stakeholderNames), (sh) => {
          _push(`<tr data-v-7b6d2f89><td data-v-7b6d2f89>${ssrInterpolate(sh)}<a href="#" data-v-7b6d2f89><div data-v-7b6d2f89>Kilometer: ${ssrInterpolate(Math.abs(unref(bs).findAccount(sh, "Kilometer").saldoY(unref(perioden).currentPeriod)))} km</div></a><div data-v-7b6d2f89><b data-v-7b6d2f89>Saldo: ${ssrInterpolate(unref(bs).saldierenEuro(sh))} \u20AC</b></div></td><td data-v-7b6d2f89><table class="inner" style="${ssrRenderStyle({ width: "100%" })}" data-v-7b6d2f89><th class="inner" data-v-7b6d2f89>Kontobezeichnung </th><th class="inner" data-v-7b6d2f89>Saldo </th><th class="inner grey" data-v-7b6d2f89>Soll</th><th class="inner grey" data-v-7b6d2f89>Haben</th><!--[-->`);
          ssrRenderList(unref(accountStore).accounts.filter((acc) => acc.Name !== "Kilometer"), (a) => {
            _push(`<tr class="inner" data-v-7b6d2f89><td class="inner" data-v-7b6d2f89><a href="#" data-v-7b6d2f89><span data-v-7b6d2f89>${ssrInterpolate(a.Bezeichnung)}</span></a><span data-v-7b6d2f89> \xA0\xA0\xA0\xA0</span></td><td class="inner" data-v-7b6d2f89>${ssrInterpolate(unref(bs).findAccount(sh, a.Name).saldoY(unref(perioden).currentPeriod))}</td><td class="inner grey" data-v-7b6d2f89>${ssrInterpolate(unref(bs).findAccount(sh, a.Name).saldoSoll(unref(perioden).currentPeriod))}</td><td class="inner grey" data-v-7b6d2f89>${ssrInterpolate(unref(bs).findAccount(sh, a.Name).saldoHaben(unref(perioden).currentPeriod))}</td></tr>`);
          });
          _push(`<!--]--></table></td></tr>`);
        });
        _push(`<!--]--></table></div>`);
      }
      _push(`<br data-v-7b6d2f89><br data-v-7b6d2f89></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/balance.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const balance = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7b6d2f89"]]);

export { balance as default };
//# sourceMappingURL=balance-43e69beb.mjs.map
