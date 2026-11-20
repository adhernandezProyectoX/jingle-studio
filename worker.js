// Jingle Studio · proxy para WaveSpeed (Cloudflare Worker gratuito)
// Reenvía los pedidos de la app a WaveSpeed y agrega los permisos (CORS)
// que el navegador necesita. Solo deja pasar pedidos a WaveSpeed.
const ALLOWED = ["api.wavespeed.ai", "llm.wavespeed.ai"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization,content-type",
  "Access-Control-Max-Age": "86400",
};
export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const target = url.searchParams.get("u");
    let t;
    try { t = new URL(target); } catch { return new Response("Falta ?u=", { status: 400, headers: CORS }); }
    if (t.protocol !== "https:" || !ALLOWED.includes(t.hostname))
      return new Response("Destino no permitido", { status: 403, headers: CORS });
    const headers = new Headers();
    const auth = req.headers.get("authorization"); if (auth) headers.set("authorization", auth);
    const ct = req.headers.get("content-type"); if (ct) headers.set("content-type", ct);
    const r = await fetch(t.toString(), { method: req.method, headers, body: req.method === "POST" ? await req.text() : undefined });
    const out = new Response(r.body, r);
    for (const [k, v] of Object.entries(CORS)) out.headers.set(k, v);
    return out;
  },
};
