/* R Ranch Enterprises shared engine: header/footer, reviews, icons, 3D tilt + magnetic buttons */
(function(){
'use strict';

const BIZ = {
  name:"R Ranch Enterprises", short:"R Ranch",
  phone:"(208) 318-8888", tel:"+12083188888",
  addr:"2910 Cleveland Blvd", city:"Caldwell", state:"ID", zip:"83605",
  rating:"4.7", reviews:"101",
  maps:"https://www.google.com/maps/place/R+Ranch+Enterprises/@43.6487501,-116.6674496,17z",
  dir:"https://www.google.com/maps/dir/?api=1&destination=R+Ranch+Enterprises+2910+Cleveland+Blvd+Caldwell+ID",
  lat:43.6487501, lng:-116.6674496,
  hours:[["Mon","11 AM to 5 PM",1],["Tue","11 AM to 5 PM",2],["Wed","11 AM to 5 PM",3],
         ["Thu","11 AM to 5 PM",4],["Fri","10 AM to 5 PM",5],["Sat","10 AM to 4 PM",6],["Sun","Closed",0]],
  // open ranges by JS day index (0=Sun): [openMin, closeMin] or null
  ranges:{0:null,1:[660,1020],2:[660,1020],3:[660,1020],4:[660,1020],5:[600,1020],6:[600,960]}
};

const I = {
  pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  phone:'<path d="M5 4h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow:'<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  saddle:'<path d="M4 9c3-2 13-2 16 0"/><path d="M6 9c0 4 1 7 6 7s6-3 6-7"/><path d="M9 16l-1 4M15 16l1 4"/><path d="M10.5 9.5c.5 2 2.5 2 3 0"/>',
  rope:'<path d="M4 7c4 0 4 5 8 5s4-5 8-5"/><path d="M4 13c4 0 4 5 8 5s4-5 8-5"/>',
  gem:'<path d="M6 3h12l3 6-9 12L3 9Z"/><path d="M3 9h18M9 3 7.5 9 12 21l4.5-12L15 3"/>',
  hat:'<path d="M7 14c0-4 .8-8 5-8s5 4 5 8"/><path d="M3 15c2 1.6 5.5 2.5 9 2.5S19 16.6 21 15c-1 2-4 3.2-9 3.2S4 17 3 15Z"/>',
  bag:'<path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  tag:'<path d="M3 12 12 3h7v7l-9 9-7-7Z"/><circle cx="15.5" cy="8.5" r="1.4"/>',
  star:'<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.8Z"/>',
  heart:'<path d="M12 20s-7-4.6-9.2-8.4C1.2 8.6 3 5.5 6.2 5.5c1.9 0 3 1 3.8 2 .8-1 1.9-2 3.8-2 3.2 0 5 3.1 3.4 6.1C19 15.4 12 20 12 20Z"/>',
  truck:'<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
  hand:'<path d="M7 11V6a1.6 1.6 0 0 1 3.2 0M10.2 10V4.6a1.6 1.6 0 0 1 3.2 0V10M13.4 10V6a1.6 1.6 0 0 1 3.2 0v7c0 4-2.6 7-6.4 7-2.4 0-3.8-1-5.2-3l-2-3.2a1.6 1.6 0 0 1 2.6-1.8L7 14"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  shield:'<path d="M12 3 5 6v5c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V6Z"/><path d="m9 12 2 2 4-4"/>'
};
const ic = (k,cls)=> `<svg class="icon ${cls||''}" viewBox="0 0 24 24" aria-hidden="true">${I[k]||''}</svg>`;

const DEPTS = [
  {slug:"saddles", t:"Saddles, New & Used", icon:"saddle", blurb:"New and pre-owned saddles for every discipline, with honest fitting advice and our same-day try-out so you know it fits before you commit."},
  {slug:"tack", t:"Tack & Riding Gear", icon:"rope", blurb:"Bridles, bits, reins, halters, lead ropes, cinches, pads and grooming. Quality gear at fair prices, new and gently used."},
  {slug:"jewelry", t:"Western Jewelry", icon:"gem", blurb:"Turquoise, earrings and cowgirl pieces that customers drive across the valley for. The kind of detail that finishes the look."},
  {slug:"hats", t:"Hats & Caps", icon:"hat", blurb:"Felt and straw cowboy hats plus a wall of caps, ready for the arena, the ranch, or a Saturday in town."},
  {slug:"apparel", t:"Purses, Apparel & Gifts", icon:"bag", blurb:"Purses, western apparel and gifts worth the stop, even if you do not own a horse. An underrated find in Caldwell."},
  {slug:"used-gear", t:"Used & Consignment Gear", icon:"tag", blurb:"A rotating stock of quality used tack and saddles. Great deals for first horses and savvy riders who know value."}
];

const REVIEWS = [
  {n:"Amanda Brock", d:"2 months ago", t:"Beautiful store, great items! They were excellent giving me advice and helping me pick out the things she needs."},
  {n:"Kim McCarver", d:"6 months ago", t:"Customer service is amazing. This is the place to go for anything cowgirl, cowboy, or horse accessories. Gorgeous earrings. Love this place!"},
  {n:"Fontaine Family", d:"7 months ago", t:"R Ranch is one of those hidden treasures that reminds you what makes Idaho special. The owner is the perfect example of old Idaho hospitality, kind, knowledgeable, and genuinely interested in the people who walk through her door."},
  {n:"Megan S", d:"6 months ago", t:"Great deals and lots of tack and jewelry. New and used saddles. The staff is friendly and helpful!"},
  {n:"Robert Rydalch", d:"3 years ago", t:"I was looking for a saddle for my daughter's new horse. Melissa was very knowledgeable and helpful in picking a saddle. We were able to take the saddle and try it out the same day, 24 hours no risk return if it doesn't fit."},
  {n:"Kahlyn Furey", d:"3 years ago", t:"This was my first time coming into this place and I am so glad I did. I came in just looking around and walked out with a new saddle. The woman was very knowledgeable and had amazing conversations. I appreciate how honest she was."},
  {n:"Bethany Mikitish", d:"a year ago", t:"Love this shop! A great resource for tack and horse related items, and an underrated place to find something special."}
];
const HIGHLIGHTS = [
  "Great service, lots of tack at good prices, strongly recommend this place.",
  "Best place to buy great horse equipment, love my new stuff and for a great price.",
  "Friendly staff, cute dogs. What's not to love?"
];

// reviews shown on each department page
const DEPT_REVIEWS = {
  saddles:[REVIEWS[4],REVIEWS[5]],
  tack:[REVIEWS[3],REVIEWS[0]],
  jewelry:[REVIEWS[1],REVIEWS[6]],
  hats:[REVIEWS[6],REVIEWS[0]],
  apparel:[REVIEWS[6],REVIEWS[1]],
  "used-gear":[REVIEWS[3],REVIEWS[4]]
};

const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const starRow = '★★★★★';

function openStatus(){
  const now=new Date(); const d=now.getDay(); const m=now.getHours()*60+now.getMinutes();
  const r=BIZ.ranges[d];
  if(r && m>=r[0] && m<r[1]) return {open:true,txt:"Open now"};
  return {open:false,txt:"Come see us"};
}

function header(active){
  const links=[["index.html","Home"],["services.html","Departments"],["shop.html","Shop"],["blog.html","Saddle Up Journal"],["index.html#visit","Visit"]];
  const nav = links.map(l=>`<a href="${l[0]}"${active===l[0]?' aria-current="page"':''}>${l[1]}</a>`).join('');
  const st=openStatus();
  return `
  <div class="topbar"><div class="wrap">
    <span class="tb-item">${ic('pin')} ${BIZ.addr}, ${BIZ.city}, ${BIZ.state}</span>
    <span class="tb-item"><span class="dot"></span> ${st.txt} · Tue to Sat</span>
    <a class="tb-item" href="tel:${BIZ.tel}">${ic('phone')} ${BIZ.phone}</a>
  </div></div>
  <header class="site">
    <div class="nav">
      <a class="brand" href="index.html" aria-label="${BIZ.name} home">
        ${brandmark()}
        <span><span class="bn">R Ranch</span><br><span class="bs">Tack &amp; Western · Caldwell</span></span>
      </a>
      <nav class="navlinks" aria-label="Primary">${nav}</nav>
      <a class="btn btn-primary navcta magnetic" href="tel:${BIZ.tel}">${ic('phone')} Call the shop</a>
      <button class="burger" aria-label="Open menu" aria-expanded="false">${ic('menu')}</button>
    </div>
    <nav class="mobnav" aria-label="Mobile">${nav}<a href="tel:${BIZ.tel}">Call ${BIZ.phone}</a></nav>
  </header>`;
}

function brandmark(){
  return `<svg class="brandmark" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#5a3719"/>
    <circle cx="32" cy="32" r="30" fill="none" stroke="#bd9230" stroke-width="2"/>
    <circle cx="32" cy="32" r="24" fill="none" stroke="#0e8a7f" stroke-width="1.4" stroke-dasharray="2 3"/>
    <text x="32" y="40" text-anchor="middle" font-family="Fraunces,serif" font-weight="600" font-size="26" fill="#f7f0e1">R</text>
  </svg>`;
}

function footer(){
  const hrs=BIZ.hours.map(h=>`<span class="d">${h[0]}</span><span>${h[1]}</span>`).join('');
  const depts=DEPTS.map(d=>`<li><a href="${d.slug}.html">${d.t}</a></li>`).join('');
  return `<div class="wrap">
    <div class="cols">
      <div>
        <div class="brand" style="margin-bottom:14px">${brandmark()}<span><span class="bn" style="color:#fff">R Ranch Enterprises</span><br><span class="bs" style="color:#bcae98">Caldwell, Idaho</span></span></div>
        <p style="max-width:330px;color:#c9bca7">A family run, woman owned tack shop and western store on Cleveland Blvd. New and used saddles, tack, turquoise jewelry, hats and gifts, with honest old Idaho hospitality.</p>
        <div class="frow">${ic('star')}<span>${BIZ.rating} stars from ${BIZ.reviews} Google reviews</span></div>
      </div>
      <div>
        <h4>Departments</h4><ul>${depts}</ul>
      </div>
      <div>
        <h4>Visit the shop</h4>
        <div class="frow">${ic('pin')}<a href="${BIZ.maps}">${BIZ.addr}<br>${BIZ.city}, ${BIZ.state} ${BIZ.zip}</a></div>
        <div class="frow">${ic('phone')}<a href="tel:${BIZ.tel}">${BIZ.phone}</a></div>
        <h4 style="margin-top:20px">Hours</h4>
        <div class="hours">${hrs}</div>
      </div>
    </div>
    <div class="legal">
      <span>© <span id="yr"></span> R Ranch Enterprises. All rights reserved.</span>
      <span>${BIZ.addr}, ${BIZ.city}, ${BIZ.state} ${BIZ.zip} · ${BIZ.phone}</span>
    </div>
  </div>`;
}

function revCard(r){
  return `<div class="rev"><div class="stars" aria-label="5 out of 5 stars">${starRow}</div>
    <p>${r.t}</p>
    <div class="who"><span class="av">${initials(r.n)}</span><span><span class="nm">${r.n}</span><br><span class="dt">${r.d} · Google</span></span></div></div>`;
}

function deptCard(d){
  return `<a class="tilt-card magnetic-soft" href="${d.slug}.html" aria-label="${d.t}">
    <div class="glare"></div>
    <div class="body">
      <div class="ic">${ic(d.icon)}</div>
      <h3>${d.t}</h3>
      <p>${d.blurb}</p>
      <span class="go">Explore ${ic('arrow')}</span>
    </div></a>`;
}

/* ---------- 3D tilt + magnetic buttons ---------- */
function initTilt(){
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(!fine || reduce) return;
  document.querySelectorAll('.tilt-card').forEach(card=>{
    const max=8;
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      const ry=(px-0.5)*max*2, rx=-(py-0.5)*max*2;
      card.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty('--gx',(px*100)+'%');
      card.style.setProperty('--gy',(py*100)+'%');
      card.classList.add('lift');
    });
    const reset=()=>{card.style.transform='';card.classList.remove('lift');};
    card.addEventListener('pointerleave',reset);
    card.addEventListener('blur',reset);
  });
  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach(btn=>{
    const strength=18;
    btn.addEventListener('pointermove',e=>{
      const r=btn.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)/(r.width/2);
      const y=(e.clientY-r.top-r.height/2)/(r.height/2);
      btn.style.transform=`translate(${x*strength}px,${y*strength}px)`;
    });
    btn.addEventListener('pointerleave',()=>{btn.style.transform='';});
  });
}

