import { _ as _export_sfc, f as __nuxt_component_0$1 } from '../server.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
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

function ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  _push(`<nav${ssrRenderAttrs(mergeProps({ class: "menu" }, _attrs))} data-v-cd599ce7><input class="burger-menu-toggle" id="burger-menu-toggle01" type="checkbox" data-v-cd599ce7><label for="burger-menu-toggle01" data-v-cd599ce7><div class="burger-menu" data-v-cd599ce7><div data-v-cd599ce7></div><span data-v-cd599ce7></span><span data-v-cd599ce7></span><span data-v-cd599ce7></span></div></label><div class="responsive-menu" data-v-cd599ce7><span class="burgerMenuText" data-v-cd599ce7>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`home`);
      } else {
        return [
          createTextVNode("home")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</span><span class="burgerMenuText" data-v-cd599ce7>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/balance" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`balance`);
      } else {
        return [
          createTextVNode("balance")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</span><span class="burgerMenuText" data-v-cd599ce7>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/stakeholder" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`stakeholder`);
      } else {
        return [
          createTextVNode("stakeholder")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</span><span class="burgerMenuText" data-v-cd599ce7>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/accounts" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`accounts`);
      } else {
        return [
          createTextVNode("accounts")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</span><span class="burgerMenuText" data-v-cd599ce7>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/hauptbuch" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`hauptbuch `);
      } else {
        return [
          createTextVNode("hauptbuch ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</span></div></nav>`);
}
const _sfc_main$1 = {};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/navigation.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", ssrRender$1], ["__scopeId", "data-v-cd599ce7"]]);
function ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_navigation = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "background" }, _attrs))}><div class="foreground">`);
  _push(ssrRenderComponent(_component_navigation, null, null, _parent));
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div></div>`);
}
const _sfc_main = {};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-ebf46aae.mjs.map
