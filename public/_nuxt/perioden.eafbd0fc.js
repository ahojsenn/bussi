import{d as i}from"./entry.8de47bc7.js";import{P as a}from"./papaparse.min.23b9f094.js";import{U as s}from"./url.3a8f7686.js";const n=e=>new Promise(function(t,o){a.parse(e,{download:!0,header:!0,skipEmptyLines:!0,complete:t,error:o})}),d="/gviz/tq?tqx=out:csv",p="&sheet=perioden",c=s+d+p,_=i("perioden",{state:()=>({_perioden:[],_currentPeriod:""}),actions:{async loadDataFromGoogle(){const e=await n(c);this._perioden=e.data,this._currentPeriod=this._perioden[0].Periode},setPeriod(e){this._currentPeriod=e}},getters:{reparaturpauschale:e=>r=>e._perioden.find(t=>t.Periode===r).Reparaturpauschale,listOfPeriods:e=>e._perioden.map(r=>r.Periode),currentPeriod:e=>e._currentPeriod}});export{_ as u};
