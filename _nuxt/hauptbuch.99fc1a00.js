import{H as i}from"./types.3d83ab55.js";import{G as u}from"./entry.8f8fde29.js";import{U as n,P as l}from"./url.da8cc794.js";const c=a=>{const o=new Promise(function(e,s){l.parse(a,{download:!0,header:!0,skipEmptyLines:!0,complete:e,error:s})});return console.log("hauptbuch.getDataFromGoogle: ",o),o},m="/gviz/tq?tqx=out:csv",g="/edit#gid=1543409034",p=n+m,d=a=>a.indexOf("€")>0?a:parseFloat(a==""?"0":a)+" €",w=u("hauptbuch",{state:()=>({bookings:[],_url:n+g}),actions:{async loadBussiData(a){let e=(await c(p)).data.map((t,r)=>(t.rowNr=r,t));if(Number(a)&&(e=e.filter(t=>t.Datum.substring(0,4)===a)),a&&a.indexOf("bis")>0){const t=a.split("bis")[1].trim();e=e.filter(r=>r.Datum.substring(0,4)<=t)}const s=(t,r)=>'<a target="_blank" href='+this._url+"#range="+(r+2)+":"+(r+2)+">"+t+"</a>";this.bookings=e.map(t=>new i(s(t.rowNr,t.rowNr),t.Datum,t.Wer,t["km (Endstand)"],t["Liter getankt"],t.Benzinpreis,d(t.Betrag),t.Was,t["V-Schlüssel"],t.km,t["km seit letzter Tankung"],parseFloat(t["Verbrauch/l"].replace(",","."))||0))}},getters:{url:a=>a._url}});export{w as u};
