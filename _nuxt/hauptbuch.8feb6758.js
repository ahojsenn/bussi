import{_ as a}from"./papaparse.min.07309ec6.js";import{u as c}from"./hauptbuch.51a821cd.js";import{f as r,w as _,b as u,h as i,e as p,u as m,o as d}from"./entry.c469fa09.js";import"./types.9c14c63d.js";import"./config.147cd9c5.js";const h={style:{width:"90%"}},g=r({__name:"hauptbuch",async setup(l){let e,t;const o=c(),s="Bussi";return[e,t]=_(()=>o.loadBussiData()),await e,t(),(f,b)=>{const n=a;return d(),u("div",h,[i("Das Bussi Fahrtenbuch"),p(n,{selectedBookingsToRender:m(o).bookings,konto:s},null,8,["selectedBookingsToRender"])])}}});export{g as default};