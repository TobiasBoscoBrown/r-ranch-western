const PRODUCTS=[{"id": "sd-ranch", "dept": "Saddles", "name": "Ranch Work Saddle", "price": "$1,250", "desc": "Roughout fenders and a hard-wearing tree built for long days working cattle.", "img": "images/shop-saddles.jpg", "options": [{"label": "Seat Size", "type": "single", "required": true, "choices": [{"n": "15\""}, {"n": "15.5\""}, {"n": "16\""}, {"n": "16.5\""}, {"n": "17\""}]}]}, {"id": "sd-barrel", "dept": "Saddles", "name": "Barrel Racing Saddle", "price": "$1,450", "desc": "Lightweight tree and a secure, close-contact seat for speed events.", "img": "images/shop-saddles.jpg", "options": [{"label": "Seat Size", "type": "single", "required": true, "choices": [{"n": "15\""}, {"n": "15.5\""}, {"n": "16\""}, {"n": "16.5\""}, {"n": "17\""}]}]}, {"id": "sd-trail", "dept": "Saddles", "name": "Trail Saddle (Used)", "price": "$695", "desc": "Gently used and broken in for comfortable all-day trail riding.", "img": "images/shop-used.jpg", "options": [{"label": "Seat Size", "type": "single", "required": true, "choices": [{"n": "15\""}, {"n": "15.5\""}, {"n": "16\""}, {"n": "16.5\""}, {"n": "17\""}]}], "used": true}, {"id": "sd-youth", "dept": "Saddles", "name": "Youth Saddle", "price": "$425", "desc": "Sized right for young riders just learning the ropes.", "img": "images/shop-used.jpg", "options": [{"label": "Seat Size", "type": "single", "required": true, "choices": [{"n": "12\""}, {"n": "13\""}, {"n": "14\""}]}]}, {"id": "tk-headstall", "dept": "Tack & Riding Gear", "name": "Leather Headstall", "price": "$79", "desc": "Hand-finished browband headstall in supple harness leather.", "img": "images/shop-tack.jpg", "options": [{"label": "Leather", "type": "single", "required": true, "choices": [{"n": "Chestnut"}, {"n": "Dark Oil"}, {"n": "Natural"}]}]}, {"id": "tk-halter", "dept": "Tack & Riding Gear", "name": "Nylon Halter", "price": "$24", "desc": "Tough everyday halter in a wall of colors.", "img": "images/leather-tack.jpg", "options": [{"label": "Color", "type": "single", "required": true, "choices": [{"n": "Black"}, {"n": "Teal"}, {"n": "Hot Pink"}, {"n": "Purple"}, {"n": "Royal Blue"}, {"n": "Turquoise"}]}]}, {"id": "tk-reins", "dept": "Tack & Riding Gear", "name": "Roping Reins", "price": "$39", "desc": "Heavy harness-leather reins with a sure grip.", "img": "images/leather-tack.jpg"}, {"id": "tk-pad", "dept": "Tack & Riding Gear", "name": "Wool Saddle Pad", "price": "$115", "desc": "Wool-blend pad that wicks sweat and cushions the back.", "img": "images/shop-tack.jpg"}, {"id": "tk-bit", "dept": "Tack & Riding Gear", "name": "Stainless Snaffle Bit", "price": "$45", "desc": "Gentle, everyday stainless snaffle.", "img": "images/tack-wall.jpg"}, {"id": "ht-felt", "dept": "Hats & Caps", "name": "Felt Cowboy Hat", "price": "$189", "desc": "Classic felt with a shapeable brim, ready for the arena or town.", "img": "images/cowboy-hat.jpg", "options": [{"label": "Hat Size", "type": "single", "required": true, "choices": [{"n": "6 3/4"}, {"n": "6 7/8"}, {"n": "7"}, {"n": "7 1/8"}, {"n": "7 1/4"}, {"n": "7 3/8"}]}]}, {"id": "ht-straw", "dept": "Hats & Caps", "name": "Straw Cowboy Hat", "price": "$59", "desc": "Vented straw that keeps you cool on hot arena days.", "img": "images/cowboy-hat.jpg", "options": [{"label": "Hat Size", "type": "single", "required": true, "choices": [{"n": "6 3/4"}, {"n": "6 7/8"}, {"n": "7"}, {"n": "7 1/8"}, {"n": "7 1/4"}, {"n": "7 3/8"}]}]}, {"id": "ht-cap", "dept": "Hats & Caps", "name": "Snapback Trucker Cap", "price": "$26", "desc": "Rotating western designs, one size snapback.", "img": "images/shop-caps.jpg"}, {"id": "ug-saddle", "dept": "Used & Consignment", "name": "Consignment Saddle", "price": "$850", "desc": "Quality pre-owned saddle from our rotating consignment rack.", "img": "images/shop-used.jpg", "options": [{"label": "Seat Size", "type": "single", "required": true, "choices": [{"n": "15\""}, {"n": "15.5\""}, {"n": "16\""}, {"n": "16.5\""}, {"n": "17\""}]}], "used": true}, {"id": "ug-bundle", "dept": "Used & Consignment", "name": "Used Tack Bundle", "price": "$60", "desc": "A mixed bundle of gently used tack, great for a first horse.", "img": "images/shop-used.jpg", "used": true}];
const DEPTS=["Saddles", "Tack & Riding Gear", "Hats & Caps", "Used & Consignment"];

