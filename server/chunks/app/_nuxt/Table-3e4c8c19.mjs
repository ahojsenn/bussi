import { _ as _export_sfc, u as useRoute, a as useRouter } from '../server.mjs';
import { useSSRContext, defineComponent, reactive, ref, watch, unref } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';

let STARTTIME = /* @__PURE__ */ new Date();
const logd = (s, ...s1) => {
  {
    const delay = (/* @__PURE__ */ new Date()).getTime() - STARTTIME.getTime();
    console.log(delay + "ms: " + s, ...s1);
  }
};
const logd$1 = logd;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Table",
  __ssrInlineRender: true,
  props: {
    konto: {
      type: String
      //default: 'kontoname',
    },
    selectedBookingsToRender: {
      type: Array
      //default: Function, // new Array(),
    },
    showSum: Boolean
  },
  setup(__props) {
    const props = __props;
    const ROWSPERPAGE = 500;
    const md = reactive({
      filters: [],
      currentRow: {},
      aggregate: [],
      rows: props.selectedBookingsToRender
    });
    const data = props.selectedBookingsToRender;
    ref(true);
    let newFilter = "";
    const rowsPerPage = ROWSPERPAGE;
    let pageNr = 0;
    useRoute();
    useRouter();
    const col = {};
    const filters = [];
    watch(md.filters, () => logd$1("some changed", md.filters));
    const pages = function() {
      return Math.round(data.length / ROWSPERPAGE);
    };
    const setPage = function(pgnr) {
      md.rows = props.selectedBookingsToRender.filter(
        (row, i) => i >= (pgnr - 1) * ROWSPERPAGE && i < pgnr * ROWSPERPAGE
      );
      pageNr = pgnr;
    };
    const prettyJSON = function(value) {
      return JSON.stringify(value, void 0, 2).replace(/\n/g, "<br>").replace(/[ ]/g, "&nbsp;");
    };
    const columns = function() {
      if (md.rows === void 0)
        return [];
      else
        return md.rows.length === 0 ? [] : Object.keys(md.rows[0]).filter(
          (d) => !"Net FileCreated Steuer Year Month".includes(d)
        );
    };
    const euro = function(x) {
      return x.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        style: "currency",
        currency: "EUR"
      });
    };
    const euroStringToNumber = (x) => +x.replace("\u20AC", "").replace(".", "").replace(",", ".").trim();
    const sumRow = function sum2(title) {
      let mySum = 0;
      md.rows.forEach(function(row) {
        mySum += +row[title];
      });
      return Math.round(100 * mySum) / 100;
    };
    const sumEuro = function sumEuro2(title) {
      let mySum = 0;
      if (md.rows === void 0)
        return "";
      md.rows.forEach(function(row) {
        if (row[title] === void 0)
          return;
        mySum += euroStringToNumber(row[title]);
      });
      mySum = Math.round(1e3 * mySum) / 1e3;
      if (isNaN(mySum)) {
        return "";
      }
      const mySumString = mySum.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        style: "currency",
        currency: "EUR"
      });
      return mySumString;
    };
    setPage(1);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ca5c4a61>`);
      if (columns().length > 0 || filters.length > 0) {
        _push(`<div data-v-ca5c4a61><div data-v-ca5c4a61><b data-v-ca5c4a61>${ssrInterpolate(__props.konto)}: ${ssrInterpolate(md.rows.length)} Eintr\xE4ge</b><br data-v-ca5c4a61>`);
        if (pages() > 1) {
          _push(`<div data-v-ca5c4a61><br data-v-ca5c4a61><span data-v-ca5c4a61><button${ssrIncludeBooleanAttr(unref(pageNr) == -1) ? " disabled" : ""} data-v-ca5c4a61>show all ${ssrInterpolate(unref(data).length)} entries</button></span><span data-v-ca5c4a61><!--[-->`);
          ssrRenderList(pages(), (pagenr, i) => {
            _push(`<button${ssrIncludeBooleanAttr(pagenr == unref(pageNr)) ? " disabled" : ""} data-v-ca5c4a61>${ssrInterpolate((pagenr - 1) * unref(rowsPerPage) + 1)}..${ssrInterpolate(pagenr * unref(rowsPerPage))}</button>`);
          });
          _push(`<!--]--></span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<br data-v-ca5c4a61><input${ssrRenderAttr("value", unref(newFilter))} placeholder="&lt;enter&gt; new filter" data-v-ca5c4a61><input type="submit" value="set filter" data-v-ca5c4a61>`);
        if (md.filters[0]) {
          _push(`<span data-v-ca5c4a61><br data-v-ca5c4a61>filters:</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(md.filters, (filter) => {
          _push(`<span class="filter" data-v-ca5c4a61>`);
          if (filter.isAnti == true) {
            _push(`<span class="isAntiFilter" data-v-ca5c4a61>${ssrInterpolate(filter.title)}: ${ssrInterpolate(filter.value)}</span>`);
          } else {
            _push(`<span class="isFilter" data-v-ca5c4a61>${ssrInterpolate(filter.title)}: ${ssrInterpolate(filter.value)}</span>`);
          }
          _push(`</span>`);
        });
        _push(`<!--]--></div><div id="popup" data-v-ca5c4a61>${prettyJSON(md.currentRow)}</div><table id="mytable" data-v-ca5c4a61><thead data-v-ca5c4a61><!--[-->`);
        ssrRenderList(columns(), (col2, i) => {
          _push(`<th data-v-ca5c4a61><div data-v-ca5c4a61>${ssrInterpolate(col2)}`);
          if (i === columns().length - 1) {
            _push(`<span data-v-ca5c4a61><input class="right" type="submit" value="\u29C9copy" data-v-ca5c4a61></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<br data-v-ca5c4a61>`);
          if ("kmSinceLastEntry Amount haben soll".indexOf(col2) > -1) {
            _push(`<span data-v-ca5c4a61>${ssrInterpolate(sumRow(col2))}</span>`);
          } else {
            _push(`<span data-v-ca5c4a61>\xA0</span>`);
          }
          _push(`</div>`);
          {
            _push(`<button class="${ssrRenderClass({ active: md.aggregate.indexOf(col2) > -1 })}" data-v-ca5c4a61>&lt;==&gt;</button>`);
          }
          _push(`</th>`);
        });
        _push(`<!--]--></thead><tbody data-v-ca5c4a61><!--[-->`);
        ssrRenderList(md.rows, (row) => {
          _push(`<tr data-v-ca5c4a61><!--[-->`);
          ssrRenderList(columns(), (col2, colnr) => {
            _push(`<td onmouseout="document.getElementById(&#39;popup&#39;).style.display = &#39;none&#39;" class="${ssrRenderClass({ hilight: row["Name"] == "7 ErgebnisNachSteuern", underaccountrow: row["Type"] == "Unterkonto", greylight: row["Name"] && row["Name"].includes("Steuer:") })}" data-v-ca5c4a61><div data-v-ca5c4a61>`);
            if (col2 == "Name") {
              _push(`<span class="${ssrRenderClass({ underaccountcell: row["Type"] == "Unterkonto" })}" data-v-ca5c4a61><a${ssrRenderAttr("href", "?report=account&id=" + encodeURIComponent(row.Account_Link))} data-v-ca5c4a61>${row[col2].toLocaleString("de-DE", { minimumFractionDigits: 2, style: "currency", currency: "EUR" })}</a></span>`);
            } else if ("Revenue Netto Advances Internals Sales Project Commission Taxes Saldo Costs Saldo Amount Balance AnteilAusFaktura AnteilAusFairshares KMDarlehen Aktiva Passiva Rest Salesprv ".indexOf(col2) > -1) {
              _push(`<span style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ca5c4a61>${euro(row[col2])}</span>`);
            } else {
              _push(`<span data-v-ca5c4a61>${row[col2]}</span>`);
            }
            _push(`</div></td>`);
          });
          _push(`<!--]--></tr>`);
        });
        _push(`<!--]--></tbody><tfoot data-v-ca5c4a61><tr data-v-ca5c4a61>`);
        if (col != "Account_Link") {
          _push(`<!--[-->`);
          ssrRenderList(columns(), (col2) => {
            _push(`<th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ca5c4a61>`);
            if (__props.showSum && "Netto Saldo Amount Psoll Phaben".indexOf(col2) > -1) {
              _push(`<span data-v-ca5c4a61>${ssrInterpolate(sumEuro(col2))}</span>`);
            } else {
              _push(`<span data-v-ca5c4a61>\xA0</span>`);
            }
            _push(`</th>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tr></tfoot></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ca5c4a61"]]);

export { __nuxt_component_0 as _, logd$1 as l };
//# sourceMappingURL=Table-3e4c8c19.mjs.map
