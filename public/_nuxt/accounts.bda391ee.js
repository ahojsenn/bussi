import{G as a}from"./entry.09756ce5.js";import{P as c}from"./papaparse.min.db388f5c.js";const n=t=>new Promise(function(o,s){c.parse(t,{download:!0,header:!0,skipEmptyLines:!0,complete:o,error:s})}),r="https://docs.google.com/spreadsheets/d/",u="1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M",m="/gviz/tq?tqx=out:csv",i="&sheet=konten",p=r+u+m+i,G=a("accounts",{state:()=>({accounts:[]}),actions:{async loadDataFromGoogle(){const t=await n(p);this.accounts=t.data}},getters:{accountNames:t=>t.accounts.map(e=>e.Name),accountBezeichnungen:t=>t.accounts.map(e=>e.Bezeichnung)}});export{G as u};
