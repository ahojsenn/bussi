import { _ as __nuxt_component_0 } from './Table-3e4c8c19.mjs';
import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useStakeholderStore } from './stakeholder-9eb935ef.mjs';
import { u as useAccountsStore } from './accounts-8e30c590.mjs';
import { B as BussiAccountSystem } from './types-50913745.mjs';
import '../server.mjs';
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
import 'papaparse';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "accounts",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const aStore = useAccountsStore();
    [__temp, __restore] = withAsyncContext(() => aStore.loadDataFromGoogle()), await __temp, __restore();
    const accountNames = aStore.accountNames;
    const shStore = useStakeholderStore();
    [__temp, __restore] = withAsyncContext(() => shStore.loadStakeholder()), await __temp, __restore();
    const stakeholderNames = shStore.stakeholderListe;
    const as = new BussiAccountSystem(stakeholderNames, accountNames);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Table = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>accounts`);
      _push(ssrRenderComponent(_component_Table, {
        selectedBookingsToRender: unref(aStore).accounts
      }, null, _parent));
      _push(`<div>${ssrInterpolate(unref(accountNames))}</div><div>${ssrInterpolate(unref(stakeholderNames))}</div>`);
      _push(ssrRenderComponent(_component_Table, {
        selectedBookingsToRender: unref(as).accounts
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=accounts-55bfe543.mjs.map