const WEB3FORMS_KEY="7d621113-d9c7-4c1a-8d8d-caf0c50e2811";
const SHOP_PHONE="(208) 318-8888", SHOP_ADDR="2910 Cleveland Blvd, Caldwell, ID 83605";
const NOTE_MAX=140;
const cart={}; let draft=null, activeDept="All", checkoutOpen=false;
const $=s=>document.querySelector(s);
function money(n){return "$"+n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
function priceNum(p){const m=String(p||"").replace(/,/g,'').match(/\d+(\.\d+)?/);return m?parseFloat(m[0]):0;}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function save(){try{localStorage.setItem("rr_cart",JSON.stringify(cart));}catch(e){}}
function load(){try{Object.assign(cart,JSON.parse(localStorage.getItem("rr_cart")||"{}"));}catch(e){}}
function prod(id){return PRODUCTS.find(p=>p.id===id);}
function items(){return Object.values(cart);}
function count(){return items().reduce((a,b)=>a+b.qty,0);}
function subtotal(){return items().reduce((a,b)=>a+b.price*b.qty,0);}
function optsFlat(o){let a=[];for(const k in o){if(o[k])a.push(o[k]);}return a.join(", ");}

function renderFilter(){
  const f=$("#dept-filter"); if(!f)return;
  const chips=["All"].concat(DEPTS);
  f.innerHTML=chips.map(c=>`<button data-dept="${esc(c)}" class="chip${c===activeDept?' on':''}">${esc(c)}</button>`).join("");
  f.querySelectorAll("[data-dept]").forEach(b=>b.onclick=()=>{activeDept=b.getAttribute("data-dept");renderFilter();renderGrid();});
}
function renderGrid(){
  const g=$("#product-grid"); if(!g)return;
  const list=PRODUCTS.filter(p=>activeDept==="All"||p.dept===activeDept);
  g.innerHTML=list.map(p=>`
    <div class="pcard">
      <button class="pimg" data-open="${p.id}" aria-label="View ${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy">${p.used?'<span class="badge">Used</span>':''}</button>
      <div class="pbody">
        <div class="pdept">${esc(p.dept)}</div>
        <h3 class="pname">${esc(p.name)}</h3>
        <p class="pdesc">${esc(p.desc)}</p>
        <div class="prow"><span class="pprice">${esc(p.price)}</span><button class="btn btn-primary psm" data-open="${p.id}">${p.options?'Choose':'Add'}</button></div>
      </div>
    </div>`).join("");
  g.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openSheet(b.getAttribute("data-open")));
}

