import{s as V,f as k,u as A,g as M,h as H,o as N,e as P}from"../chunks/scheduler.D1VUAUKi.js";import{S as q,i as U,e as y,s as T,g as E,h as C,q as W,l as j,k as g,r as d,n as S,o as _,t as F,b as G,B as J,f as K,j as Q,C as R}from"../chunks/index.CRf7HSfo.js";import{a as X,g as Y}from"../chunks/entry.CsXbf8Dp.js";function B(s){return(s==null?void 0:s.length)!==void 0?s:Array.from(s)}const Z=!0,ne=Object.freeze(Object.defineProperty({__proto__:null,prerender:Z},Symbol.toStringTag,{value:"Module"}));function D(s,n,t){const r=s.slice();return r[11]=n[t],r}function O(s){let n,t,r=s[11]+"",v,o,f;function h(...i){return s[7](s[11],...i)}return{c(){n=y("button"),t=y("a"),v=K(r),this.h()},l(i){n=E(i,"BUTTON",{id:!0,class:!0});var m=C(n);t=E(m,"A",{href:!0,tabindex:!0});var u=C(t);v=Q(u,r),u.forEach(g),m.forEach(g),this.h()},h(){d(t,"href","/"+s[11].toLowerCase()),d(t,"tabindex","-1"),d(n,"id",s[11]),d(n,"class","text-xl")},m(i,m){S(i,n,m),_(n,t),_(t,v),o||(f=R(n,"click",h),o=!0)},p(i,m){s=i},d(i){i&&g(n),o=!1,f()}}}function $(s){let n,t,r,v='<h1 class="text-4xl"><a href="/">mxmoss.me</a></h1>',o,f,h,i,m,u,w,b=B(s[2]),e=[];for(let l=0;l<b.length;l+=1)e[l]=O(D(s,b,l));const x=s[5].default,c=k(x,s,s[4],null);return{c(){n=y("div"),t=y("div"),r=y("div"),r.innerHTML=v,o=T(),f=y("div"),h=y("span"),i=T();for(let l=0;l<e.length;l+=1)e[l].c();m=T(),u=y("div"),c&&c.c(),this.h()},l(l){n=E(l,"DIV",{class:!0});var p=C(n);t=E(p,"DIV",{id:!0,class:!0});var a=C(t);r=E(a,"DIV",{id:!0,class:!0,"data-svelte-h":!0}),W(r)!=="svelte-cdxzbr"&&(r.innerHTML=v),o=j(a),f=E(a,"DIV",{id:!0,class:!0});var L=C(f);h=E(L,"SPAN",{class:!0}),C(h).forEach(g),i=j(L);for(let I=0;I<e.length;I+=1)e[I].l(L);L.forEach(g),a.forEach(g),m=j(p),u=E(p,"DIV",{id:!0,class:!0});var z=C(u);c&&c.l(z),z.forEach(g),p.forEach(g),this.h()},h(){d(r,"id","title"),d(r,"class","flex h-full w-fit items-center justify-center pl-16 pr-16"),d(h,"class","absolute bottom-8 h-1 rounded-full bg-white svelte-g0kuh4"),d(f,"id","nav"),d(f,"class","relative flex h-full w-full items-center justify-center gap-10 md:items-center md:justify-start"),d(t,"id","header"),d(t,"class","relative z-10 flex h-[15%] w-full flex-col items-center justify-between overflow-hidden md:h-[10%] md:flex-row md:items-start"),d(u,"id","main"),d(u,"class","relative flex h-[85%] w-full max-w-screen-xl md:h-[90%]"),d(n,"class","flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black")},m(l,p){S(l,n,p),_(n,t),_(t,r),_(t,o),_(t,f),_(f,h),s[6](h),_(f,i);for(let a=0;a<e.length;a+=1)e[a]&&e[a].m(f,null);_(n,m),_(n,u),c&&c.m(u,null),w=!0},p(l,[p]){if(p&14){b=B(l[2]);let a;for(a=0;a<b.length;a+=1){const L=D(l,b,a);e[a]?e[a].p(L,p):(e[a]=O(L),e[a].c(),e[a].m(f,null))}for(;a<e.length;a+=1)e[a].d(1);e.length=b.length}c&&c.p&&(!w||p&16)&&A(c,x,l,l[4],w?H(x,l[4],p,null):M(l[4]),null)},i(l){w||(F(c,l),w=!0)},o(l){G(c,l),w=!1},d(l){l&&g(n),s[6](null),J(e,l),c&&c.d(l)}}}function ee(s,n,t){let{$$slots:r={},$$scope:v}=n,o,f,h=["About","Projects","Connect"],i=e=>{f=e,!(!e||!o)&&(t(0,o.style.top=e.offsetTop+e.offsetHeight+"px",o),t(0,o.style.left=e.offsetLeft+"px",o),t(0,o.style.width=e.offsetWidth+"px",o))},m=()=>{var x;t(1,u=(x=window.location.href.split("/").at(-1))==null?void 0:x.toLowerCase());let e=h.map(c=>c.toLowerCase()).indexOf(u);i(e!==-1?document.getElementById(h[e]):document.getElementById(h[0]))};X(()=>{m()});let u;N(()=>{m(),window.addEventListener("resize",()=>{i(f)})});function w(e){P[e?"unshift":"push"](()=>{o=e,t(0,o)})}const b=(e,x)=>{i(x.target),t(1,u=e.toLowerCase()),Y("/"+e.toLowerCase())};return s.$$set=e=>{"$$scope"in e&&t(4,v=e.$$scope)},[o,u,h,i,v,r,w,b]}class ae extends q{constructor(n){super(),U(this,n,ee,$,V,{})}}export{ae as component,ne as universal};