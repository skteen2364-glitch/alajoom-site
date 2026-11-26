import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// 알아줌 전화 비서 ② 바쁠 때 대신 받기 — 손님 말에 가게 AI 비서가 답하고, 예약 메모를 받아 적음.
// 지금은 앱 안 '연습해 보기'용 (실제 전화 연결은 준비 중). IP당 하루 200번, 전체 5000번 (tool_trials 'callai')
const PER_IP = 200, CAP = 5000;
const MODEL = Deno.env.get("AI_MODEL") ?? "claude-haiku-5-5";
const ALLOWED = ["https://alajoom.com", "https://www.alajoom.com", "https://alajoom-site.pages.dev", "http://localhost:8765"];
function cors(origin: string | null) {
  const o = origin && (ALLOWED.includes(origin) || origin.endsWith(".alajoom-site.pages.dev")) ? origin : ALLOWED[0];
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
}
const MATES: Record<string, string> = { skin: "피부관리샵", nail: "네일샵", hair: "미용실", pilates: "필라테스", academy: "학원", food: "음식점", cafe: "카페", bakery: "빵집" };
const clip = (v: unknown, n = 300) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f]/g, " ").slice(0, n).trim();
function looseJSON(t: string): Record<string, unknown> | null {
  const s = t.replace(/```(json)?/g, ""); const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b < a) return null; try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const mate = MATES[String(body.mate ?? "")] ? String(body.mate) : "skin";
  const s = (body.shop && typeof body.shop === "object") ? body.shop as Record<string, unknown> : {};
  const shop = { name: clip(s.name, 40) || `우리 ${MATES[mate]}`, area: clip(s.area, 40), hours: clip(s.hours, 120), rules: clip(s.rules, 500), menu: Array.isArray(s.menu) ? (s.menu as unknown[]).map((x) => clip(x, 30)).filter(Boolean).slice(0, 20) : [] };
  const hist = Array.isArray(body.history) ? (body.history as Record<string, unknown>[]).slice(-16).map((m) => ({ who: m.who === "ai" ? "ai" : "guest", t: clip(m.t, 300) })).filter((m) => m.t) : [];
  if (!hist.length || hist[hist.length - 1].who !== "guest") return json({ error: "bad_request" }, 400);
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "ai_not_ready" }, 503);

  const url = Deno.env.get("SUPABASE_URL")!, svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, svcKey, { auth: { persistSession: false } });
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("callai:" + ip + ":" + svcKey.slice(-12))))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const { data: ok } = await admin.rpc("svc_consume_tool", { p_hash: hash, p_tool: "callai", p_per: PER_IP, p_cap: CAP });
  if (ok === false) return json({ error: "limit" }, 429);

  const now = new Date(Date.now() + 9 * 3600e3);
  const today = now.toISOString().slice(0, 10), dow = "일월화수목금토"[now.getUTCDay()];
  const system = `너는 한국 ${MATES[mate]} '${shop.name}'${shop.area ? `(${shop.area})` : ""}의 전화를 대신 받는 AI 비서야. 사장님이 시술·조리 중이라 못 받은 전화야.
오늘: ${today} (${dow}요일)
${shop.hours ? `영업시간: ${shop.hours}` : "영업시간: 모름 — 물으면 사장님이 확인해서 연락드린다고 해"}
${shop.menu.length ? `메뉴·관리: ${shop.menu.join(", ")}` : ""}
${shop.rules ? `사장님 안내 메모(이것만 사실로 말해): ${shop.rules}` : ""}
규칙:
- 첫 마디(대화 첫 답)는 반드시 "${shop.name} AI 비서예요. 원장님이 지금 손님을 보고 계셔서 제가 대신 받았어요"처럼 AI라는 걸 밝혀.
- 전화 말투로 짧게(1~2문장), 공손하고 따뜻하게. 한 번에 하나만 물어봐.
- 예약 문의면 이름, 원하는 날짜·시간, 원하는 관리(메뉴), 연락처를 차례로 받아. 확정은 하지 마: "원장님이 확인하고 카톡으로 확정 연락드릴게요".
- 가격·빈자리·효과처럼 모르는 건 지어내지 말고 "원장님께 전달해서 바로 연락드릴게요".
- 의료·효과 보장 표현 금지. 개인정보는 예약에 필요한 것만.
- 손님이 다 말했거나 끊으려 하면 받아 적은 내용을 한 번 읽어 주고 인사로 끝내(end=true).
JSON 하나로만 답해: {"reply":"손님에게 할 말","end":false,"note":{"kind":"예약|문의|변경|취소|기타","name":"","phone":"","date":"YYYY-MM-DD 또는 빈칸","time":"HH:MM 또는 빈칸","what":"","request":"","summary":"사장님께 한 줄 요약"}}`;
  const messages = hist.map((m) => ({ role: m.who === "ai" ? "assistant" : "user", content: m.t }));
  // assistant로 끝나면 안 되고, 같은 역할이 이어지지 않게 합치기
  const merged: { role: string; content: string }[] = [];
  for (const m of messages) { const p = merged[merged.length - 1]; if (p && p.role === m.role) p.content += "\n" + m.content; else merged.push({ ...m }); }
  if (merged[0]?.role === "assistant") merged.unshift({ role: "user", content: "(전화 연결됨)" });
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 12000);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctl.signal,
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system, messages: merged }),
    });
    clearTimeout(tm);
    if (!r.ok) { console.error("anthropic", r.status, (await r.text()).slice(0, 200)); throw new Error("ai"); }
    const d = await r.json();
    const text = (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    const j = looseJSON(text) ?? { reply: text };
    const n = (j.note && typeof j.note === "object") ? j.note as Record<string, unknown> : {};
    return json({
      reply: clip(j.reply, 300) || "잠시만요, 다시 한 번 말씀해 주시겠어요?",
      end: !!j.end,
      note: {
        kind: clip(n.kind, 10), name: clip(n.name, 20).replace(/(고객님|님|씨)$/, ""), phone: clip(n.phone, 20).replace(/[^0-9]/g, ""),
        date: /^\d{4}-\d{2}-\d{2}$/.test(String(n.date)) ? String(n.date) : "", time: /^\d{1,2}:\d{2}$/.test(String(n.time)) ? String(n.time).padStart(5, "0") : "",
        what: clip(n.what, 60), request: clip(n.request, 200), summary: clip(n.summary, 200),
      },
    });
  } catch (e) {
    console.error("fail", String(e));
    return json({ error: "ai_error" }, 502);
  }
});