function openSheet(id){
  const p=prod(id); if(!p)return; const opts={}; (p.options||[]).forEach(g=>opts[g.label]="");
  draft={p,opts,note:"",qty:1}; renderSheet(); $("#sheet").classList.add("show"); document.body.style.overflow="hidden";
}
function closeSheet(){$("#sheet").classList.remove("show");document.body.style.overflow="";draft=null;}
function ready(){return draft&&(draft.p.options||[]).every(g=>!g.required||draft.opts[g.label]);}
function renderSheet(){
  const s=$("#sheet"); const p=draft.p; const sc=s.querySelector(".sheet-scroll"); const top=sc?sc.scrollTop:0;
  let groups=(p.options||[]).map(g=>`<div class="og"><div class="oglabel">${esc(g.label)}${g.required?' <span class="req">*</span>':''}</div><div class="ogchoices">`+
    g.choices.map(c=>`<button data-sg="${esc(g.label)}" data-v="${esc(c.n)}" class="ochip${draft.opts[g.label]===c.n?' on':''}">${esc(c.n)}</button>`).join("")+`</div></div>`).join("");
  s.innerHTML=`<div class="sheet-back" data-close></div>
    <div class="sheet-scroll">
      <button class="sheet-x" data-close aria-label="Close">&times;</button>
      <img class="sheet-img" src="${p.img}" alt="${esc(p.name)}">
      <div class="sheet-dept">${esc(p.dept)}${p.used?' · Used':''}</div>
      <h3 class="sheet-name">${esc(p.name)}</h3>
      <div class="sheet-price">${esc(p.price)}</div>
      <p class="sheet-desc">${esc(p.desc)}</p>
      ${groups}
      <div class="og"><div class="oglabel">Special request</div>
        <input id="s-note" maxlength="${NOTE_MAX}" value="${esc(draft.note)}" placeholder="Color, condition question, sizing note..." class="sinput">
        <div class="ccount"><span id="nc">${draft.note.length}</span>/${NOTE_MAX}</div></div>
      <div class="sheet-add">
        <div class="qty"><button id="qd">&minus;</button><span id="qv">${draft.qty}</span><button id="qi">+</button></div>
        <button id="sadd" class="btn btn-primary grow"${ready()?'':' disabled'}>Add ${draft.qty} to cart</button>
      </div>
    </div>`;
  const ns=s.querySelector(".sheet-scroll"); if(ns)ns.scrollTop=top;
  s.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeSheet);
  s.querySelectorAll("[data-sg]").forEach(b=>b.onclick=()=>{const g=b.getAttribute("data-sg"),v=b.getAttribute("data-v");draft.opts[g]=draft.opts[g]===v?"":v;renderSheet();});
  const note=$("#s-note"); if(note)note.oninput=()=>{draft.note=note.value;$("#nc").textContent=note.value.length;};
  $("#qd").onclick=()=>{draft.qty=Math.max(1,draft.qty-1);renderSheet();};
  $("#qi").onclick=()=>{draft.qty++;renderSheet();};
  const add=$("#sadd"); add.onclick=()=>{if(ready())addDraft();};
}
function addDraft(){
  const p=draft.p; const key=p.id+"|"+JSON.stringify(draft.opts)+"|"+draft.note;
  if(!cart[key])cart[key]={id:p.id,name:p.name,price:priceNum(p.price),qty:0,opts:Object.assign({},draft.opts),note:draft.note,img:p.img};
  cart[key].qty+=draft.qty; save(); closeSheet(); renderCart(); openDrawer();
}

