import{_}from"./papaparse.min.71a5bd73.js";import{u as p}from"./stakeholder.e848d068.js";import{u as f}from"./accounts.24718667.js";import{B as k}from"./types.42c77370.js";import{a as B,w as l,b as h,e as S,f as u,u as t,h as d,t as m,o as g}from"./entry.d021a17a.js";const V=B({__name:"accounts",async setup(N){let e,o;const s=f();[e,o]=l(()=>s.loadDataFromGoogle()),await e,o();const a=s.accountNames,n=p();[e,o]=l(()=>n.loadStakeholder()),await e,o();const c=n.stakeholderListe,i=new k(c,a);return(T,w)=>{const r=_;return g(),h("div",null,[S("accounts"),u(r,{selectedBookingsToRender:t(s).accounts},null,8,["selectedBookingsToRender"]),d("div",null,m(t(a)),1),d("div",null,m(t(c)),1),u(r,{selectedBookingsToRender:t(i).accounts},null,8,["selectedBookingsToRender"])])}}});export{V as default};
