import{_ as n}from"./papaparse.min.c13abb20.js";import{u as s}from"./hauptbuch.bc529629.js";import{f as c,j as r,q as u,b as p,h as i,e as d,u as _,o as l,I as m}from"./entry.fd38c6db.js";import"./types.3d83ab55.js";const y=c({__name:"hauptbuch",setup(h){const t=r(s()),a="Hauptbuch",e=m(),o=async()=>{await t.loadBussiData(),e&&e.proxy&&await e.proxy.$forceUpdate()};return u(async()=>await o()),(f,b)=>(l(),p("div",null,[i("Das Bussi Fahrtenbuch"),d(n,{selectedBookingsToRender:_(t).bookings,konto:a},null,8,["selectedBookingsToRender"])]))}});export{y as default};
