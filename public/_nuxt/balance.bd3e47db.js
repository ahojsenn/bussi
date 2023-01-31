import{_ as X}from"./YearSwitch.vue.b8df6ef5.js";import b from"./Table.256f713a.js";import{u as tt}from"./stakeholder.41595c4c.js";import{a as v,B as W}from"./types.9c14c63d.js";import{u as et}from"./hauptbuch.028e0268.js";import{u as nt}from"./perioden.b33d25dd.js";import{l as C}from"./papaparse.min.23b9f094.js";import{u as rt}from"./accounts.3cde67e3.js";import{Z as st,P as O,av as ot,az as Y,I as ct,ab as w,al as K,ae as U,aw as r,aB as d,L as u,aE as J,aC as Z,aD as j,aH as at,aI as lt,aA as ut,D as it}from"./app.config.886a5076.js";import{a as dt}from"./entry.556ab2a9.js";import"./_commonjsHelpers.725317a4.js";import"./url.3a8f7686.js";import"./config.9f8aebdf.js";const E=(e,f,A)=>{if(e===null)return;const a=new v(e.nr,e.date,e.soll,e.haben,e.description,e.kmStart),t=new v(e.nr,e.date,e.haben,e.soll,e.description,e.kmStart);f.bookings.push(a),A.bookings.push(t)},q=e=>+(e.kmSinceLastFuelFill||"0")!=0||"Tanken".indexOf(e.description)>0,k=e=>typeof e=="string"?parseFloat(e.replaceAll(".","").replace("€","").trim().replace(",",".")):Number.isNaN(e)?0:e,G=e=>q(e)?+e.liters.replace("l","").trim().replace(",","."):0,mt=(e,f)=>Math.round(100*100*e/f)/100,pt=e=>parseFloat(e.kmSinceLastFuelFill||"0");let F=0,z=0;const ft=(e,f,A,a)=>{C("bookEverythingtoBS: ",a.currentPeriod);for(var t of f){let h=!1;const B=A.shVerteilung(t.account).split(",");B.length>1;for(var T of B){const o=T.trim();if((n=>+n.key>0)(t)){const n=e.findAccount(o,"Konto 3"),l=e.findAccount("Bussi","Konto 3"),c=k(t.amount)/B.length,m=t.account+" Reparatur "+t.description+" "+c+" "+t.amount,p=new v(t.nr,t.date,0,c,m,+t.km-+(t.kmSinceLastEntry||"0"));E(p,n,l),h=!0}if(q(t)){const n=Math.round(100*k(t.amount))/100;F=Math.round(1e3*n/G(t))/1e3,z=mt(G(t),pt(t));const l=e.findAccount("Bussi","Konto 2"),c=e.findAccount(o,"Konto 2"),m=t.account+": Tanken für "+n+"€, "+G(t)+" Liter, <br> Verbrauch: "+z+" l/100km, <br>"+o+"-->Bussi<br>Benzinpreis: "+F+" €/l",p=k(t.amount)/B.length,P=new v(t.nr,t.date,p,0,m);E(P,l,c),h=!0}if((n=>parseFloat(n.kmSinceLastEntry+"")!=0)(t)){const n=e.findAccount(o,"Kilometer"),l=e.findAccount("Bussi","Kilometer"),c=parseFloat(t.kmSinceLastEntry||"0")/B.length;+t.km-parseFloat(t.kmSinceLastEntry||"0");const p=Math.round(F*c*z)/100,P=Math.round(100*+a.reparaturpauschale(a.currentPeriod).replace(",",".")*c)/100,I=t.account+" Kilometer "+c+" von "+t.kmSinceLastEntry+" km, "+o+"-->Bussi "+t.description+"<br>Benzingeld: "+p+" €, Reparaturgeld: "+P+" € für "+c+" km",R=new v(t.nr,t.date,c,0,I);E(R,n,l),h=!0;const $=e.findAccount(o,"Konto 2"),s=e.findAccount("Bussi","Konto 2"),_="Benzingeld: "+p+" € für "+c+" km, Benzinpreis: "+F+"€/L, Verbrauch: "+z+" ergibt: "+Math.round(F*z)/100+" €/km",N=new v(t.nr,t.date,p,0,_);E(N,$,s);const L=e.findAccount("Bussi","Konto 3"),i=e.findAccount(o,"Konto 3"),y=new v(t.nr,t.date,0,P,"Reparaturpauschale "+a.reparaturpauschale(a.currentPeriod)+" €/km * "+c+" km = "+P+" € : "+o+" --> Bussi");E(y,L,i)}if((n=>n.key==="gleich")(t)){const n=e.findAccount(o,"Konto 1"),l=e.findAccount("Bussi","Konto 1"),c=k(t.amount)/B.length,m=t.account+" Konto 1 "+t.description+" "+c+" "+t.amount,p=new v(t.nr,t.date,0,c,m,+t.km);E(p,n,l),h=!0}const S=n=>{const l=t&&t.key&&typeof t.key=="string"&&t.key.split(" ").length>0?t.key.split(" ")[1]:"";return n.key.split(" ")[0]==="an"&&l!==""&&(l==="Bussi"||A.personen.indexOf(l)>=0)};if(S(t)){const n=e.findAccount(o,"Ausgleichskonto"),l=t.key.split(" ")[1],c=e.findAccount(l,"Ausgleichskonto"),m=t.account+"-->"+l+": "+t.description+" "+k(t.amount)+" "+t.amount,p=new v(t.nr,t.date,0,k(t.amount),m,+t.km);E(p,n,c),h=!0}if(k(t.amount)===0&&+(t.kmSinceLastEntry||"0")==0&&(h=!0,C("Nullbuchung ignoriert: ",t)),!h){C("Fehler: ",t,S(t));const n=e.findAccount("System","Errors"),l=e.findAccount("System","Errors1"),c=t.account+" Konto 1 "+t.description+" <br> amount:"+t.amount+" "+k(t.amount)+"<br> kmSinceLastEntry:"+t.kmSinceLastEntry+"<br> splits:"+B+"<br> booking:"+JSON.stringify(t),m=new v(t.nr,t.date,0,k(t.amount),c,+t.km);E(m,n,l)}}}return e},x=e=>(at("data-v-7b6d2f89"),e=e(),lt(),e),ht={key:0},_t=x(()=>r("div",null," ",-1)),yt={key:1},At={class:"center"},Bt={key:0},vt={key:2},St=["onClick"],wt={class:"inner",style:{width:"100%"}},Kt=x(()=>r("th",{class:"inner"},"Kontobezeichnung ",-1)),kt=x(()=>r("th",{class:"inner"},"Saldo ",-1)),Et=x(()=>r("th",{class:"inner grey"},"Soll",-1)),xt=x(()=>r("th",{class:"inner grey"},"Haben",-1)),Pt={class:"inner"},Lt={class:"inner"},Nt=["onClick"],gt=x(()=>r("span",null,"     ",-1)),Ft={class:"inner"},zt={class:"inner grey"},Ct={class:"inner grey"},Tt=x(()=>r("br",null,null,-1)),Mt=x(()=>r("br",null,null,-1)),Ot=st({__name:"balance",async setup(e){let f,A;const a=O({bookings:[],name:""}),t=s=>{const _=s.bookings;a.bookings.splice(0,a.bookings.length),a.bookings.push(..._),a.name=s.owner+" "+s.name},T=()=>{a.bookings=[],a.name=""};ot(()=>{window.addEventListener("keydown",s=>{s.key==="Enter"&&s.metaKey&&T()})});const h=tt();[f,A]=Y(()=>h.loadStakeholder()),await f,A();const B=h.stakeholder.filter(s=>s.Verteilung.indexOf(",")===-1).map(s=>s.Verteilung),o=nt();[f,A]=Y(()=>o.loadDataFromGoogle()),await f,A(),C("balance.currentPeriod ",o.currentPeriod,o);const M=et(),g=rt();[f,A]=Y(()=>g.loadDataFromGoogle()),await f,A(),g.accountBezeichnungen;const V=g.accountNames;let S=O(M.bookings),n=O(new W(B,V,S));n.findAccount("System","Errors");const l=it();ct(o.$state,async(s,_)=>{await M.loadBussiData(o.currentPeriod),S=O(M.bookings),n=new W(B,V,S),n=ft(n,S,h,o),n=$(n,S,h,o),l&&l.proxy&&l.proxy.$forceUpdate(),a.bookings=[],a.name=""});const c=()=>n.findAccount("Bussi","Kilometer").saldoY(o.currentPeriod),m=()=>Math.round(S.reduce((s,_)=>s+I(_),0)),p=()=>Math.round(100*m()*2.37/1e3)/100,P=()=>Math.round(m()/c()*1e4)/100,I=s=>R(s)?+s.liters.replace("l","").trim().replace(",","."):0,R=s=>+(s.kmSinceLastFuelFill||"0")!=0||"Tanken".indexOf(s.description)>0;C("bs after bookEverythingtoBS",n);const $=(s,_,N,L)=>{const i=s.findAccount("Bussi","Konto 1"),y=-i.saldoY(L.currentPeriod)/N.personen.length;for(var H of N.personen){const D=s.findAccount(H,"Konto 1"),Q=new v("9999",L.currentPeriod+"-12-31",0,y,"Ausgleichsbuchung Konto1 "+L.currentPeriod+" "+i.owner+":"+i.name+" -> "+D.owner+":"+D.name);E(Q,i,D)}return s};return(s,_)=>{const N=X,L=b;return w(),K("div",null,[U(N),r("h1",null,"Bilanz "+d(u(o).currentPeriod)+", "+d(u(S).length)+" Buchungen ",1),u(n).findAccount("Bussi","Errors").bookings.length>0?(w(),K("div",ht,[r("a",{class:"errors",href:"#",onClick:_[0]||(_[0]=i=>t(u(n).findAccount("Bussi","Errors")))}," Errors: "+d(u(n).findAccount("Bussi","Errors").bookings.length),1)])):J("",!0),r("div",null,"Kilometer: "+d(c())+" km",1),r("div",null,"Benzin: "+d(m())+" Liter",1),r("div",null,"CO2: "+d(p())+" Tonnen CO2 ",1),r("div",null,"Verbrauch: "+d(P())+" Liter/100km",1),r("div",null,"Reparaturpauschale: "+d(u(o).reparaturpauschale("2022"))+"€",1),_t,a.bookings.length!=0?(w(),K("div",yt,[r("div",At,[r("button",{class:"green",onClick:_[1]||(_[1]=i=>T())},"hit ⌘+<Enter> to go back"),a.bookings.length>0?(w(),K("div",Bt)):J("",!0),U(L,{selectedBookingsToRender:a.bookings,konto:a.name},null,8,["selectedBookingsToRender","konto"])])])):(w(),K("div",vt,[r("table",null,[(w(!0),K(Z,null,j(u(B),i=>(w(),K("tr",null,[r("td",null,[ut(d(i),1),r("a",{href:"#",onClick:y=>t(u(n).findAccount(i,"Kilometer"))},[r("div",null,"Kilometer: "+d(Math.abs(u(n).findAccount(i,"Kilometer").saldoY(u(o).currentPeriod)))+" km",1)],8,St),r("div",null,[r("b",null,"Saldo: "+d(u(n).saldierenEuro(i))+" €",1)])]),r("td",null,[r("table",wt,[Kt,kt,Et,xt,(w(!0),K(Z,null,j(u(g).accounts.filter(y=>y.Name!=="Kilometer"),y=>(w(),K("tr",Pt,[r("td",Lt,[r("a",{href:"#",onClick:H=>t(u(n).findAccount(i,y.Name))},[r("span",null,d(y.Bezeichnung),1)],8,Nt),gt]),r("td",Ft,d(u(n).findAccount(i,y.Name).saldoY(u(o).currentPeriod)),1),r("td",zt,d(u(n).findAccount(i,y.Name).saldoSoll(u(o).currentPeriod)),1),r("td",Ct,d(u(n).findAccount(i,y.Name).saldoHaben(u(o).currentPeriod)),1)]))),256))])])]))),256))])])),Tt,Mt])}}});const qt=dt(Ot,[["__scopeId","data-v-7b6d2f89"]]);export{qt as default};