function openDrawer(){$("#cart-drawer").classList.add("show");document.body.style.overflow="hidden";}
function closeDrawer(){$("#cart-drawer").classList.remove("show");document.body.style.overflow="";checkoutOpen=false;}
function setQty(k,q){if(!cart[k])return;cart[k].qty=q;if(q<=0)delete cart[k];save();renderCart();}
function renderCart(){
  const d=$("#cart-drawer"); const its=Object.entries(cart);
  const rows=its.length?its.map(([k,i])=>{const meta=[optsFlat(i.opts),i.note?("Note: "+esc(i.note)):""].filter(Boolean).join(" · ");
    return `<div class="crow"><img src="${i.img}" alt=""><div class="cmid"><div class="cn">${esc(i.name)}</div>${meta?`<div class="cmeta">${meta}</div>`:''}
      <div class="cqty"><button data-dec="${esc(k)}">&minus;</button><span>${i.qty}</span><button data-inc="${esc(k)}">+</button></div></div>
      <div class="cp">${money(i.price*i.qty)}</div></div>`;}).join(""):'<p class="cempty">Your cart is empty. Add some western finds.</p>';
  const totals=its.length?`<div class="ctot"><span>Subtotal</span><span>${money(subtotal())}</span></div><p class="cnote">Shipping &amp; tax confirmed when we contact you. No payment taken online.</p>`:"";
  let foot="";
  if(its.length&&!checkoutOpen)foot=`<button id="toCheckout" class="btn btn-primary grow">Checkout</button>`;
  let form="";
  if(its.length&&checkoutOpen)form=`<div class="cform">
    <div class="oglabel">How would you like it?</div>
    <div class="ful"><label class="fopt"><input type="radio" name="ful" value="In-store pickup" checked> In-store pickup</label><label class="fopt"><input type="radio" name="ful" value="Ship to me"> Ship to me</label></div>
    <input id="c-name" placeholder="Full name" class="sinput">
    <input id="c-email" type="email" placeholder="Email" class="sinput">
    <input id="c-phone" type="tel" placeholder="Phone" class="sinput">
    <div id="ship-fields" style="display:none">
      <input id="c-addr" placeholder="Street address" class="sinput">
      <div class="grid2"><input id="c-city" placeholder="City" class="sinput"><input id="c-zip" placeholder="ZIP" class="sinput"></div>
    </div>
    <textarea id="c-notes" rows="2" placeholder="Anything else? (gift, questions, etc.)" class="sinput"></textarea>
    <p id="c-err" class="cerr" style="display:none"></p>
    <button id="placeOrder" class="btn btn-primary grow">Place order</button>
    <button id="backCart" class="linkbtn">&larr; Back to cart</button>
    <p class="cnote">We&rsquo;ll confirm availability and arrange payment &amp; ${'${}'.length?'':''}delivery. Pay in store or by invoice.</p>
  </div>`;
  d.innerHTML=`<div class="drawer-back" data-cclose></div>
    <div class="drawer">
      <div class="dhead"><h3>Your cart</h3><button data-cclose class="sheet-x" aria-label="Close">&times;</button></div>
      <div class="ditems">${rows}</div>${totals}${foot}${form}
    </div>`;
  d.querySelectorAll("[data-cclose]").forEach(b=>b.onclick=closeDrawer);
  d.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>{const k=b.getAttribute("data-inc");setQty(k,(cart[k]?.qty||0)+1);});
  d.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const k=b.getAttribute("data-dec");setQty(k,(cart[k]?.qty||0)-1);});
  const tc=$("#toCheckout"); if(tc)tc.onclick=()=>{checkoutOpen=true;renderCart();};
  const bc=$("#backCart"); if(bc)bc.onclick=()=>{checkoutOpen=false;renderCart();};
  const po=$("#placeOrder"); if(po)po.onclick=placeOrder;
  d.querySelectorAll('input[name="ful"]').forEach(r=>r.onchange=()=>{const sf=$("#ship-fields");sf.style.display=(document.querySelector('input[name="ful"]:checked').value==="Ship to me")?"block":"none";});
  renderFab();
}
function orderNo(){const d=new Date(),p=n=>String(n).padStart(2,"0");return "RR-"+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+"-"+Math.floor(1000+Math.random()*9000);}
async function placeOrder(){
  const ful=document.querySelector('input[name="ful"]:checked').value;
  const name=$("#c-name").value.trim(),email=$("#c-email").value.trim(),phone=$("#c-phone").value.trim(),notes=$("#c-notes").value.trim();
  const err=$("#c-err"),fail=m=>{err.textContent=m;err.style.display="block";};
  if(!name)return fail("Please add your name.");
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return fail("Please add a valid email.");
  if(phone.replace(/\D/g,"").length<7)return fail("Please add a valid phone.");
  let addr="";
  if(ful==="Ship to me"){addr=[$("#c-addr").value.trim(),$("#c-city").value.trim(),$("#c-zip").value.trim()].filter(Boolean).join(", "); if(!addr)return fail("Please add your shipping address.");}
  err.style.display="none";
  const no=orderNo();
  const lines=items().map(i=>{const ex=[optsFlat(i.opts),i.note?("note: "+i.note):""].filter(Boolean).join("; ");return "  "+i.qty+" x "+i.name+(ex?" ("+ex+")":"")+"  "+money(i.price*i.qty);}).join("\n");
  const summary="NEW ONLINE ORDER (R Ranch)\nOrder #: "+no+"\n\nCustomer: "+name+"\nEmail: "+email+"\nPhone: "+phone+"\nFulfillment: "+ful+(addr?("\nShip to: "+addr):"")+"\nNotes: "+(notes||"none")+"\n\nItems:\n"+lines+"\n\nSubtotal: "+money(subtotal())+"\n(Shipping/tax/payment arranged on confirmation.)";
  const btn=$("#placeOrder");btn.disabled=true;btn.textContent="Placing order...";
  const payload={access_key:WEB3FORMS_KEY,subject:"New R Ranch Order "+no+" — "+name,from_name:"R Ranch Online Shop",replyto:email,"Order Number":no,"Customer":name,"Email":email,"Phone":phone,"Fulfillment":ful,"Ship To":addr||"(pickup)","Notes":notes||"none","Subtotal":money(subtotal()),"Items":lines.replace(/\n/g,"; "),message:summary};
  try{if(!WEB3FORMS_KEY.startsWith("REPLACE"))await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)});}catch(e){}
  confirmOrder(no,name,ful);
  for(const k in cart)delete cart[k];save();checkoutOpen=false;renderCart();
}
function confirmOrder(no,name,ful){
  const o=$("#confirm");
  o.innerHTML=`<div class="conf-back"></div><div class="conf-card">
    <div class="conf-ic">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>'}</div>
    <h3>Order received!</h3>
    <p>Thanks ${esc(name)}. We&rsquo;ll reach out shortly to confirm availability and arrange ${ful==="Ship to me"?"payment &amp; shipping":"payment &amp; pickup"} at ${SHOP_ADDR}.</p>
    <div class="conf-no"><span>Your order number</span><b>${no}</b></div>
    <p class="cnote">Questions? Call ${SHOP_PHONE}.</p>
    <button id="closeConf" class="btn btn-primary grow">Keep shopping</button></div>`;
  o.classList.add("show"); closeDrawer();
  $("#closeConf").onclick=()=>{o.classList.remove("show");document.body.style.overflow="";};
}
function renderFab(){
  const fab=$("#cart-fab"); if(!fab)return; const c=count();
  fab.innerHTML=`${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/></svg>'}<span>Cart</span>${c?`<b>${c}</b>`:''}`;
  fab.onclick=openDrawer; fab.style.display=c?"inline-flex":"inline-flex";
}
function boot(){ load(); renderFilter(); renderGrid(); renderCart(); renderFab(); }
if(document.readyState!=="loading")boot(); else document.addEventListener("DOMContentLoaded",boot);
