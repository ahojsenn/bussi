import{H as u}from"./types.42c77370.js";import{E as i}from"./entry.d021a17a.js";import{P as c}from"./papaparse.min.71a5bd73.js";const l="https://docs.google.com/spreadsheets/d/",g="1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M",d=l+g,s=d,m=a=>new Promise(function(e,o){c.parse(a,{download:!0,header:!0,skipEmptyLines:!0,complete:e,error:o})}),p="/gviz/tq?tqx=out:csv",h="/edit#gid=1543409034",k=s+p,f=a=>a.indexOf("\u20AC")>0?a:parseFloat(a==""?"0":a)+" \u20AC",E=i("hauptbuch",{state:()=>({bookings:[],_url:s+h}),actions:{async loadBussiData(a){let e=(await m(k)).data.map((t,r)=>(t.rowNr=r,t));Number(a)&&(e=e.filter(t=>t.Datum.substring(0,4)===a));const o=(t,r)=>'<a target="_blank" href='+this._url+"#range="+(r+2)+":"+(r+2)+">"+t+"</a>";this.bookings=e.map(t=>new u(o(t.rowNr,t.rowNr),t.Datum,t.Wer,t["km (Endstand)"],t["Liter getankt"],t.Benzinpreis,f(t.Betrag),t.Was,t["V-Schl\xFCssel"],t.km,t["km seit letzter Tankung"],t["Verbrauch/l"]))}},getters:{url:a=>a._url}});export{s as U,E as u};