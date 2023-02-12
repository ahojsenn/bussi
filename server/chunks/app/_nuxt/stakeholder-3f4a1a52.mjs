import { l as logd$1, _ as __nuxt_component_0 } from './Table-3e4c8c19.mjs';
import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useStakeholderStore } from './stakeholder-9eb935ef.mjs';
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
  __name: "stakeholder",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const kstore = useStakeholderStore();
    [__temp, __restore] = withAsyncContext(() => kstore.loadStakeholder()), await __temp, __restore();
    logd$1("accounts: kstore loaded: ", kstore);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Table = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>stakeholder`);
      _push(ssrRenderComponent(_component_Table, {
        selectedBookingsToRender: unref(kstore).stakeholder
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/stakeholder.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=stakeholder-3f4a1a52.mjs.map
