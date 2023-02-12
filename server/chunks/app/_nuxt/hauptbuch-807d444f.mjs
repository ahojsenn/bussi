import { _ as __nuxt_component_0 } from './Table-3e4c8c19.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useHauptbuchStore } from './hauptbuch-132d2fea.mjs';
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
import './types-50913745.mjs';
import 'papaparse';
import './config-845b9774.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "hauptbuch",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const hauptbuch = useHauptbuchStore();
    const konto = "Bussi";
    [__temp, __restore] = withAsyncContext(() => hauptbuch.loadBussiData()), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Table = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "width": "90%" } }, _attrs))}>Das Bussi Fahrtenbuch`);
      _push(ssrRenderComponent(_component_Table, {
        selectedBookingsToRender: unref(hauptbuch).bookings,
        konto
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hauptbuch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=hauptbuch-807d444f.mjs.map
