import{_}from"./papaparse.min.96047ca9.js";import{u as p}from"./stakeholder.cdc96c04.js";import{u as f}from"./accounts.236391cf.js";import{B as k}from"./types.9c14c63d.js";import{f as B,w as l,b as h,h as S,e as u,u as t,i as d,t as i,o as g}from"./entry.c67d78e3.js";const V=B({__name:"accounts",async setup(N){let e,o;const s=f();[e,o]=l(()=>s.loadDataFromGoogle()),await e,o();const a=s.accountNames,n=p();[e,o]=l(()=>n.loadStakeholder()),await e,o();const c=n.stakeholderListe,m=new k(c,a);return(T,w)=>{const r=_;return g(),h("div",null,[S("accounts"),u(r,{selectedBookingsToRender:t(s).accounts},null,8,["selectedBookingsToRender"]),d("div",null,i(t(a)),1),d("div",null,i(t(c)),1),u(r,{selectedBookingsToRender:t(m).accounts},null,8,["selectedBookingsToRender"])])}}});export{V as default};