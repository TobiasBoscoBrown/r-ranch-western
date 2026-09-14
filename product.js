/* Product page behaviour for /products/<handle>.
   The page itself is server-rendered (api/product.js); this only wires up the
   gallery, the variant picker and Add to cart. Cart state, the drawer and the
   checkout hand-off are reused from shop.js via window.RRShop. */
(function () {
  'use strict';

  var P = window.RR_PRODUCT;
  if (!P) return;

  var LOW_STOCK = 5;
  var qty = 1;
  var chosen = P.hasOptions ? null : (P.variants[0] || null);

  function $(id) { return document.getElementById(id); }
  function money(n) {
    return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------- gallery ---------- */
  var thumbs = document.querySelectorAll('[data-full]');
  Array.prototype.forEach.call(thumbs, function (b) {
    b.addEventListener('click', function () {
      var main = $('pdpMain');
      if (main) main.src = b.getAttribute('data-full');
      Array.prototype.forEach.call(document.querySelectorAll('.pdp-thumb.on'), function (e) {
        e.classList.remove('on');
      });
      b.classList.add('on');
    });
  });

  /* ---------- live stock, so the page matches the shop grid ---------- */
  function applyStock(map) {
    P.variants.forEach(function (v) {
      var q = map[String(v.id)];
      if (q != null) {
        v.qty = q;
        if (q <= 0) v.available = false;
      }
    });
    render();
  }

  if (window.RRShop && typeof window.RRShop.quantities === 'function') {
    window.RRShop.quantities().then(applyStock).catch(function () {});
  }

  function stockOf(v) { return (v && v.qty != null) ? Math.max(0, v.qty) : Infinity; }
  function inCart(v) {
    return (window.RRShop && typeof window.RRShop.inCart === 'function')
      ? window.RRShop.inCart(v.id) : 0;
  }
  function remaining(v) { return stockOf(v) - inCart(v); }

  /* ---------- variant picker ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-opt]'), function (b) {
    if (b.disabled) return;
    b.addEventListener('click', function () {
      var val = b.getAttribute('data-opt');
      if (chosen && chosen.option === val) {
        chosen = null;
      } else {
        chosen = null;
        for (var i = 0; i < P.variants.length; i++) {
          if (P.variants[i].option === val) { chosen = P.variants[i]; break; }
        }
      }
      qty = 1;
      Array.prototype.forEach.call(document.querySelectorAll('.ochip.on'), function (e) {
        e.classList.remove('on');
      });
      if (chosen) b.classList.add('on');
      render();
    });
  });

  /* ---------- quantity ---------- */
  var dec = $('pdpDec'), inc = $('pdpInc'), add = $('pdpAdd');
  if (dec) dec.addEventListener('click', function () { qty = Math.max(1, qty - 1); render(); });
  if (inc) inc.addEventListener('click', function () {
    if (chosen && qty < remaining(chosen)) { qty++; render(); }
  });

  if (add) add.addEventListener('click', function () {
    if (!chosen || !chosen.available) return;
    var rem = remaining(chosen);
    if (rem <= 0) return;
    if (!window.RRShop || typeof window.RRShop.add !== 'function') return;
    window.RRShop.add({
      variantId: chosen.id,
      productId: P.productId,
      name: P.title,
      opt: P.hasOptions ? (P.optionName + ": " + chosen.option) : "",
      price: chosen.price,
      img: P.image,
      qty: Math.min(qty, rem),
      max: (chosen.qty == null ? null : chosen.qty)
    });
  });

  /* ---------- render ---------- */
  function render() {
    var price = $('pdpPrice');
    if (price && chosen) price.textContent = money(chosen.price);

    var qv = $('pdpQty');
    var rem = chosen ? remaining(chosen) : 0;
    if (chosen && qty > rem) qty = Math.max(1, rem);
    if (qv) qv.textContent = qty;

    if (inc) inc.disabled = !chosen || qty >= rem;
    if (dec) dec.disabled = qty <= 1;

    var note = $('pdpStock');
    if (note) {
      if (chosen && chosen.available && chosen.qty != null && chosen.qty > 0 && chosen.qty <= LOW_STOCK) {
        note.textContent = "Only " + chosen.qty + " left";
        note.style.display = "";
      } else {
        note.textContent = "";
        note.style.display = "none";
      }
    }

    if (add) {
      if (!chosen) {
        add.disabled = true;
        add.textContent = "Select an option";
      } else if (!chosen.available) {
        add.disabled = true;
        add.textContent = "Sold out";
      } else if (rem <= 0) {
        add.disabled = true;
        add.textContent = "Max in cart";
      } else {
        add.disabled = false;
        add.textContent = qty > 1 ? ("Add " + qty + " to cart") : "Add to cart";
      }
    }
  }

  if (document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
