import{E as ne,a as X,w as T,o as B,b as S,h as o,e as Z,s as re,G as se,u as d,x as oe,F as U,p as W,t as f,r as C,l as ce,m as ae,f as J,q as j,B as ie,C as ue,H as le,D as de}from"./entry.f9d1b401.js";import{P as me,l as F,_ as pe}from"./papaparse.min.f731461a.js";import{U as he,u as fe}from"./hauptbuch.d5ca8f76.js";import{u as _e}from"./stakeholder.91260115.js";import{a as P,B as Q}from"./types.41cc74b9.js";import{u as ye}from"./accounts.b5317b6d.js";import"./config.4db235a3.js";const ve=t=>new Promise(function(l,m){me.parse(t,{download:!0,header:!0,skipEmptyLines:!0,complete:l,error:m})}),Ae="/gviz/tq?tqx=out:csv",Be="&sheet=perioden",Se=he+Ae+Be,b=ne("perioden",{state:()=>({_perioden:[],_currentPeriod:""}),actions:{async loadDataFromGoogle(){const t=await ve(Se);this._perioden=t.data,this._currentPeriod=this._perioden[t.data.length-2].Periode},setPeriod(t){this._currentPeriod=t}},getters:{reparaturpauschale:t=>a=>t._perioden.find(l=>l.Periode===a).Reparaturpauschale,listOfPeriods:t=>t._perioden.map(a=>a.Periode),currentPeriod:t=>t._currentPeriod}}),we={id:"my-global"},Pe=X({__name:"YearSwitch",async setup(t){let a,l;const m=b();[a,l]=T(()=>m.loadDataFromGoogle()),await a,l();const e=m.listOfPeriods;let w=m.currentPeriod;const v=()=>{m.setPeriod(w)};return(_,i)=>(B(),S("form",we,[o("span",null,[Z("Welches Jahr möchtest du sehen?"),re(o("select",{"onUpdate:modelValue":i[0]||(i[0]=u=>oe(w)?w.value=u:w=u),onChange:i[1]||(i[1]=u=>v())},[(B(!0),S(U,null,W(d(e),u=>(B(),S("option",null,f(u),1))),256))],544),[[se,d(w)]])])]))}}),k=(t,a,l)=>{if(t===null)return;const m=new P(t.nr,t.date,t.soll,t.haben,t.description,t.kmStart,t.kmEnde,t.abschreibedauer),e=new P(t.nr,t.date,t.haben,t.soll,t.description,t.kmStart,t.kmEnde,t.abschreibedauer);a.bookings.push(m),l.bookings.push(e)},ee=t=>+(t.kmSinceLastFuelFill||"0")!=0||"Tanken".indexOf(t.description)>0,g=t=>typeof t=="string"?parseFloat(t.replaceAll(".","").replace("€","").trim().replace(",",".")):Number.isNaN(t)?0:t,Y=t=>ee(t)?+t.liters.replace("l","").trim().replace(",","."):0,ge=(t,a)=>Math.round(100*100*t/a)/100,ke=t=>parseFloat(t.kmSinceLastFuelFill||"0");let O=0,R=0;const Ee=(t,a,l,m)=>{F("bookEverythingtoBS: ",m.currentPeriod);for(var e of a){let v=!1;const _=l.shVerteilung(e.account).split(",");_.length>1;for(var w of _){const i=w.trim();if((r=>+r.key>0)(e)){const r=t.findAccount(i,"Konto 3"),s=t.findAccount("Bussi","Konto 3"),c=g(e.amount)/_.length,y=e.account+" Reparatur "+e.description+" "+c+" "+e.amount,p=new P(e.nr,e.date,0,c,y,+e.km-+(e.kmSinceLastEntry||"0"));k(p,r,s),v=!0}if(ee(e)){O=Math.round(1e3*g(e.amount)/Y(e))/1e3,R=ge(Y(e),ke(e));const r=t.findAccount("Bussi","Konto 2"),s=t.findAccount(i,"Konto 2"),c=e.account+" Tanken "+Y(e)+" Liter, <br> Verbrauch: "+R+" l/100km, <br>"+i+"-->Bussi<br>Benzinpreis: "+O+" €/l",y=g(e.amount)/_.length,p=new P(e.nr,e.date,y,0,c);k(p,r,s),v=!0}if((r=>parseFloat(r.kmSinceLastEntry+"")!=0)(e)){const r=t.findAccount(i,"Kilometer"),s=t.findAccount("Bussi","Kilometer"),c=parseFloat(e.kmSinceLastEntry||"0")/_.length;+e.km-parseFloat(e.kmSinceLastEntry||"0");const p=Math.round(O*c*R)/100,L=Math.round(100*+m.reparaturpauschale(m.currentPeriod).replace(",",".")*c)/100,M=e.account+" Kilometer "+c+" von "+e.kmSinceLastEntry+" km, "+i+"-->Bussi "+e.description+"<br>Benzingeld: "+p+" €, Reparaturgeld: "+L+" € für "+c+" km",V=new P(e.nr,e.date,c,0,M);k(V,r,s),v=!0;const D=t.findAccount(i,"Ausgleichskonto"),I=t.findAccount("Bussi","Konto 2"),n="Benzingeld: "+p+" € für "+c+" kmBenzinpreis = "+Math.round(O*R)/100+" €/km",A=new P(e.nr,e.date,p,0,n);k(A,D,I);const x=t.findAccount("Bussi","Konto 3"),K=t.findAccount(i,"Ausgleichskonto"),h=new P(e.nr,e.date,0,L,"Reparaturkosten aus Kilometern von "+m.reparaturpauschale(m.currentPeriod)+" €/km<br> Reparaturpauschale: "+L+" € für "+c+" km<br> "+i+" --> Bussi");k(h,x,K)}if((r=>r.key==="gleich")(e)){const r=t.findAccount(i,"Konto 1"),s=t.findAccount("Bussi","Konto 1"),c=g(e.amount)/_.length,y=e.account+" Konto 1 "+e.description+" "+c+" "+e.amount,p=new P(e.nr,e.date,0,c,y,+e.km);k(p,r,s),v=!0}if((r=>r.key.split(" ")[0]==="an"&&r.key.split(" ").length===2&&l.personen.indexOf(e.key.split(" ")[1])>-1)(e)){F("Ausgleichszahlung: ",e);const r=t.findAccount(i,"Ausgleichskonto"),s=e.key.split(" ")[1],c=t.findAccount(s,"Ausgleichskonto"),y=e.account+" "+e.description+" "+g(e.amount)+" "+e.amount,p=new P(e.nr,e.date,g(e.amount),0,y,+e.km);k(p,r,c),v=!0}if(g(e.amount)===0&&+(e.kmSinceLastEntry||"0")==0&&(v=!0,F("Nullbuchung ignoriert: ",e)),!v){F("Fehler: ",e);const r=t.findAccount("System","Errors"),s=t.findAccount("System","Errors1"),c=e.account+" Konto 1 "+e.description+" <br> amount:"+e.amount+" "+g(e.amount)+"<br> kmSinceLastEntry:"+e.kmSinceLastEntry+"<br> splits:"+_+"<br> booking:"+JSON.stringify(e),y=new P(e.nr,e.date,0,g(e.amount),c,+e.km);k(y,r,s)}}}return t},q=t=>(ie("data-v-55998ee6"),t=t(),ue(),t),Ke={key:0},xe=q(()=>o("div",null," ",-1)),Fe={key:1},ze={class:"center"},Le={key:0},Ne={key:2},Ce=["onClick"],Oe={class:"inner",style:{width:"100%"}},Re=q(()=>o("th",{class:"inner z100z"},"Kontobezeichnung ",-1)),Te=q(()=>o("th",{class:"inner",style:{width:"25%"}},"Saldo ",-1)),Ge={class:"inner"},Me={class:"inner"},Ve=["onClick"],De={class:"inner"},Ie=X({__name:"balance",async setup(t){let a,l;const m=n=>n.length>60?n.substr(0,60)+"...":n,e=C({bookings:[],name:""}),w=n=>{const A=n.bookings;e.bookings.splice(0,e.bookings.length),e.bookings.push(...A),e.name=n.owner+" "+n.name},v=()=>{e.bookings=[],e.name=""};ce(()=>{window.addEventListener("keydown",n=>{n.key==="Enter"&&n.metaKey&&v()})});const _=_e();[a,l]=T(()=>_.loadStakeholder()),await a,l();const i=_.stakeholder.filter(n=>n.Verteilung.indexOf(",")===-1).map(n=>n.Verteilung),u=b();[a,l]=T(()=>u.loadDataFromGoogle()),await a,l(),F("balance.currentPeriod ",u.currentPeriod,u);const N=fe(),z=ye();[a,l]=T(()=>z.loadDataFromGoogle()),await a,l(),z.accountBezeichnungen;const G=z.accountNames;let r=C(N.bookings),s=C(new Q(i,G,r));s.findAccount("System","Errors");const c=le();ae(u.$state,async(n,A)=>{await N.loadBussiData(u.currentPeriod),r=C(N.bookings),s=new Q(i,G,r),s=Ee(s,r,_,u),s=I(s,r,_,u),c.proxy.$forceUpdate()});const y=()=>s.findAccount("Bussi","Kilometer").saldoY(u.currentPeriod),p=()=>Math.round(r.reduce((n,A)=>n+V(A),0)),L=()=>Math.round(100*p()*2.37/1e3)/100,M=()=>Math.round(p()/y()*1e4)/100,V=n=>D(n)?+n.liters.replace("l","").trim().replace(",","."):0,D=n=>+(n.kmSinceLastFuelFill||"0")!=0||"Tanken".indexOf(n.description)>0;F("bs after bookEverythingtoBS",s);const I=(n,A,x,K)=>{const h=n.findAccount("Bussi","Konto 1"),E=h.saldoY(K.currentPeriod)/x.personen.length;for(var H of x.personen){const $=n.findAccount(H,"Ausgleichskonto"),te=new P("9999",K.currentPeriod+"-12-31",E,0,"Ausgleichsbuchung Konto1 "+K.currentPeriod+" "+h.owner+":"+h.name+" -> "+$.owner+":"+$.name);k(te,h,$)}return n};return(n,A)=>{const x=Pe,K=pe;return B(),S("div",null,[J(x),o("h1",null,"Bilanz "+f(d(u).currentPeriod)+", "+f(d(r).length)+" Buchungen ",1),d(s).findAccount("Bussi","Errors").bookings.length>0?(B(),S("div",Ke,[o("a",{class:"errors",href:"#",onClick:A[0]||(A[0]=h=>w(d(s).findAccount("Bussi","Errors")))}," Errors: "+f(d(s).findAccount("Bussi","Errors").bookings.length),1)])):j("",!0),o("div",null,"Kilometer: "+f(y())+" km",1),o("div",null,"Benzin: "+f(p())+" Liter",1),o("div",null,"CO2: "+f(L())+" Tonnen CO2 ",1),o("div",null,"Verbrauch: "+f(M())+" Liter/100km",1),o("div",null,"Reparaturpauschale: "+f(d(u).reparaturpauschale("2022"))+"€",1),xe,e.bookings.length!=0?(B(),S("div",Fe,[o("div",ze,[o("button",{class:"green",onClick:A[1]||(A[1]=h=>v())},"hit ⌘+<Enter> to go back"),e.bookings.length>0?(B(),S("div",Le)):j("",!0),J(K,{selectedBookingsToRender:e.bookings,konto:e.name},null,8,["selectedBookingsToRender","konto"])])])):(B(),S("div",Ne,[o("table",null,[(B(!0),S(U,null,W(d(i),h=>(B(),S("tr",null,[o("td",null,[Z(f(h),1),o("a",{href:"#",onClick:E=>w(d(s).findAccount(h,"Kilometer"))},[o("div",null,"Kilometer: "+f(d(s).findAccount(h,"Kilometer").saldoY(d(u).currentPeriod))+" km",1),o("div",null,"Saldo: "+f(d(s).saldierenEuro(h))+" €",1)],8,Ce)]),o("td",null,[o("table",Oe,[Re,Te,(B(!0),S(U,null,W(d(z).accounts.filter(E=>E.Name!=="Kilometer"),E=>(B(),S("tr",Ge,[o("td",Me,[o("a",{href:"#",onClick:H=>w(d(s).findAccount(h,E.Name))},[o("span",null,f(m(E.Bezeichnung)),1)],8,Ve)]),o("td",De,f(d(s).findAccount(h,E.Name).saldoY(d(u).currentPeriod)),1)]))),256))])])]))),256))])]))])}}});const je=de(Ie,[["__scopeId","data-v-55998ee6"]]);export{je as default};
