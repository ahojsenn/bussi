import{f as Oe,j as Ae,k as Te,l as Le,m as Ie,p as De,q as Fe,b as w,i as O,h as Ee,t as q,u as ae,F as ue,s as le,v as Ce,x as Me,y as Ne,z as je,A as Ue,B as me,C as ze,D as Pe,o as C,E as Re,a as Be}from"./entry.ca4602c4.js";let qe=new Date;const He=(z,...K)=>{{const G=new Date().getTime()-qe.getTime();console.log(G+"ms: "+z,...K)}},ce=He,he=z=>(ze("data-v-9d997d36"),z=z(),Pe(),z),$e={key:0},Je=he(()=>O("div",null,null,-1)),We=he(()=>O("br",null,null,-1)),Ge={key:0},Qe=he(()=>O("br",null,null,-1)),Ke=["disabled"],Ve=["disabled","onClick"],Ye=he(()=>O("br",null,null,-1)),Ze={key:1},Xe=he(()=>O("br",null,null,-1)),et=["onClick"],tt={key:0,class:"isAntiFilter"},nt={key:1,class:"isFilter"},it=["innerHTML"],rt=["onClick"],st=he(()=>O("br",null,null,-1)),ot={key:0},at={key:1},ut=["onClick"],lt=["onClick","onContextmenu","onMouseover"],ct=["href","innerHTML"],ht=["innerHTML"],dt=["innerHTML"],ft={style:{"text-align":"right"}},pt={key:0},_t={key:1},gt=Oe({__name:"Table",props:{konto:{type:String},selectedBookingsToRender:{type:Array},showSum:Boolean},setup(z){const K=z,G=500,o=Ae({filters:[],currentRow:{},aggregate:[],rows:K.selectedBookingsToRender});o.rows=K.selectedBookingsToRender,Te(()=>K.selectedBookingsToRender,()=>{o.rows=K.selectedBookingsToRender});const j=K.selectedBookingsToRender;let re=0,V=Le(!0);const ye=[];let d="";const Y=G;let M=0;const Z=Ie(),ne=De(),ie={},se=[];Fe(()=>{o.filters=[],Z.query.filters=""}),Te(o.filters,()=>ce("some changed",o.filters));const de=function(){return j?Math.round(j.length/G):0},$=function(r){o.rows=j?j.filter((a,n)=>n>=(r-1)*G&&n<r*G):[],M=r},fe=function(){o.rows=j,M=-1},ve=function(){return re<5},ke=function(r){re=r},be=function(r){o.currentRow=r},pe=function(r){return JSON.stringify(r,void 0,2).replace(/\n/g,"<br>").replace(/[ ]/g,"&nbsp")},J=function(r,a){if(ce("Table.aggregateby: ",a),o.aggregate.includes(a)){o.aggregate.splice(o.aggregate.indexOf(a),1),o.rows=JSON.parse(ye.pop());return}ye.push(JSON.stringify(o.rows)),o.aggregate.push(a);const n=[];r.forEach(function(c,f){let s=null;for(const y in n)n[y][a]===c[a]&&(s=y);s!=null?(a!=="Amount"&&a!=="Netto"&&(n[+s].Amount+=c.Amount,n[+s].Netto+=c.Netto),a!=="CostCenter"&&(n[+s].CostCenter+="<br>"+c.CostCenter),n[+s].Text+="<br>"+c.Amount+" "+c.Text):n.push(c)}),o.rows=n},v=function(r="Net FileCreated Steuer Year Month"){return o.rows===void 0?[]:o.rows.length===0?[]:Object.keys(o.rows[0]).filter(a=>!r.includes(a))},t=function(r){return r.toLocaleString("de-DE",{minimumFractionDigits:2,style:"currency",currency:"EUR"})},e=r=>+r.replace("€","").replace(".","").replace(",",".").trim(),i=function(a){var c;let n=((c=o.rows)==null?void 0:c.reduce((f,s)=>f+ +s[a],0))||0;return Math.round(100*n)/100},u=function(a){let n=0;return o.rows===void 0||(o.rows.forEach(function(f){f[a]!==void 0&&(n+=e(f[a]))}),n=Math.round(1e3*n)/1e3,isNaN(n))?"":n.toLocaleString("de-DE",{minimumFractionDigits:2,style:"currency",currency:"EUR"})},l=function(){const a=d,n={title:"",value:"",isAnti:!1};n.title="pattern",n.value=a,n.isAnti=a.charAt(0)==="!",n.value=n.isAnti?a.substr(1):a,p(n.title,n.value,n.isAnti),d=null},p=function(a,n,c){ce("Table.setfilter: ",a,n);const f={title:a,value:n,isAnti:c},s=o.filters.findIndex(L=>L.title===a&&L.value===n&&L.isAnti===c);s===-1?o.filters.push(f):o.filters[s]=f;const y=Object.assign({},Z.query);y.filters=JSON.stringify(o.filters),y.filters=ne.replace({query:y}),o.rows=j,$(M),o.rows=A(o.rows,o.filters),ce("Table.setfilter: ",o.filters)},m=function(a){ce("Table.deleteFiler: ",a,o.filters);const n=o.filters.indexOf(a);ce(" ...",n),n>-1&&o.filters.splice(n,1);const c=Object.assign({},Z.query);c.filters=JSON.stringify(o.filters),c.filters=ne.replace({query:c}),o.rows=j,$(M),o.rows=A(o.rows,o.filters)},A=function(r,a){return r.filter(function(n){let c=!0;return a.forEach(function(f){if(f.title==="pattern"){let s="";for(const y in n)s+=n[y]?n[y].toString().toLowerCase():"";s.includes(f.value.toLowerCase())&&f.isAnti&&(c=!1),s.includes(f.value.toLowerCase())||(c=!1)}else f.isAnti?c=c&&n[f.title]!==f.value:f.isAnti||(c=c&&n[f.title]===f.value)}),c})},E=function(a,n){const c=n||n||"#";V=!V,V?a.sort((f,s)=>f[c]>s[c]):a.sort((f,s)=>f[c]<s[c])};return $(1),(r,a)=>(C(),w("div",null,[v().length>0||se.length>0?(C(),w("div",$e,[Je,O("b",null,[Ee(q(z.konto)+": "+q(o.rows.length)+" Einträge",1),We,de()>1?(C(),w("div",Ge,[Qe,O("span",null,[O("button",{onClick:a[0]||(a[0]=n=>fe()),disabled:ae(M)==-1},"show all "+q(ae(j).length)+" entries",9,Ke)]),O("span",null,[(C(!0),w(ue,null,le(de(),(n,c)=>(C(),w("button",{disabled:n==ae(M),onClick:f=>$(n)},q((n-1)*ae(Y)+1)+".."+q(n*ae(Y)),9,Ve))),256))])])):Ce("",!0),Ye,Me(O("input",{"onUpdate:modelValue":a[1]||(a[1]=n=>je(d)?d.value=n:d=n),placeholder:"<enter> new filter",onKeyup:a[2]||(a[2]=Ue(n=>l(),["enter"]))},null,544),[[Ne,ae(d)]]),O("input",{type:"submit",value:"set filter",onClick:a[3]||(a[3]=n=>l())}),o.filters[0]?(C(),w("span",Ze,[Xe,Ee("filters:")])):Ce("",!0),(C(!0),w(ue,null,le(o.filters,n=>(C(),w("span",{class:"filter",onClick:c=>m(n)},[n.isAnti==!0?(C(),w("span",tt,q(n.title)+": "+q(n.value),1)):(C(),w("span",nt,q(n.title)+": "+q(n.value),1))],8,et))),256)),O("div",{id:"popup",innerHTML:pe(o.currentRow),class:me({visible:ve(),invisible:!ve()})},null,10,it)]),O("table",null,[O("thead",null,[(C(!0),w(ue,null,le(v(),(n,c)=>(C(),w("th",null,[O("div",{onClick:Re(f=>E(o.rows,n),["exact"])},[Ee(q(n),1),st,"kmSinceLastEntry Amount haben soll".indexOf(n)>-1?(C(),w("span",ot,q(i(n)),1)):(C(),w("span",at," "))],8,rt),(C(),w("button",{key:0,onClick:f=>J(o.rows,n),class:me({active:o.aggregate.indexOf(n)>-1})},"<==>",10,ut))]))),256))]),O("tbody",null,[(C(!0),w(ue,null,le(o.rows,n=>(C(),w("tr",null,[(C(!0),w(ue,null,le(v(),(c,f)=>(C(),w("td",{onClick:Re(s=>p(c,n[c],!1),["left"]),onContextmenu:Re(s=>p(c,n[c],!0),["right"]),onMouseover:s=>(be(n),ke(f)),class:me({hilight:n.Name=="7 ErgebnisNachSteuern",underaccountrow:n.Type=="Unterkonto",greylight:n.Name&&n.Name.includes("Steuer:")})},[O("div",{class:me({nowrap:"date amount".indexOf(c)>-1})},[c=="Name"?(C(),w("span",{key:0,class:me({underaccountcell:n.Type=="Unterkonto"})},[O("a",{href:"?report=account&id="+encodeURIComponent(n.Account_Link),innerHTML:n[c].toLocaleString("de-DE",{minimumFractionDigits:2,style:"currency",currency:"EUR"})},null,8,ct)],2)):"Revenue Netto Advances Internals Sales Project Commission Taxes Saldo Costs Saldo Amount Balance AnteilAusFaktura AnteilAusFairshares KMDarlehen Aktiva Passiva Rest Salesprv ".indexOf(c)>-1?(C(),w("span",{key:1,style:{"text-align":"right"},innerHTML:t(n[c])},null,8,ht)):(C(),w("span",{key:2,innerHTML:n[c]},null,8,dt))],2)],42,lt))),256))]))),256))]),O("tfoot",null,[O("tr",null,[ie!="Account_Link"?(C(!0),w(ue,{key:0},le(v(),n=>(C(),w("th",ft,[z.showSum&&"Netto Saldo Amount Psoll Phaben".indexOf(n)>-1?(C(),w("span",pt,q(u(n)),1)):(C(),w("span",_t," "))]))),256)):Ce("",!0)])])])])):Ce("",!0)]))}});const Ct=Be(gt,[["__scopeId","data-v-9d997d36"]]);var mt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Se={},yt={get exports(){return Se},set exports(z){Se=z}};/* @license
Papa Parse
v5.3.2
https://github.com/mholt/PapaParse
License: MIT
*/(function(z,K){(function(G,o){z.exports=o()})(mt,function G(){var o=typeof self<"u"?self:typeof window<"u"?window:o!==void 0?o:{},j=!o.document&&!!o.postMessage,re=j&&/blob:/i.test((o.location||{}).protocol),V={},ye=0,d={parse:function(t,e){var i=(e=e||{}).dynamicTyping||!1;if(v(i)&&(e.dynamicTypingFunction=i,i={}),e.dynamicTyping=i,e.transform=!!v(e.transform)&&e.transform,e.worker&&d.WORKERS_SUPPORTED){var u=function(){if(!d.WORKERS_SUPPORTED)return!1;var p=(A=o.URL||o.webkitURL||null,E=G.toString(),d.BLOB_URL||(d.BLOB_URL=A.createObjectURL(new Blob(["(",E,")();"],{type:"text/javascript"})))),m=new o.Worker(p),A,E;return m.onmessage=ve,m.id=ye++,V[m.id]=m}();return u.userStep=e.step,u.userChunk=e.chunk,u.userComplete=e.complete,u.userError=e.error,e.step=v(e.step),e.chunk=v(e.chunk),e.complete=v(e.complete),e.error=v(e.error),delete e.worker,void u.postMessage({input:t,config:e,workerId:u.id})}var l=null;return d.NODE_STREAM_INPUT,typeof t=="string"?l=e.download?new Z(e):new ie(e):t.readable===!0&&v(t.read)&&v(t.on)?l=new se(e):(o.File&&t instanceof File||t instanceof Object)&&(l=new ne(e)),l.stream(t)},unparse:function(t,e){var i=!1,u=!0,l=",",p=`\r
`,m='"',A=m+m,E=!1,r=null,a=!1;(function(){if(typeof e=="object"){if(typeof e.delimiter!="string"||d.BAD_DELIMITERS.filter(function(s){return e.delimiter.indexOf(s)!==-1}).length||(l=e.delimiter),(typeof e.quotes=="boolean"||typeof e.quotes=="function"||Array.isArray(e.quotes))&&(i=e.quotes),typeof e.skipEmptyLines!="boolean"&&typeof e.skipEmptyLines!="string"||(E=e.skipEmptyLines),typeof e.newline=="string"&&(p=e.newline),typeof e.quoteChar=="string"&&(m=e.quoteChar),typeof e.header=="boolean"&&(u=e.header),Array.isArray(e.columns)){if(e.columns.length===0)throw new Error("Option columns is empty");r=e.columns}e.escapeChar!==void 0&&(A=e.escapeChar+m),(typeof e.escapeFormulae=="boolean"||e.escapeFormulae instanceof RegExp)&&(a=e.escapeFormulae instanceof RegExp?e.escapeFormulae:/^[=+\-@\t\r].*$/)}})();var n=new RegExp($(m),"g");if(typeof t=="string"&&(t=JSON.parse(t)),Array.isArray(t)){if(!t.length||Array.isArray(t[0]))return c(null,t,E);if(typeof t[0]=="object")return c(r||Object.keys(t[0]),t,E)}else if(typeof t=="object")return typeof t.data=="string"&&(t.data=JSON.parse(t.data)),Array.isArray(t.data)&&(t.fields||(t.fields=t.meta&&t.meta.fields||r),t.fields||(t.fields=Array.isArray(t.data[0])?t.fields:typeof t.data[0]=="object"?Object.keys(t.data[0]):[]),Array.isArray(t.data[0])||typeof t.data[0]=="object"||(t.data=[t.data])),c(t.fields||[],t.data||[],E);throw new Error("Unable to serialize unrecognized input");function c(s,y,L){var S="";typeof s=="string"&&(s=JSON.parse(s)),typeof y=="string"&&(y=JSON.parse(y));var F=Array.isArray(s)&&0<s.length,I=!Array.isArray(y[0]);if(F&&u){for(var D=0;D<s.length;D++)0<D&&(S+=l),S+=f(s[D],D);0<y.length&&(S+=p)}for(var h=0;h<y.length;h++){var b=F?s.length:y[h].length,R=!1,T=F?Object.keys(y[h]).length===0:y[h].length===0;if(L&&!F&&(R=L==="greedy"?y[h].join("").trim()==="":y[h].length===1&&y[h][0].length===0),L==="greedy"&&F){for(var g=[],k=0;k<b;k++){var x=I?s[k]:k;g.push(y[h][x])}R=g.join("").trim()===""}if(!R){for(var _=0;_<b;_++){0<_&&!T&&(S+=l);var X=F&&I?s[_]:_;S+=f(y[h][X],_)}h<y.length-1&&(!L||0<b&&!T)&&(S+=p)}}return S}function f(s,y){if(s==null)return"";if(s.constructor===Date)return JSON.stringify(s).slice(1,25);var L=!1;a&&typeof s=="string"&&a.test(s)&&(s="'"+s,L=!0);var S=s.toString().replace(n,A);return(L=L||i===!0||typeof i=="function"&&i(s,y)||Array.isArray(i)&&i[y]||function(F,I){for(var D=0;D<I.length;D++)if(-1<F.indexOf(I[D]))return!0;return!1}(S,d.BAD_DELIMITERS)||-1<S.indexOf(l)||S.charAt(0)===" "||S.charAt(S.length-1)===" ")?m+S+m:S}}};if(d.RECORD_SEP=String.fromCharCode(30),d.UNIT_SEP=String.fromCharCode(31),d.BYTE_ORDER_MARK="\uFEFF",d.BAD_DELIMITERS=["\r",`
`,'"',d.BYTE_ORDER_MARK],d.WORKERS_SUPPORTED=!j&&!!o.Worker,d.NODE_STREAM_INPUT=1,d.LocalChunkSize=10485760,d.RemoteChunkSize=5242880,d.DefaultDelimiter=",",d.Parser=fe,d.ParserHandle=de,d.NetworkStreamer=Z,d.FileStreamer=ne,d.StringStreamer=ie,d.ReadableStreamStreamer=se,o.jQuery){var Y=o.jQuery;Y.fn.parse=function(t){var e=t.config||{},i=[];return this.each(function(p){if(!(Y(this).prop("tagName").toUpperCase()==="INPUT"&&Y(this).attr("type").toLowerCase()==="file"&&o.FileReader)||!this.files||this.files.length===0)return!0;for(var m=0;m<this.files.length;m++)i.push({file:this.files[m],inputElem:this,instanceConfig:Y.extend({},e)})}),u(),this;function u(){if(i.length!==0){var p,m,A,E,r=i[0];if(v(t.before)){var a=t.before(r.file,r.inputElem);if(typeof a=="object"){if(a.action==="abort")return p="AbortError",m=r.file,A=r.inputElem,E=a.reason,void(v(t.error)&&t.error({name:p},m,A,E));if(a.action==="skip")return void l();typeof a.config=="object"&&(r.instanceConfig=Y.extend(r.instanceConfig,a.config))}else if(a==="skip")return void l()}var n=r.instanceConfig.complete;r.instanceConfig.complete=function(c){v(n)&&n(c,r.file,r.inputElem),l()},d.parse(r.file,r.instanceConfig)}else v(t.complete)&&t.complete()}function l(){i.splice(0,1),u()}}}function M(t){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var i=pe(e);i.chunkSize=parseInt(i.chunkSize),e.step||e.chunk||(i.chunkSize=null),this._handle=new de(i),(this._handle.streamer=this)._config=i}.call(this,t),this.parseChunk=function(e,i){if(this.isFirstChunk&&v(this._config.beforeFirstChunk)){var u=this._config.beforeFirstChunk(e);u!==void 0&&(e=u)}this.isFirstChunk=!1,this._halted=!1;var l=this._partialLine+e;this._partialLine="";var p=this._handle.parse(l,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var m=p.meta.cursor;this._finished||(this._partialLine=l.substring(m-this._baseIndex),this._baseIndex=m),p&&p.data&&(this._rowCount+=p.data.length);var A=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(re)o.postMessage({results:p,workerId:d.WORKER_ID,finished:A});else if(v(this._config.chunk)&&!i){if(this._config.chunk(p,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);p=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(p.data),this._completeResults.errors=this._completeResults.errors.concat(p.errors),this._completeResults.meta=p.meta),this._completed||!A||!v(this._config.complete)||p&&p.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),A||p&&p.meta.paused||this._nextChunk(),p}this._halted=!0},this._sendError=function(e){v(this._config.error)?this._config.error(e):re&&this._config.error&&o.postMessage({workerId:d.WORKER_ID,error:e,finished:!1})}}function Z(t){var e;(t=t||{}).chunkSize||(t.chunkSize=d.RemoteChunkSize),M.call(this,t),this._nextChunk=j?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(i){this._input=i,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(e=new XMLHttpRequest,this._config.withCredentials&&(e.withCredentials=this._config.withCredentials),j||(e.onload=J(this._chunkLoaded,this),e.onerror=J(this._chunkError,this)),e.open(this._config.downloadRequestBody?"POST":"GET",this._input,!j),this._config.downloadRequestHeaders){var i=this._config.downloadRequestHeaders;for(var u in i)e.setRequestHeader(u,i[u])}if(this._config.chunkSize){var l=this._start+this._config.chunkSize-1;e.setRequestHeader("Range","bytes="+this._start+"-"+l)}try{e.send(this._config.downloadRequestBody)}catch(p){this._chunkError(p.message)}j&&e.status===0&&this._chunkError()}},this._chunkLoaded=function(){e.readyState===4&&(e.status<200||400<=e.status?this._chunkError():(this._start+=this._config.chunkSize?this._config.chunkSize:e.responseText.length,this._finished=!this._config.chunkSize||this._start>=function(i){var u=i.getResponseHeader("Content-Range");return u===null?-1:parseInt(u.substring(u.lastIndexOf("/")+1))}(e),this.parseChunk(e.responseText)))},this._chunkError=function(i){var u=e.statusText||i;this._sendError(new Error(u))}}function ne(t){var e,i;(t=t||{}).chunkSize||(t.chunkSize=d.LocalChunkSize),M.call(this,t);var u=typeof FileReader<"u";this.stream=function(l){this._input=l,i=l.slice||l.webkitSlice||l.mozSlice,u?((e=new FileReader).onload=J(this._chunkLoaded,this),e.onerror=J(this._chunkError,this)):e=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var l=this._input;if(this._config.chunkSize){var p=Math.min(this._start+this._config.chunkSize,this._input.size);l=i.call(l,this._start,p)}var m=e.readAsText(l,this._config.encoding);u||this._chunkLoaded({target:{result:m}})},this._chunkLoaded=function(l){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(l.target.result)},this._chunkError=function(){this._sendError(e.error)}}function ie(t){var e;M.call(this,t=t||{}),this.stream=function(i){return e=i,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var i,u=this._config.chunkSize;return u?(i=e.substring(0,u),e=e.substring(u)):(i=e,e=""),this._finished=!e,this.parseChunk(i)}}}function se(t){M.call(this,t=t||{});var e=[],i=!0,u=!1;this.pause=function(){M.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){M.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(l){this._input=l,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){u&&e.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),e.length?this.parseChunk(e.shift()):i=!0},this._streamData=J(function(l){try{e.push(typeof l=="string"?l:l.toString(this._config.encoding)),i&&(i=!1,this._checkIsFinished(),this.parseChunk(e.shift()))}catch(p){this._streamError(p)}},this),this._streamError=J(function(l){this._streamCleanUp(),this._sendError(l)},this),this._streamEnd=J(function(){this._streamCleanUp(),u=!0,this._streamData("")},this),this._streamCleanUp=J(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function de(t){var e,i,u,l=Math.pow(2,53),p=-l,m=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,A=/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/,E=this,r=0,a=0,n=!1,c=!1,f=[],s={data:[],errors:[],meta:{}};if(v(t.step)){var y=t.step;t.step=function(h){if(s=h,F())S();else{if(S(),s.data.length===0)return;r+=h.data.length,t.preview&&r>t.preview?i.abort():(s.data=s.data[0],y(s,E))}}}function L(h){return t.skipEmptyLines==="greedy"?h.join("").trim()==="":h.length===1&&h[0].length===0}function S(){return s&&u&&(D("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+d.DefaultDelimiter+"'"),u=!1),t.skipEmptyLines&&(s.data=s.data.filter(function(h){return!L(h)})),F()&&function(){if(!s)return;function h(R,T){v(t.transformHeader)&&(R=t.transformHeader(R,T)),f.push(R)}if(Array.isArray(s.data[0])){for(var b=0;F()&&b<s.data.length;b++)s.data[b].forEach(h);s.data.splice(0,1)}else s.data.forEach(h)}(),function(){if(!s||!t.header&&!t.dynamicTyping&&!t.transform)return s;function h(R,T){var g,k=t.header?{}:[];for(g=0;g<R.length;g++){var x=g,_=R[g];t.header&&(x=g>=f.length?"__parsed_extra":f[g]),t.transform&&(_=t.transform(_,x)),_=I(x,_),x==="__parsed_extra"?(k[x]=k[x]||[],k[x].push(_)):k[x]=_}return t.header&&(g>f.length?D("FieldMismatch","TooManyFields","Too many fields: expected "+f.length+" fields but parsed "+g,a+T):g<f.length&&D("FieldMismatch","TooFewFields","Too few fields: expected "+f.length+" fields but parsed "+g,a+T)),k}var b=1;return!s.data.length||Array.isArray(s.data[0])?(s.data=s.data.map(h),b=s.data.length):s.data=h(s.data,0),t.header&&s.meta&&(s.meta.fields=f),a+=b,s}()}function F(){return t.header&&f.length===0}function I(h,b){return R=h,t.dynamicTypingFunction&&t.dynamicTyping[R]===void 0&&(t.dynamicTyping[R]=t.dynamicTypingFunction(R)),(t.dynamicTyping[R]||t.dynamicTyping)===!0?b==="true"||b==="TRUE"||b!=="false"&&b!=="FALSE"&&(function(T){if(m.test(T)){var g=parseFloat(T);if(p<g&&g<l)return!0}return!1}(b)?parseFloat(b):A.test(b)?new Date(b):b===""?null:b):b;var R}function D(h,b,R,T){var g={type:h,code:b,message:R};T!==void 0&&(g.row=T),s.errors.push(g)}this.parse=function(h,b,R){var T=t.quoteChar||'"';if(t.newline||(t.newline=function(x,_){x=x.substring(0,1048576);var X=new RegExp($(_)+"([^]*?)"+$(_),"gm"),H=(x=x.replace(X,"")).split("\r"),P=x.split(`
`),ee=1<P.length&&P[0].length<H[0].length;if(H.length===1||ee)return`
`;for(var W=0,B=0;B<H.length;B++)H[B][0]===`
`&&W++;return W>=H.length/2?`\r
`:"\r"}(h,T)),u=!1,t.delimiter)v(t.delimiter)&&(t.delimiter=t.delimiter(h),s.meta.delimiter=t.delimiter);else{var g=function(x,_,X,H,P){var ee,W,B,N;P=P||[",","	","|",";",d.RECORD_SEP,d.UNIT_SEP];for(var te=0;te<P.length;te++){var U=P[te],oe=0,Q=0,xe=0;B=void 0;for(var _e=new fe({comments:H,delimiter:U,newline:_,preview:10}).parse(x),we=0;we<_e.data.length;we++)if(X&&L(_e.data[we]))xe++;else{var ge=_e.data[we].length;Q+=ge,B!==void 0?0<ge&&(oe+=Math.abs(ge-B),B=ge):B=ge}0<_e.data.length&&(Q/=_e.data.length-xe),(W===void 0||oe<=W)&&(N===void 0||N<Q)&&1.99<Q&&(W=oe,ee=U,N=Q)}return{successful:!!(t.delimiter=ee),bestDelimiter:ee}}(h,t.newline,t.skipEmptyLines,t.comments,t.delimitersToGuess);g.successful?t.delimiter=g.bestDelimiter:(u=!0,t.delimiter=d.DefaultDelimiter),s.meta.delimiter=t.delimiter}var k=pe(t);return t.preview&&t.header&&k.preview++,e=h,i=new fe(k),s=i.parse(e,b,R),S(),n?{meta:{paused:!0}}:s||{meta:{paused:!1}}},this.paused=function(){return n},this.pause=function(){n=!0,i.abort(),e=v(t.chunk)?"":e.substring(i.getCharIndex())},this.resume=function(){E.streamer._halted?(n=!1,E.streamer.parseChunk(e,!0)):setTimeout(E.resume,3)},this.aborted=function(){return c},this.abort=function(){c=!0,i.abort(),s.meta.aborted=!0,v(t.complete)&&t.complete(s),e=""}}function $(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function fe(t){var e,i=(t=t||{}).delimiter,u=t.newline,l=t.comments,p=t.step,m=t.preview,A=t.fastMode,E=e=t.quoteChar===void 0||t.quoteChar===null?'"':t.quoteChar;if(t.escapeChar!==void 0&&(E=t.escapeChar),(typeof i!="string"||-1<d.BAD_DELIMITERS.indexOf(i))&&(i=","),l===i)throw new Error("Comment character same as delimiter");l===!0?l="#":(typeof l!="string"||-1<d.BAD_DELIMITERS.indexOf(l))&&(l=!1),u!==`
`&&u!=="\r"&&u!==`\r
`&&(u=`
`);var r=0,a=!1;this.parse=function(n,c,f){if(typeof n!="string")throw new Error("Input must be a string");var s=n.length,y=i.length,L=u.length,S=l.length,F=v(p),I=[],D=[],h=[],b=r=0;if(!n)return N();if(A||A!==!1&&n.indexOf(e)===-1){for(var R=n.split(u),T=0;T<R.length;T++){if(h=R[T],r+=h.length,T!==R.length-1)r+=u.length;else if(f)return N();if(!l||h.substring(0,S)!==l){if(F){if(I=[],P(h.split(i)),te(),a)return N()}else P(h.split(i));if(m&&m<=T)return I=I.slice(0,m),N(!0)}}return N()}for(var g=n.indexOf(i,r),k=n.indexOf(u,r),x=new RegExp($(E)+$(e),"g"),_=n.indexOf(e,r);;)if(n[r]!==e)if(l&&h.length===0&&n.substring(r,r+S)===l){if(k===-1)return N();r=k+L,k=n.indexOf(u,r),g=n.indexOf(i,r)}else if(g!==-1&&(g<k||k===-1))h.push(n.substring(r,g)),r=g+y,g=n.indexOf(i,r);else{if(k===-1)break;if(h.push(n.substring(r,k)),B(k+L),F&&(te(),a))return N();if(m&&I.length>=m)return N(!0)}else for(_=r,r++;;){if((_=n.indexOf(e,_+1))===-1)return f||D.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:I.length,index:r}),W();if(_===s-1)return W(n.substring(r,_).replace(x,e));if(e!==E||n[_+1]!==E){if(e===E||_===0||n[_-1]!==E){g!==-1&&g<_+1&&(g=n.indexOf(i,_+1)),k!==-1&&k<_+1&&(k=n.indexOf(u,_+1));var X=ee(k===-1?g:Math.min(g,k));if(n.substr(_+1+X,y)===i){h.push(n.substring(r,_).replace(x,e)),n[r=_+1+X+y]!==e&&(_=n.indexOf(e,r)),g=n.indexOf(i,r),k=n.indexOf(u,r);break}var H=ee(k);if(n.substring(_+1+H,_+1+H+L)===u){if(h.push(n.substring(r,_).replace(x,e)),B(_+1+H+L),g=n.indexOf(i,r),_=n.indexOf(e,r),F&&(te(),a))return N();if(m&&I.length>=m)return N(!0);break}D.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:I.length,index:r}),_++}}else _++}return W();function P(U){I.push(U),b=r}function ee(U){var oe=0;if(U!==-1){var Q=n.substring(_+1,U);Q&&Q.trim()===""&&(oe=Q.length)}return oe}function W(U){return f||(U===void 0&&(U=n.substring(r)),h.push(U),r=s,P(h),F&&te()),N()}function B(U){r=U,P(h),h=[],k=n.indexOf(u,r)}function N(U){return{data:I,errors:D,meta:{delimiter:i,linebreak:u,aborted:a,truncated:!!U,cursor:b+(c||0)}}}function te(){p(N()),I=[],D=[]}},this.abort=function(){a=!0},this.getCharIndex=function(){return r}}function ve(t){var e=t.data,i=V[e.workerId],u=!1;if(e.error)i.userError(e.error,e.file);else if(e.results&&e.results.data){var l={abort:function(){u=!0,ke(e.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:be,resume:be};if(v(i.userStep)){for(var p=0;p<e.results.data.length&&(i.userStep({data:e.results.data[p],errors:e.results.errors,meta:e.results.meta},l),!u);p++);delete e.results}else v(i.userChunk)&&(i.userChunk(e.results,l,e.file),delete e.results)}e.finished&&!u&&ke(e.workerId,e.results)}function ke(t,e){var i=V[t];v(i.userComplete)&&i.userComplete(e),i.terminate(),delete V[t]}function be(){throw new Error("Not implemented.")}function pe(t){if(typeof t!="object"||t===null)return t;var e=Array.isArray(t)?[]:{};for(var i in t)e[i]=pe(t[i]);return e}function J(t,e){return function(){t.apply(e,arguments)}}function v(t){return typeof t=="function"}return re&&(o.onmessage=function(t){var e=t.data;if(d.WORKER_ID===void 0&&e&&(d.WORKER_ID=e.workerId),typeof e.input=="string")o.postMessage({workerId:d.WORKER_ID,results:d.parse(e.input,e.config),finished:!0});else if(o.File&&e.input instanceof File||e.input instanceof Object){var i=d.parse(e.input,e.config);i&&o.postMessage({workerId:d.WORKER_ID,results:i,finished:!0})}}),(Z.prototype=Object.create(M.prototype)).constructor=Z,(ne.prototype=Object.create(M.prototype)).constructor=ne,(ie.prototype=Object.create(ie.prototype)).constructor=ie,(se.prototype=Object.create(M.prototype)).constructor=se,d})})(yt);const Et=Se,vt="1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M",kt="https://docs.google.com/spreadsheets/d/",bt=kt+vt,Rt=bt;export{Et as P,Rt as U,Ct as _,ce as l};