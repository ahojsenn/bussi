import{H as i}from"./types.41cc74b9.js";import{E as u}from"./entry.f9d1b401.js";import{P as c}from"./papaparse.min.f731461a.js";import{u as p}from"./config.4db235a3.js";const m=p(),g="https://docs.google.com/spreadsheets/d/",l=g+m.GKEY,s=l,d=a=>new Promise(function(o,e){c.parse(a,{download:!0,header:!0,skipEmptyLines:!0,complete:o,error:e})}),f="/gviz/tq?tqx=out:csv",h="/edit#gid=1543409034",k=s+f,G=a=>a.indexOf("€")>0?a:parseFloat(a==""?"0":a)+" €",B=u("hauptbuch",{state:()=>({bookings:[],_url:s+h}),actions:{async loadBussiData(a){let o=(await d(k)).data.map((t,r)=>(t.rowNr=r,t));Number(a)&&(o=o.filter(t=>t.Datum.substring(0,4)===a));const e=(t,r)=>'<a target="_blank" href='+this._url+"#range="+(r+2)+":"+(r+2)+">"+t+"</a>";this.bookings=o.map(t=>new i(e(t.rowNr,t.rowNr),t.Datum,t.Wer,t["km (Endstand)"],t["Liter getankt"],t.Benzinpreis,G(t.Betrag),t.Was,t["V-Schlüssel"],t.km,t["km seit letzter Tankung"],t["Verbrauch/l"]))}},getters:{url:a=>a._url}});export{s as U,B as u};