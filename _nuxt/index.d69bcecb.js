import{u as p}from"./composables.f4d3d53e.js";import{J as S,L as a,M as l,f as h,k as f,p as _,N as b,b as z,e as w,i as v,o as x}from"./entry.c67d78e3.js";import{u as B}from"./config.946f49aa.js";const N=()=>S().$img,k={src:{type:String,required:!0},format:{type:String,default:void 0},quality:{type:[Number,String],default:void 0},background:{type:String,default:void 0},fit:{type:String,default:void 0},modifiers:{type:Object,default:void 0},preset:{type:String,default:void 0},provider:{type:String,default:void 0},sizes:{type:[Object,String],default:void 0},preload:{type:Boolean,default:void 0},width:{type:[String,Number],default:void 0},height:{type:[String,Number],default:void 0},alt:{type:String,default:void 0},referrerpolicy:{type:String,default:void 0},usemap:{type:String,default:void 0},longdesc:{type:String,default:void 0},ismap:{type:Boolean,default:void 0},loading:{type:String,default:void 0},crossorigin:{type:[Boolean,String],default:void 0,validator:e=>["anonymous","use-credentials","",!0,!1].includes(e)},decoding:{type:String,default:void 0,validator:e=>["async","auto","sync"].includes(e)}},A=e=>{const s=a(()=>({provider:e.provider,preset:e.preset})),n=a(()=>({width:l(e.width),height:l(e.height),alt:e.alt,referrerpolicy:e.referrerpolicy,usemap:e.usemap,longdesc:e.longdesc,ismap:e.ismap,crossorigin:e.crossorigin===!0?"anonymous":e.crossorigin||void 0,loading:e.loading,decoding:e.decoding})),i=a(()=>({...e.modifiers,width:l(e.width),height:l(e.height),format:e.format,quality:e.quality,background:e.background,fit:e.fit}));return{options:s,attrs:n,modifiers:i}},q={...k,placeholder:{type:[Boolean,String,Number,Array],default:void 0}},I=h({name:"NuxtImg",props:q,emits:["load"],setup:(e,s)=>{const n=N(),i=A(e),u=f(!1),o=a(()=>n.getSizes(e.src,{...i.options.value,sizes:e.sizes,modifiers:{...i.modifiers.value,width:l(e.width),height:l(e.height)}})),y=a(()=>{const t=i.attrs.value;return e.sizes&&(t.sizes=o.value.sizes,t.srcset=o.value.srcset),t}),d=a(()=>{let t=e.placeholder;if(t===""&&(t=!0),!t||u.value)return!1;if(typeof t=="string")return t;const r=Array.isArray(t)?t:typeof t=="number"?[t,t]:[10,10];return n(e.src,{...i.modifiers.value,width:r[0],height:r[1],quality:r[2]||50},i.options.value)}),c=a(()=>e.sizes?o.value.src:n(e.src,i.modifiers.value,i.options.value)),g=a(()=>d.value?d.value:c.value);if(e.preload){const t=Object.values(o.value).every(r=>r);p({link:[{rel:"preload",as:"image",...t?{href:o.value.src,imagesizes:o.value.sizes,imagesrcset:o.value.srcset}:{href:g.value}}]})}const m=f();return _(()=>{if(d.value){const t=new Image;t.src=c.value,t.onload=r=>{m.value.src=c.value,u.value=!0,s.emit("load",r)}}else m.value.onload=t=>{s.emit("load",t)}}),()=>b("img",{ref:m,key:g.value,src:g.value,...y.value,...s.attrs})}}),j=v("h1",null,[v("a",{href:"https://miro.com/app/board/uXjVPyPTepA=/"},"Bussi")],-1),V=h({__name:"index",setup(e){const s=B();return console.log(s.theme),(n,i)=>{const u=I;return x(),z("div",null,[j,w(u,{src:"../../bussi/img/bussi.png",sizes:"xs:250px sm:600px md:750px lg:1000px",width:"100%",height:"100%",placeholder:""})])}}});export{V as default};