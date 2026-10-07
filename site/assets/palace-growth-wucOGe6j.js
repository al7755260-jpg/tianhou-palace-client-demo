const m=.24,n=e=>Math.max(0,Math.min(1,e)),c=e=>{const a=n(e);return a*a*(3-2*a)},i=(e,a)=>{let t=Math.imul(e,374761393)^Math.imul(a,668265263);return t=Math.imul(t^t>>>13,1274126177),((t^t>>>16)>>>0)/4294967295};function u(e,a){const t=Math.floor(e),l=Math.floor(a),o=c(e-t),s=c(a-l),f=i(t,l)*(1-o)+i(t+1,l)*o,r=i(t,l+1)*(1-o)+i(t+1,l+1)*o;return f*(1-s)+r*s}function h(e,a,t){const l=n((10.5-e)/21),o=u(e*.62,t*.62)*.68+u(e*1.7+23,t*1.7-11)*.32;return Math.max(.015,Math.min(.72,.035+l*.625+(o-.5)*.105+n(a/3.6)*.04))}function g({reduced:e=!1,duration:a=7.2}={}){const t={value:e?1:0},l={value:0};let o=-.35,s=!1;return{progress:t,clock:l,start(){o=-.35,l.value=0,t.value=e?1:0,s=!e},finish:()=>{o=a,t.value=1,s=!1},seek(r){o=n(r)*a,t.value=n(r),l.value=o,s=!1},tick(r){return s?(o+=Math.max(0,Math.min(r,.1)),l.value=Math.max(0,o),t.value=n(o/a),t.value===1&&(s=!1),!0):!1},pinOpacity(r){return t.value>=1?1:t.value<=0?0:c((t.value-h(...r)-.24*.7)/.105)},get revealing(){return t.value<1},get state(){return{progress:t.value,playing:s,duration:a,direction:"gate-to-rear",style:"curl-tide",phase:t.value>=1?"settled":t.value<.23?"gathering":t.value<.74?"sculpting":"settling"}}}}const p=`
vec3 growthPosition(vec3 surface,float grain,float local,float time){
  float settled=smoothstep(.02,1.0,local);
  float loose=1.0-settled;
  float crest=sin(local*3.14159265);
  vec3 q=surface*vec3(.58,.72,.78);
  vec3 eddy=vec3(cos(q.y+time*.8)-sin(q.z-time*.6),
                 cos(q.z-time*.6)-sin(q.x+time*.45),
                 cos(q.x+time*.45)-sin(q.y+time*.8));
  float fold=sin(surface.z*.78+surface.x*.28-time*1.9+sin(surface.x*.42+time*.6));
  float filament=sin(surface.z*2.3+surface.x*.8-time*2.5)*.12;
  vec3 p=surface;
  p.x+=loose*(2.35+eddy.x*.72+fold*.65);
  p.z+=loose*(eddy.z*.88+fold*.48+(grain-.5)*.36);
  p.y=mix(.04+grain*.09,surface.y,settled)
      +crest*(1.35+fold*.63+grain*.28)+loose*(eddy.y*.12+filament);
  p.y=max(mix(.018,min(.018,surface.y),settled),p.y);
  return p;
}
`,v=`
float growthAlpha=1.0;
float sandEnergy=0.0;
float growthLocal=1.0;
if(uGrowth<1.0){
  float local=clamp((uGrowth-aGrowth-grain*.017)/${.24.toFixed(2)},0.0,1.0);
  growthLocal=local;
  float settled=smoothstep(.12,1.0,local);
  float loose=1.0-settled;
  // Retain the normal ambient deformation after the last grain lands.
  p=growthPosition(position,grain,local,uGrowthTime)+(p-position)*settled;
  growthAlpha=smoothstep(0.0,.13,local);
  sandEnergy=sin(local*3.14159265)*sqrt(loose);
}
`;export{m as G,p as a,v as b,g as c,h as g};
