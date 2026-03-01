import{p as v,a as w,i as h,b as n,c as y,f as o,s as _,t as b,g as s,d as D,e as l}from"./iframe-BEuEdeYe.js";import{c as $,i as z,d as k}from"./create-runtime-stories-D6-HviEO.js";import{e as A,i as G}from"./each-E378PhCk.js";import{s as p}from"./attributes-C64GhF8c.js";import"./preload-helper-PPVm8Dsz.js";import"./style-B-cN0yBz.js";const C={title:"Utilities/AssetsGallery",tags:["autodocs"]},{Story:S}=k();var E=o('<figure style="width:160px;text-align:center;margin:0;"><img style="width:100%;height:auto;border-radius:8px;border:1px solid #eee;"/> <figcaption style="font-size:12px;margin-top:6px;color:#444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"> </figcaption></figure>'),M=o('<div style="padding:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;"></div>');function g(d,a){v(a,!1);let f=w(a,"images",24,()=>["/assets/img/barbarian.png","/assets/img/dwarf.png","/assets/img/elf.png","/assets/img/thiefling.png","/assets/img/wizard.png"]);z(),S(d,{name:"Default",children:h,$$slots:{default:(m,P)=>{var i=M();A(i,5,f,G,(c,e)=>{var r=E(),t=l(r),x=_(t,2),u=l(x);b(()=>{p(t,"src",s(e)),p(t,"alt",s(e)),D(u,s(e))}),n(c,r)}),n(m,i)}},parameters:{__svelteCsf:{rawCode:`<undefined {...args}>
  <div\r
style="padding:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;"\r
>\r
{#each images as src}\r
  <figure style="width:160px;text-align:center;margin:0;">\r
    <img\r
      {src}\r
      alt={src}\r
      style="width:100%;height:auto;border-radius:8px;border:1px solid #eee;"\r
    />\r
    <figcaption\r
      style="font-size:12px;margin-top:6px;color:#444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"\r
    >\r
      {src}\r
    </figcaption>\r
  </figure>\r
{/each}\r
</div>
</undefined>`}}}),y()}g.__docgen={data:[{name:"images",visibility:"public",keywords:[],kind:"let",type:{kind:"type",type:"array",text:"string[]"},static:!1,readonly:!1,defaultValue:`[\r
    "/assets/img/barbarian.png",\r
    "/assets/img/dwarf.png",\r
    "/assets/img/elf.png",\r
    "/assets/img/thiefling.png",\r
    "/assets/img/wizard.png",\r
  ]`}],name:"AssetsGallery.stories.svelte"};const O=$(g,C),F=["Default"],H={...O.Default,tags:["svelte-csf-v5"]};export{H as Default,F as __namedExportsOrder,C as default};
