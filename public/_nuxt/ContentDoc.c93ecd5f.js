import{L as h,a1 as g,I as w,aa as y,F as C,Z as v,an as D,ao as _,h as r}from"./app.config.886a5076.js";import{u as S}from"./composables.88d95984.js";import q from"./ContentRenderer.b2ec6995.js";import{_ as x}from"./ContentQuery.4d4236ff.js";import"./ContentRendererMarkdown.7c4a0f81.js";import"./index.a6ef77ff.js";import"./_commonjsHelpers.725317a4.js";import"./entry.556ab2a9.js";import"./cookie.5162bdac.js";import"./query.c3f7607a.js";import"./utils.ddd94b0c.js";const a=(p,e=y())=>{const c=h(p),u=g();w(()=>h(p),(t=c)=>{if(!e.path||!t)return;const n=Object.assign({},(t==null?void 0:t.head)||{});n.meta=[...n.meta||[]],n.link=[...n.link||[]];const m=n.title||(t==null?void 0:t.title);m&&(n.title=m),u.public.content.host;const s=(n==null?void 0:n.description)||(t==null?void 0:t.description);s&&n.meta.filter(i=>i.name==="description").length===0&&n.meta.push({name:"description",content:s}),n!=null&&n.image||(t==null||t.image),C(()=>S(n))},{immediate:!0})},I=v({name:"ContentDoc",props:{tag:{type:String,required:!1,default:"div"},excerpt:{type:Boolean,default:!1},path:{type:String,required:!1,default:void 0},query:{type:Object,required:!1,default:void 0},head:{type:Boolean,required:!1,default:!0}},render(p){const e=D(),{tag:c,excerpt:u,path:f,query:t,head:n}=p,m={...t||{},path:f||(t==null?void 0:t.path)||_(y().path),find:"one"},s=(i,o)=>r("pre",null,JSON.stringify({message:"You should use slots with <ContentDoc>",slot:i,data:o},null,2));return r(x,m,{default:e!=null&&e.default?({data:i,refresh:o,isPartial:d})=>{var l;return n&&a(i),(l=e.default)==null?void 0:l.call(e,{doc:i,refresh:o,isPartial:d,excerpt:u,...this.$attrs})}:({data:i})=>(n&&a(i),r(q,{value:i,excerpt:u,tag:c,...this.$attrs},{empty:o=>e!=null&&e.empty?e.empty(o):s("default",i)})),empty:i=>{var o;return((o=e==null?void 0:e.empty)==null?void 0:o.call(e,i))||r("p",null,"Document is empty, overwrite this content with #empty slot in <ContentDoc>.")},"not-found":i=>{var o;return((o=e==null?void 0:e["not-found"])==null?void 0:o.call(e,i))||r("p",null,"Document not found, overwrite this content with #not-found slot in <ContentDoc>.")}})}});export{I as default};