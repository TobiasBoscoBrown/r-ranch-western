/* Server-rendered product page for /products/<handle>.
   Real URL, real <title>, real OG tags and JSON-LD, so a link dropped in a TikTok
   bio, a DM or a Google result shows the actual product instead of a bare domain.
   Data comes from the store's public product JSON - no token needed. */

const SHOP = "c3iguu-w6.myshopify.com";
const SITE = "https://rranchidaho.com";
const BRAND = "R Ranch Enterprises";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function stripHtml(h) {
  return String(h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function sized(src, w) {
  if (!src) return "";
  return src + (src.indexOf("?") > -1 ? "&" : "?") + "width=" + w;
}
function absolutize(src) {
  if (!src) return "";
  return src.indexOf("//") === 0 ? "https:" + src : src;
}

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='%235a3719'/><text x='32' y='42' font-family='Georgia' font-size='30' fill='%23f7f0e1' text-anchor='middle'>R</text></svg>";

function shell(o) {
  return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n" +
"<meta charset=\"utf-8\"/>\n" +
"<meta content=\"width=device-width, initial-scale=1\" name=\"viewport\"/>\n" +
"<title>" + esc(o.title) + "</title>\n" +
"<meta name=\"description\" content=\"" + esc(o.description) + "\"/>\n" +
"<link rel=\"canonical\" href=\"" + esc(o.canonical) + "\"/>\n" +
"<link href=\"https://fonts.googleapis.com\" rel=\"preconnect\"/>\n" +
"<link crossorigin=\"\" href=\"https://fonts.gstatic.com\" rel=\"preconnect\"/>\n" +
"<link href=\"https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&amp;family=Inter:wght@400;500;600;700&amp;display=swap\" rel=\"stylesheet\"/>\n" +
"<script src=\"https://cdn.tailwindcss.com\"></script>\n" +
"<script>tailwind.config={corePlugins:{preflight:false}}</script>\n" +
"<link href=\"/styles.css\" rel=\"stylesheet\"/>\n" +
"<link href=\"" + FAVICON + "\" rel=\"icon\"/>\n" +
o.head + "\n" +
"<style>\n" +
".pdp{padding:34px 0 64px;background:var(--cream)}\n" +
".pdp-grid{display:grid;grid-template-columns:1fr;gap:28px}\n" +
"@media(min-width:900px){.pdp-grid{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:44px;align-items:start}}\n" +
".pdp-main{width:100%;aspect-ratio:1/1;object-fit:contain;background:var(--sand);border:1px solid var(--line);border-radius:16px;display:block}\n" +
".pdp-thumbs{display:flex;gap:9px;flex-wrap:wrap;margin-top:10px}\n" +
".pdp-thumb{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--sand);width:66px;height:66px;padding:0;cursor:pointer;flex:0 0 auto}\n" +
".pdp-thumb.on{border-color:var(--accent);box-shadow:0 0 0 2px rgba(14,138,127,.3)}\n" +
".pdp-thumb img{width:100%;height:100%;object-fit:cover;display:block}\n" +
".pdp-crumb{font:500 13px Inter;color:var(--muted);margin-bottom:12px}\n" +
".pdp-crumb a{color:var(--accent-deep);text-decoration:none}\n" +
".pdp-crumb a:hover{text-decoration:underline}\n" +
".pdp-dept{font:700 10.5px Inter;text-transform:uppercase;letter-spacing:.14em;color:var(--accent-deep)}\n" +
".pdp-name{font-family:'Fraunces';font-weight:600;font-size:clamp(26px,4vw,36px);color:var(--ink);margin:6px 0 4px;line-height:1.1}\n" +
".pdp-price{font-family:'Fraunces';font-weight:600;font-size:25px;color:var(--accent-deep);margin-bottom:14px}\n" +
".pdp-desc{font-size:15px;color:var(--muted);line-height:1.62;margin:0 0 18px}\n" +
".pdp-stock{font:600 13.5px Inter;color:#b4452e;margin-bottom:12px}\n" +
".pdp-sold{font:600 13.5px Inter;color:var(--muted);margin-bottom:14px}\n" +
".pdp-add{display:flex;gap:10px;align-items:center;margin-top:6px}\n" +
".pdp-note{font-size:12.5px;color:var(--muted);margin-top:12px;line-height:1.5}\n" +
".pdp-meta{margin-top:22px;border-top:1px solid var(--line);padding-top:16px;font-size:13.5px;color:var(--muted);line-height:1.7}\n" +
".pdp-meta a{color:var(--accent-deep)}\n" +
".pdp-back{display:inline-block;margin-top:26px;font:600 14px Inter;color:var(--accent-deep);text-decoration:none}\n" +
".pdp-back:hover{text-decoration:underline}\n" +
"</style>\n</head>\n<body>\n" +
"<div id=\"site-header\"></div>\n" +
"<main>" + o.body + "</main>\n" +
"<footer class=\"site\" id=\"site-footer\"></footer>\n" +
o.tail +
"<script defer src=\"/app.js\"></script>\n" +
"<script defer src=\"/shop.js\"></script>\n" +
"<script defer src=\"/product.js\"></script>\n" +
"</body>\n</html>";
}

function notFound() {
  return shell({
    title: "Product not found | " + BRAND,
    description: "That product is no longer listed. Browse the R Ranch shop for saddles, tack, hats and turquoise jewelry.",
    canonical: SITE + "/shop",
    head: "<meta name=\"robots\" content=\"noindex,follow\"/>",
    tail: "",
    body: "<section class=\"pdp\"><div class=\"wrap\" style=\"display:block;text-align:center;padding:60px 0\">" +
      "<h1 class=\"pdp-name\">We cannot find that one.</h1>" +
      "<p class=\"pdp-desc\" style=\"max-width:520px;margin:0 auto 20px\">It may have sold - a lot of what we carry is one of a kind. Have a look at what is in stock now, or call the shop and we will track something down.</p>" +
      "<a class=\"btn btn-primary\" href=\"/shop\">Browse the shop</a>" +
      "<a class=\"pdp-back\" href=\"tel:+12083188888\">Or call (208) 318-8888</a>" +
      "</div></section>"
  });
}

export default async function handler(req, res) {
  const handle = String((req.query && req.query.handle) || "").trim().toLowerCase();

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!/^[a-z0-9][a-z0-9-]{0,180}$/.test(handle)) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.status(404).send(notFound());
  }

  let p = null;
  try {
    const r = await fetch("https://" + SHOP + "/products/" + encodeURIComponent(handle) + ".js", {
      headers: { Accept: "application/json" }
    });
    if (r.ok) p = await r.json();
  } catch (e) {
    p = null;
  }

  if (!p || !p.id) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.status(404).send(notFound());
  }

  const variants = (p.variants || []).map(function (v) {
    return {
      id: v.id,
      option: v.option1,
      price: (v.price || 0) / 100,
      available: !!v.available
    };
  });
  const prices = variants.map(function (v) { return v.price; }).filter(function (n) { return n > 0; });
  const minPrice = prices.length ? Math.min.apply(null, prices) : 0;
  // A few items have no price set in Shopify. shop.js hides them from the grid;
  // here we still serve the page (the URL may be shared) but ask people to call
  // rather than showing a $0.00 buy button, and keep it out of the index.
  const priced = minPrice > 0;
  const inStock = priced && variants.some(function (v) { return v.available; });
  const realOptions = (p.options || []).filter(function (o) {
    const vals = o && o.values ? o.values : [];
    return !(vals.length === 1 && vals[0] === "Default Title");
  });
  const hasOptions = realOptions.length > 0;
  const optionName = hasOptions ? (realOptions[0].name || "Option") : "";
  const optionValues = hasOptions ? (realOptions[0].values || []) : [];

  const images = (p.images || []).map(absolutize).filter(Boolean);
  const hero = images[0] || "";
  // the /products/<handle>.js endpoint calls these `description` and `type`
  const plain = stripHtml(p.description || p.body_html);
  const productType = p.type || p.product_type || "";
  const blurb = plain
    ? plain.slice(0, 300)
    : p.title + " from " + BRAND + ", a family-run tack shop and western boutique in Caldwell, Idaho.";
  const canonical = SITE + "/products/" + handle;
  const pageTitle = priced
    ? p.title + " - " + money(minPrice) + " | " + BRAND
    : p.title + " | " + BRAND;

  let jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: blurb,
    image: images.slice(0, 6),
    sku: String(p.id),
    brand: { "@type": "Brand", name: p.vendor || BRAND }
  };
  if (priced) {
    jsonLd.offers = {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "USD",
      price: minPrice.toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: BRAND }
    };
  }

  const head = [
    "<meta name=\"robots\" content=\"" + (inStock ? "index,follow" : "noindex,follow") + "\"/>",
    "<meta property=\"og:type\" content=\"product\"/>",
    "<meta property=\"og:site_name\" content=\"" + esc(BRAND) + "\"/>",
    "<meta property=\"og:title\" content=\"" + esc(p.title) + "\"/>",
    "<meta property=\"og:description\" content=\"" + esc(blurb) + "\"/>",
    "<meta property=\"og:url\" content=\"" + esc(canonical) + "\"/>",
    hero ? "<meta property=\"og:image\" content=\"" + esc(sized(hero, 1200)) + "\"/>" : "",
    hero ? "<meta property=\"og:image:alt\" content=\"" + esc(p.title) + "\"/>" : "",
    "<meta property=\"product:price:amount\" content=\"" + minPrice.toFixed(2) + "\"/>",
    "<meta property=\"product:price:currency\" content=\"USD\"/>",
    "<meta name=\"twitter:card\" content=\"summary_large_image\"/>",
    "<meta name=\"twitter:title\" content=\"" + esc(p.title) + "\"/>",
    "<meta name=\"twitter:description\" content=\"" + esc(blurb) + "\"/>",
    hero ? "<meta name=\"twitter:image\" content=\"" + esc(sized(hero, 1200)) + "\"/>" : "",
    "<script type=\"application/ld+json\">" + JSON.stringify(jsonLd).replace(/</g, "\\u003c") + "</script>"
  ].filter(Boolean).join("\n");

  const thumbs = images.length > 1
    ? "<div class=\"pdp-thumbs\">" + images.map(function (src, i) {
        return "<button type=\"button\" class=\"pdp-thumb" + (i === 0 ? " on" : "") + "\" data-full=\"" +
          esc(sized(src, 1100)) + "\" aria-label=\"View photo " + (i + 1) + "\"><img src=\"" +
          esc(sized(src, 180)) + "\" alt=\"" + esc(p.title) + " photo " + (i + 1) + "\" loading=\"lazy\"/></button>";
      }).join("") + "</div>"
    : "";

  const gallery = "<div><img class=\"pdp-main\" id=\"pdpMain\" src=\"" + esc(sized(hero, 1100)) +
    "\" alt=\"" + esc(p.title) + "\"/>" + thumbs + "</div>";

  const optionsHtml = hasOptions
    ? "<div class=\"og\" id=\"pdpOptions\"><div class=\"oglabel\">" + esc(optionName) +
      " <span class=\"req\">*</span></div><div class=\"ogchoices\">" +
      optionValues.map(function (val) {
        let match = null;
        for (let i = 0; i < variants.length; i++) {
          if (variants[i].option === val) { match = variants[i]; break; }
        }
        const ok = !!(match && match.available);
        return "<button type=\"button\" data-opt=\"" + esc(val) + "\" class=\"ochip\"" +
          (ok ? "" : " disabled") + ">" + esc(val) + (ok ? "" : " &middot; sold out") + "</button>";
      }).join("") + "</div></div>"
    : "";

  const callHtml =
    "<p class=\"pdp-sold\">Price on request - this one is not listed online yet. " +
    "Call the shop on (208) 318-8888 and we will sort you out.</p>" +
    "<a class=\"btn btn-primary\" href=\"tel:+12083188888\">Call (208) 318-8888</a>";

  const buyHtml = !priced ? callHtml : inStock
    ? optionsHtml +
      "<div class=\"pdp-add\">" +
      "<div class=\"qty\"><button type=\"button\" id=\"pdpDec\">&minus;</button><span id=\"pdpQty\">1</span><button type=\"button\" id=\"pdpInc\">+</button></div>" +
      "<button type=\"button\" id=\"pdpAdd\" class=\"btn btn-primary grow\"" + (hasOptions ? " disabled" : "") + ">" +
      (hasOptions ? "Select an option" : "Add to cart") + "</button>" +
      "</div>" +
      "<p class=\"pdp-stock\" id=\"pdpStock\"></p>" +
      "<p class=\"pdp-note\">Secure checkout by Shopify. Ships nationwide, or pick up free at the Caldwell shop.</p>"
    : "<p class=\"pdp-sold\">Sold out. A lot of what we carry is one of a kind - call the shop on (208) 318-8888 and we will tell you what else just came in.</p>" +
      "<a class=\"btn btn-primary\" href=\"/shop\">Browse what is in stock</a>";

  const body = "<section class=\"pdp\"><div class=\"wrap\" style=\"display:block\">" +
    "<div class=\"pdp-crumb\"><a href=\"/\">Home</a> / <a href=\"/shop\">Shop</a> / " + esc(p.title) + "</div>" +
    "<div class=\"pdp-grid\">" + gallery + "<div>" +
    (productType ? "<div class=\"pdp-dept\">" + esc(productType) + "</div>" : "") +
    "<h1 class=\"pdp-name\">" + esc(p.title) + "</h1>" +
    (priced ? "<div class=\"pdp-price\" id=\"pdpPrice\">" + money(minPrice) + "</div>" : "") +
    (plain ? "<p class=\"pdp-desc\">" + esc(plain) + "</p>" : "") +
    buyHtml +
    "<div class=\"pdp-meta\">Questions on fit or sizing? Call <a href=\"tel:+12083188888\">(208) 318-8888</a> " +
    "or come by 2910 Cleveland Blvd, Caldwell, ID. Mon&ndash;Thu 11&ndash;5, Fri 10&ndash;5, Sat 10&ndash;4.</div>" +
    "<a class=\"pdp-back\" href=\"/shop\">&larr; Back to the shop</a>" +
    "</div></div></div></section>";

  const payload = {
    handle: handle,
    productId: p.id,
    title: p.title,
    image: hero,
    hasOptions: hasOptions,
    optionName: optionName,
    variants: variants
  };
  const tail = "<script>window.RR_PRODUCT=" +
    JSON.stringify(payload).replace(/</g, "\\u003c") + ";</script>\n";

  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  return res.status(200).send(shell({
    title: pageTitle,
    description: blurb,
    canonical: canonical,
    head: head,
    tail: tail,
    body: body
  }));
}
