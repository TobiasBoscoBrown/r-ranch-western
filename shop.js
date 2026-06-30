/* R Ranch Enterprises — live Shopify shop.
   - Catalog loads live from the Shopify store (products.json), no hardcoded products.
   - Real stock counts via the Storefront API (public token): shows "Only X left" and caps
     quantity controls + cart at available stock so nobody can over-order.
   - Fast first paint + short session cache. Deep-linkable collections (shop.html#earrings).
   - Cart hands off to Shopify's real branded checkout. */
(function(){
'use strict';

var SHOP_DATA = "c3iguu-w6.myshopify.com";        // catalog + inventory source (valid cert, cross-origin)
var SHOP_CHECKOUT = "checkout.rranchidaho.shop";   // branded Shopify checkout
var SF_TOKEN = "e62f42ef4fd19e7c927ba7052a78791e"; // PUBLIC Storefront API token (safe for client)
var SF_VERSION = "2026-04";
var LOW_STOCK = 5;                                 // show "Only X left" at or below this
var CAT_ORDER = ["Earrings","Necklaces","Hats","Jeans","Our Favs"];
var PLACEHOLDER = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20400%20300'%3E%3Crect%20width='400'%20height='300'%20fill='%23efe6d4'/%3E%3Ctext%20x='200'%20y='162'%20font-family='Georgia'%20font-size='34'%20fill='%235a3719'%20text-anchor='middle'%3ER%20Ranch%3C/text%3E%3C/svg%3E";

var PRODUCTS=[], CATS=["All"], activeCat="All", draft=null, loadError=false, rawProducts=null;
var cart={};

var $=function(s){return document.querySelector(s);};
function money(n){return "$"+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function img(src,w){ if(!src) return PLACEHOLDER; return src+(src.indexOf("?")>-1?"&":"?")+"width="+(w||600); }
function stripHtml(h){ var d=document.createElement("div"); d.innerHTML=h||""; return (d.textContent||"").replace(/\s+/g," ").trim(); }
function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

/* ---------- cart persistence ---------- */
function save(){ try{ localStorage.setItem("rr_shop_cart", JSON.stringify(cart)); }catch(e){} }
function loadCart(){ try{ Object.assign(cart, JSON.parse(localStorage.getItem("rr_shop_cart")||"{}")); }catch(e){} }
function items(){ return Object.keys(cart).map(function(k){return cart[k];}); }
function count(){ return items().reduce(function(a,b){return a+b.qty;},0); }
function subtotal(){ return items().reduce(function(a,b){return a+b.price*b.qty;},0); }
function inCart(vid){ var c=cart[String(vid)]; return c?c.qty:0; }

/* ---------- stock helpers ---------- */
function stockOf(v){ return (v && v.qty!=null) ? Math.max(0, v.qty) : Infinity; } // Infinity = untracked
function remaining(v){ return stockOf(v) - inCart(v.id); }

/* ---------- session cache ---------- */
function cacheGet(){ try{ return JSON.parse(sessionStorage.getItem("rr_catalog")||"null"); }catch(e){ return null; } }
function cacheSet(){ try{ sessionStorage.setItem("rr_catalog", JSON.stringify({P:PRODUCTS,C:CATS})); }catch(e){} }

/* ---------- deep-linkable categories ---------- */
function catFromHash(){ var h=(location.hash||"").replace(/^#/,""); if(!h) return "All"; for(var i=0;i<CATS.length;i++){ if(slug(CATS[i])===h) return CATS[i]; } return "All"; }
function setHash(cat){ if(cat==="All"){ if(location.hash) history.replaceState(null,"",location.pathname+location.search); } else { history.replaceState(null,"","#"+slug(cat)); } }

/* ---------- data load ---------- */
function getJSON(u){ return fetch(u,{headers:{Accept:"application/json"}}).then(function(r){ if(!r.ok) throw new Error(u+" "+r.status); return r.json(); }); }

function fetchQuantities(){
  var q="{ products(first:120){edges{node{variants(first:50){edges{node{id quantityAvailable}}}}}} }";
  return fetch("https://"+SHOP_DATA+"/api/"+SF_VERSION+"/graphql.json",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":SF_TOKEN},
    body:JSON.stringify({query:q})
  }).then(function(r){return r.json();}).then(function(d){
    var map={}; var edges=(((d.data||{}).products||{}).edges)||[];
    edges.forEach(function(pe){ (((pe.node||{}).variants||{}).edges||[]).forEach(function(ve){
      var gid=ve.node.id||""; var num=gid.split("/").pop(); map[num]=ve.node.quantityAvailable;
    });});
    return map;
  }).catch(function(){ return {}; });
}

function build(pj, membership){
  var list=[];
  (pj.products||[]).forEach(function(p){
    var variants=(p.variants||[]).map(function(v){ return { id:v.id, price:parseFloat(v.price)||0, available:!!v.available, opt:v.option1, qty:null }; });
    var prices=variants.map(function(v){return v.price;}).filter(function(n){return n>0;});
    var minP=prices.length?Math.min.apply(null,prices):0;
    if(minP<=0) return;
    var realOpts=(p.options||[]).filter(function(o){ return !(o.values.length===1 && o.values[0]==="Default Title"); });
    var cats=(membership[p.id]||[]).slice(); if(p.product_type && cats.indexOf(p.product_type)<0) cats.push(p.product_type);
    list.push({ id:p.id, handle:p.handle, name:p.title, desc:stripHtml(p.body_html), price:minP,
      img:(p.images&&p.images[0]&&p.images[0].src)||"", variants:variants, options:realOpts, cats:cats,
      available: variants.some(function(v){return v.available;}) });
  });
  PRODUCTS=list;
  var present={}; PRODUCTS.forEach(function(p){ p.cats.forEach(function(c){present[c]=1;}); });
  var ordered=CAT_ORDER.filter(function(c){return present[c];});
  Object.keys(present).sort().forEach(function(c){ if(ordered.indexOf(c)<0) ordered.push(c); });
  CATS=["All"].concat(ordered);
}

function applyQuantities(qmap){
  PRODUCTS.forEach(function(p){ p.variants.forEach(function(v){
    var q=qmap[String(v.id)];
    if(q!=null){ v.qty=q; if(q<=0) v.available=false; }
  }); p.available = p.variants.some(function(v){return v.available;}); });
}

function loadCatalog(){
  var pProducts=getJSON("https://"+SHOP_DATA+"/products.json?limit=250").then(function(pj){
    rawProducts=pj; build(pj,{});
    if(activeCat!=="All" && CATS.indexOf(activeCat)<0) activeCat="All";
    renderFilter(); renderGrid();
  });
  var pMembers=getJSON("https://"+SHOP_DATA+"/collections.json?limit=250").then(function(cj){
    var cols=(cj.collections||[]).filter(function(c){return c.products_count>0 && c.handle!=="frontpage";});
    var membership={};
    return Promise.all(cols.map(function(c){
      return getJSON("https://"+SHOP_DATA+"/collections/"+c.handle+"/products.json?limit=250")
        .then(function(pj){ (pj.products||[]).forEach(function(p){ (membership[p.id]=membership[p.id]||[]).push(c.title); }); })
        .catch(function(){});
    })).then(function(){ return membership; });
  }).catch(function(){ return {}; });
  var pQty=fetchQuantities();

  return Promise.all([pProducts,pMembers,pQty]).then(function(res){
    if(rawProducts){ build(rawProducts, res[1]||{}); }
    applyQuantities(res[2]||{});
    activeCat=catFromHash();
    cacheSet(); renderFilter(); renderGrid();
  });
}

/* ---------- filter chips ---------- */
function renderFilter(){
  var f=$("#dept-filter"); if(!f) return;
  f.innerHTML=CATS.map(function(c){ return '<button data-cat="'+esc(c)+'" class="chip'+(c===activeCat?" on":"")+'">'+esc(c)+'</button>'; }).join("");
  Array.prototype.forEach.call(f.querySelectorAll("[data-cat]"),function(b){ b.onclick=function(){ activeCat=b.getAttribute("data-cat"); setHash(activeCat); renderFilter(); renderGrid(); }; });
}
function visible(){ return PRODUCTS.filter(function(p){ return activeCat==="All"||p.cats.indexOf(activeCat)>-1; }); }
function prod(id){ for(var i=0;i<PRODUCTS.length;i++){ if(String(PRODUCTS[i].id)===String(id)) return PRODUCTS[i]; } return null; }

/* product-level low-stock note (single-variant products) */
function cardStock(p){
  if(p.options.length) return ""; // multi-variant: shown per-size in the sheet
  var v=p.variants[0]; if(!v||v.qty==null||!p.available) return "";
  if(v.qty<=LOW_STOCK) return '<div class="pstock">Only '+v.qty+' left</div>';
  return "";
}

/* ---------- product grid ---------- */
function renderGrid(){
  var g=$("#product-grid"); if(!g) return;
  if(!PRODUCTS.length && loadError){ g.innerHTML='<p class="cempty">We couldn’t load the shop just now. Please refresh, or call (208) 318-8888.</p>'; return; }
  if(!PRODUCTS.length){ g.innerHTML='<p class="cempty">Loading the shop…</p>'; return; }
  var list=visible();
  if(!list.length){ g.innerHTML='<p class="cempty">Nothing in this category yet.</p>'; return; }
  g.innerHTML=list.map(function(p){
    var sold=!p.available;
    var btn=sold?'<button class="btn btn-primary psm" disabled>Sold out</button>'
                :'<button class="btn btn-primary psm" data-open="'+p.id+'">'+(p.options.length?"Choose":"Add")+'</button>';
    return '<div class="pcard">'
      +'<button class="pimg" data-open="'+p.id+'" aria-label="View '+esc(p.name)+'"><img src="'+esc(img(p.img,500))+'" alt="'+esc(p.name)+'" loading="lazy">'+(sold?'<span class="badge">Sold out</span>':'')+'</button>'
      +'<div class="pbody">'
      +'<div class="pdept">'+esc(p.cats.length?p.cats[0]:"R Ranch")+'</div>'
      +'<h3 class="pname">'+esc(p.name)+'</h3>'
      +(p.desc?'<p class="pdesc">'+esc(p.desc.slice(0,120))+(p.desc.length>120?"…":"")+'</p>':'<p class="pdesc"></p>')
      +cardStock(p)
      +'<div class="prow"><span class="pprice">'+money(p.price)+'</span>'+btn+'</div>'
      +'</div></div>';
  }).join("");
  Array.prototype.forEach.call(g.querySelectorAll("[data-open]"),function(b){ b.onclick=function(){ openSheet(b.getAttribute("data-open")); }; });
  renderFab();
}

/* ---------- product sheet ---------- */
function openSheet(id){
  var p=prod(id); if(!p) return;
  draft={ p:p, opt:(p.options.length? "" : (p.variants[0]&&p.variants[0].opt) ), qty:1 };
  renderSheet(); $("#sheet").classList.add("show"); document.body.style.overflow="hidden";
}
function closeSheet(){ $("#sheet").classList.remove("show"); document.body.style.overflow=""; draft=null; }
function chosenVariant(){
  var p=draft.p;
  if(!p.options.length) return p.variants[0];
  for(var i=0;i<p.variants.length;i++){ if(p.variants[i].opt===draft.opt) return p.variants[i]; }
  return null;
}
function ready(){ var v=chosenVariant(); return !!(v&&v.available&&remaining(v)>0); }
function renderSheet(){
  var s=$("#sheet"); var p=draft.p; var v=chosenVariant();
  var price = v? v.price : p.price;
  var rem = v? remaining(v) : 0;
  if(v && draft.qty>rem) draft.qty=Math.max(1,rem);
  var opts="";
  if(p.options.length){
    var o=p.options[0];
    opts='<div class="og"><div class="oglabel">'+esc(o.name)+' <span class="req">*</span></div><div class="ogchoices">'
      + o.values.map(function(val){
          var ov=null; for(var i=0;i<p.variants.length;i++){ if(p.variants[i].opt===val){ ov=p.variants[i]; break; } }
          var avail=ov&&ov.available&&stockOf(ov)>0; var on=draft.opt===val?" on":"";
          return '<button data-v="'+esc(val)+'" class="ochip'+on+'"'+(avail?"":" disabled")+'>'+esc(val)+(avail?"":" · sold out")+'</button>';
        }).join("")
      +'</div></div>';
  }
  var soldAll=!p.available;
  var stockNote="";
  if(v && v.available && v.qty!=null && v.qty>0 && v.qty<=LOW_STOCK) stockNote='<div class="sstock">Only '+v.qty+' left</div>';
  var atCap = v && rem>0 && draft.qty>=rem;
  s.innerHTML='<div class="sheet-back" data-close></div>'
    +'<div class="sheet-scroll">'
    +'<button class="sheet-x" data-close aria-label="Close">&times;</button>'
    +'<img class="sheet-img" src="'+esc(img(p.img,800))+'" alt="'+esc(p.name)+'">'
    +(p.cats.length?'<div class="sheet-dept">'+esc(p.cats.join(" · "))+'</div>':'')
    +'<h3 class="sheet-name">'+esc(p.name)+'</h3>'
    +'<div class="sheet-price">'+money(price)+'</div>'
    +(p.desc?'<p class="sheet-desc">'+esc(p.desc)+'</p>':'')
    +opts
    +stockNote
    +'<div class="sheet-add">'
    +'<div class="qty"><button id="qd">&minus;</button><span id="qv">'+draft.qty+'</span><button id="qi"'+(atCap||!ready()?" disabled":"")+'>+</button></div>'
    +'<button id="sadd" class="btn btn-primary grow"'+(ready()?"":" disabled")+'>'+(soldAll?"Sold out":(p.options.length&&!draft.opt?"Select an option":(rem<=0?"Max in cart":"Add "+draft.qty+" to cart")))+'</button>'
    +'</div>'
    +'<p class="cnote">Secure checkout by Shopify. Pickup at the Caldwell shop or shipping at checkout.</p>'
    +'</div>';
  Array.prototype.forEach.call(s.querySelectorAll("[data-close]"),function(b){ b.onclick=closeSheet; });
  Array.prototype.forEach.call(s.querySelectorAll("[data-v]"),function(b){ if(b.disabled) return; b.onclick=function(){ var val=b.getAttribute("data-v"); draft.opt=(draft.opt===val?"":val); draft.qty=1; renderSheet(); }; });
  $("#qd").onclick=function(){ draft.qty=Math.max(1,draft.qty-1); renderSheet(); };
  var qi=$("#qi"); if(qi&&!qi.disabled) qi.onclick=function(){ var vv=chosenVariant(); if(vv && draft.qty<remaining(vv)) draft.qty++; renderSheet(); };
  var add=$("#sadd"); add.onclick=function(){ if(ready()) addDraft(); };
}
function addDraft(){
  var p=draft.p, v=chosenVariant(); if(!v) return;
  var key=String(v.id);
  var cur=cart[key]?cart[key].qty:0;
  var capped=Math.min(cur+draft.qty, stockOf(v));
  if(!cart[key]) cart[key]={ variantId:v.id, productId:p.id, name:p.name, opt:(p.options.length?(p.options[0].name+": "+v.opt):""), price:v.price, img:p.img, qty:0, max:(v.qty==null?null:v.qty) };
  cart[key].max=(v.qty==null?null:v.qty);
  cart[key].qty=Math.max(1,capped); save(); closeSheet(); renderCart(); openDrawer();
}

/* ---------- cart drawer ---------- */
function openDrawer(){ $("#cart-drawer").classList.add("show"); document.body.style.overflow="hidden"; }
function closeDrawer(){ $("#cart-drawer").classList.remove("show"); document.body.style.overflow=""; }
function setQty(k,q){ if(!cart[k]) return; var mx=cart[k].max; if(mx!=null && q>mx) q=mx; cart[k].qty=q; if(q<=0) delete cart[k]; save(); renderCart(); }
function renderCart(){
  var d=$("#cart-drawer"); if(!d) return;
  var its=Object.keys(cart);
  var rows=its.length? its.map(function(k){
      var i=cart[k]; var atMax = (i.max!=null && i.qty>=i.max);
      return '<div class="crow"><img src="'+esc(img(i.img,160))+'" alt=""><div class="cmid"><div class="cn">'+esc(i.name)+'</div>'
        +(i.opt?'<div class="cmeta">'+esc(i.opt)+'</div>':'')
        +(atMax?'<div class="cmeta cmax">Max available</div>':'')
        +'<div class="cqty"><button data-dec="'+esc(k)+'">&minus;</button><span>'+i.qty+'</span><button data-inc="'+esc(k)+'"'+(atMax?" disabled":"")+'>+</button></div></div>'
        +'<div class="cp">'+money(i.price*i.qty)+'</div></div>';
    }).join("") : '<p class="cempty">Your cart is empty. Add some western finds.</p>';
  var totals=its.length? '<div class="ctot"><span>Subtotal</span><span>'+money(subtotal())+'</span></div><p class="cnote">Shipping &amp; tax calculated at secure checkout.</p>' : "";
  var foot=its.length? '<button id="toCheckout" class="btn btn-primary" style="width:100%;justify-content:center;flex:0 0 auto">Checkout</button>' : "";
  d.innerHTML='<div class="drawer-back" data-cclose></div>'
    +'<div class="drawer"><div class="dhead"><h3>Your cart</h3><button data-cclose class="sheet-x" aria-label="Close">&times;</button></div>'
    +'<div class="ditems">'+rows+'</div>'+totals+foot+'</div>';
  Array.prototype.forEach.call(d.querySelectorAll("[data-cclose]"),function(b){ b.onclick=closeDrawer; });
  Array.prototype.forEach.call(d.querySelectorAll("[data-inc]"),function(b){ if(b.disabled) return; b.onclick=function(){ var k=b.getAttribute("data-inc"); setQty(k,(cart[k]?cart[k].qty:0)+1); }; });
  Array.prototype.forEach.call(d.querySelectorAll("[data-dec]"),function(b){ b.onclick=function(){ var k=b.getAttribute("data-dec"); setQty(k,(cart[k]?cart[k].qty:0)-1); }; });
  var tc=$("#toCheckout"); if(tc) tc.onclick=goCheckout;
  renderFab();
}
function goCheckout(){
  var parts=items().map(function(i){ return i.variantId+":"+i.qty; });
  if(!parts.length) return;
  var btn=$("#toCheckout"); if(btn){ btn.disabled=true; btn.textContent="Taking you to secure checkout…"; }
  window.location.href="https://"+SHOP_CHECKOUT+"/cart/"+parts.join(",");
}

/* ---------- floating cart button ---------- */
function renderFab(){
  var fab=$("#cart-fab"); if(!fab) return; var c=count();
  fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/></svg><span>Cart</span>'+(c?'<b>'+c+'</b>':'');
  fab.onclick=openDrawer; fab.style.display="inline-flex";
}

/* ---------- boot ---------- */
function boot(){
  loadCart();
  var cached=cacheGet();
  if(cached && cached.P && cached.P.length){ PRODUCTS=cached.P; CATS=cached.C||["All"]; }
  activeCat=catFromHash();
  renderFilter(); renderGrid(); renderCart(); renderFab();
  loadCatalog().then(function(){ loadError=false; }).catch(function(){ if(!PRODUCTS.length){ loadError=true; renderGrid(); } });
  window.addEventListener("hashchange", function(){ activeCat=catFromHash(); renderFilter(); renderGrid(); });
}
if(document.readyState!=="loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
})();
