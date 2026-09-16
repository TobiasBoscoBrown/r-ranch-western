/* Sitemaps for rranchidaho.com.

   Served as an index plus two children so that a slow or unreachable Shopify
   never takes the whole sitemap down with it:

     /sitemap.xml           index, pure static, always instant
     /sitemap-pages.xml     the hand-written pages, no external calls
     /sitemap-products.xml  live products, with a hard timeout and a safe fallback

   Google reported "Couldn't fetch" on the original single dynamic sitemap. The
   endpoint tested healthy every time, so the split is partly for robustness and
   partly to give Google fresh URLs to fetch rather than retrying a cached failure. */

const SHOP = "c3iguu-w6.myshopify.com";
const SITE = "https://rranchidaho.com";
const FETCH_TIMEOUT_MS = 3000;

const PAGES = [
  ["/", "1.0"],
  ["/shop", "0.9"],
  ["/services", "0.8"],
  ["/saddles", "0.8"],
  ["/tack", "0.8"],
  ["/jewelry", "0.8"],
  ["/hats", "0.8"],
  ["/apparel", "0.8"],
  ["/used-gear", "0.8"],
  ["/blog", "0.7"],
  ["/blog-turquoise-jewelry", "0.7"],
  ["/blog-saddle-fit", "0.7"],
  ["/blog-cowboy-hats", "0.7"],
  ["/about", "0.6"],
  ["/shipping-policy", "0.4"],
  ["/refund-policy", "0.4"],
  ["/privacy-policy", "0.4"],
  ["/terms-of-service", "0.4"]
];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function wrap(inner, tag) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    "<" + tag + ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    inner + "\n</" + tag + ">";
}

/* Products, but never let a slow store hang the response. */
async function liveProducts() {
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
  try {
    const r = await fetch("https://" + SHOP + "/products.json?limit=250", {
      headers: { Accept: "application/json" },
      signal: ctrl.signal
    });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.products || []).filter(function (p) {
      return p.handle && (p.variants || []).some(function (v) { return v.available; });
    });
  } catch (e) {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const kind = (req.query && req.query.kind) || "index";
  const today = new Date().toISOString().slice(0, 10);

  let xml;

  if (kind === "pages") {
    xml = wrap(PAGES.map(function (p) {
      return "<url><loc>" + SITE + p[0] + "</loc><priority>" + p[1] + "</priority></url>";
    }).join("\n"), "urlset");

  } else if (kind === "products") {
    const products = await liveProducts();
    xml = wrap(products.map(function (p) {
      const lastmod = p.updated_at ? String(p.updated_at).slice(0, 10) : "";
      return "<url><loc>" + SITE + "/products/" + esc(p.handle) + "</loc>" +
        (lastmod ? "<lastmod>" + lastmod + "</lastmod>" : "") +
        "<priority>0.7</priority></url>";
    }).join("\n"), "urlset");

  } else {
    xml = wrap(
      ["/sitemap-pages.xml", "/sitemap-products.xml"].map(function (path) {
        return "<sitemap><loc>" + SITE + path + "</loc><lastmod>" + today + "</lastmod></sitemap>";
      }).join("\n"),
      "sitemapindex"
    );
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