function burger(){
  const b=document.querySelector('.burger'), m=document.querySelector('.mobnav');
  if(!b||!m) return;
  b.addEventListener('click',()=>{const o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);});
}

function build(){
  const active=(location.pathname.split('/').pop()||'index.html');
  const h=document.getElementById('site-header'); if(h) h.innerHTML=header(active);
  const f=document.getElementById('site-footer'); if(f) f.innerHTML=footer();
  const yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

  const dg=document.getElementById('dept-grid'); if(dg) dg.innerHTML=DEPTS.map(deptCard).join('');
  const rg=document.getElementById('review-grid');
  if(rg) rg.innerHTML=REVIEWS.slice(0,6).map(revCard).join('');
  const car=document.getElementById('review-carousel');
  if(car){ const all=REVIEWS.concat(REVIEWS); car.innerHTML=`<div class="ctrack">${all.map(revCard).join('')}</div>`; }
  // department page mini reviews
  const dr=document.getElementById('dept-reviews');
  if(dr){ const slug=dr.dataset.slug; const rs=DEPT_REVIEWS[slug]||REVIEWS.slice(0,2);
    dr.innerHTML=rs.map(r=>`<div class="minirev"><div class="stars">${starRow}</div><p>${r.t}</p><span class="nm">${r.n} · ${r.d}</span></div>`).join(''); }
  // highlights strip (optional container)
  const hl=document.getElementById('highlights');
  if(hl) hl.innerHTML=HIGHLIGHTS.map(h=>`<div class="rev" style="width:320px"><div class="stars">${starRow}</div><p>${h}</p><div class="who"><span class="av">${ic('heart')}</span><span class="dt">Verified Google review</span></div></div>`).join('');

  burger();
  initTilt();
}
if(document.readyState!=='loading') build(); else document.addEventListener('DOMContentLoaded',build);
})();
