/* Dynamic sitemap: static pages plus every in-stock product URL, so Google can
   actually find the catalogue. Falls back to the static page list if the store
   is unreachable - the sitemap never 500s. */

const SHOP = "c3iguu-w6.myshopify.com";
const SITE = "https://rranchidaho.com";

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

export default async function handler(req, res) {
  let products = [];

  try {
    const r = await fetch("https://" + SHOP + "/products.json?limit=250", {
      headers: { Accept: "application/json" }
    });
    if (r.ok) {
      const j = await r.json();
      products = (j.products || []).filter(function (p) {
        return (p.variants || []).some(function (v) { return v.available; });
      });
    }
  } catch (e) {
    products = [];
  }

  const rows = PAGES.map(function (pair) {
    return "<url><loc>" + SITE + pair[0] + "</loc><priority>" + pair[1] + "</priority></url>";
  });

  products.forEach(function (p) {
    if (!p.handle) return;
    const lastmod = p.updated_at ? String(p.updated_at).slice(0, 10) : "";
    rows.push(
      "<url><loc>" + SITE + "/products/" + esc(p.handle) + "</loc>" +
      (lastmod ? "<lastmod>" + lastmod + "</lastmod>" : "") +
      "<priority>0.7</priority></url>"
    );
  });

  const xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
    rows.join("\n") + "\n</urlset>";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
