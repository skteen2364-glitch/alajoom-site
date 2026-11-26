import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// 알아줌 전화 비서 ① 통화 녹음 정리 — 녹음을 듣고 예약·요청을 JSON으로. 녹음은 저장하지 않음.
// IP당 하루 20번, 전체 하루 1000번 (tool_trials 'call')
const PER_IP = 20, CAP = 1000;
const MODELS = [Deno.env.get("GEMINI_AUDIO_MODEL") ?? "gemini-flash-latest", "gemini-3.1-flash", "gemini-3-flash", "gemini-2.5-flash"];
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
const KINDS = ["예약", "예약 변경", "예약 취소", "주문", "문의", "기타"];

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad_request", message: "녹음 파일을 읽지 못했어요" }, 400); }
  const audio = typeof body.audio === "string" ? body.audio : "";
  const mime = /^audio\/[a-z0-9.+-]+$/i.test(String(body.mime ?? "")) ? String(body.mime) : "audio/mp4";
  if (!audio || !/^[A-Za-z0-9+/=]+$/.test(audio)) return json({ error: "bad_request", message: "녹음 파일을 읽지 못했어요" }, 400);
  if (audio.length > 14_000_000) return json({ error: "too_big", message: "녹음이 너무 길어요. 10분 안쪽 통화로 올려 주세요" }, 400);
  const mate = MATES[String(body.mate ?? "")] ? String(body.mate) : "skin";
  const shop = clip(body.shop, 40);
  const menu = Array.isArray(body.menu) ? (body.menu as unknown[]).map((x) => clip(x, 30)).filter(Boolean).slice(0, 20) : [];
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "ai_not_ready", message: "준비 중이에요" }, 503);

  const url = Deno.env.get("SUPABASE_URL")!, svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, svcKey, { auth: { persistSession: false } });
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("call:" + ip + ":" + svcKey.slice(-12))))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const { data: ok } = await admin.rpc("svc_consume_tool", { p_hash: hash, p_tool: "call", p_per: PER_IP, p_cap: CAP });
  if (ok === false) return json({ error: "limit", message: "오늘은 녹음 정리를 많이 쓰셨어요. 내일 다시 써 주세요" }, 429);

  const now = new Date(Date.now() + 9 * 3600e3);
  const today = now.toISOString().slice(0, 10);
  const dow = "일월화수목금토"[now.getUTCDay()];
  const prompt = `이 녹음은 한국 ${MATES[mate]}${shop ? `('${shop}')` : ""} 사장님과 손님(또는 거래처)의 전화 통화야. 잘 듣고 사장님 장부에 적을 내용만 JSON 하나로 답해.
오늘: ${today} (${dow}요일). "내일", "다음 주 화요일" 같은 말은 날짜(YYYY-MM-DD)로 바꿔.
${menu.length ? `가게 메뉴·관리 이름: ${JSON.stringify(menu)} — 맞는 게 있으면 그 이름 그대로.` : ""}
규칙:
- kind: ${JSON.stringify(KINDS)} 중 하나
- name: 손님 이름(님 빼고). 통화에 안 나오면 ""
- phone: 통화에서 말한 전화번호(숫자만). 없으면 ""
- date: 예약·방문·픽업 날짜 YYYY-MM-DD, 없으면 ""
- time: 24시간 HH:MM ("오후 2시" → "14:00"), 없으면 ""
- what: 관리·메뉴·주문 내용 짧게, 없으면 ""
- people: 인원 숫자, 모르면 0
- request: 손님이 따로 부탁한 것(알레르기·주차·원하는 담당 등) 한 줄, 없으면 ""
- summary: 통화 요약 1~2문장, 사장님께 말하듯 ("김지은님이 내일 오후 2시 수분 관리 예약하셨어요")
- todo: 사장님이 할 일 한 줄, 없으면 ""
- reply: 손님에게 보낼 확인 카톡 문구 2~3문장, 가게 이름으로 친근하게. 예약이 아니면 문의에 맞는 답장. 지어낸 가격·약속은 넣지 마
- 들은 말만 쓰고 추측하지 마. 녹음이 통화가 아니거나 안 들리면 kind "기타", summary에 그렇게 적어
형식: {"kind":"","name":"","phone":"","date":"","time":"","what":"","people":0,"request":"","summary":"","todo":"","reply":""}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: audio } }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
  };
  try {
    let text = "", last = "";
    for (const m of MODELS) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: JSON.stringify(payload),
      });
      if (r.status === 404) { last = "404 " + m; continue; }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { last = r.status + " " + JSON.stringify(d).slice(0, 300); continue; }
      text = (d?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
      if (text) break;
      last = "empty " + JSON.stringify(d?.candidates?.[0]?.finishReason ?? d?.promptFeedback ?? {}).slice(0, 200);
    }
    if (!text) throw new Error(last);
    const j = looseJSON(text) ?? {};
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(j.date)) ? String(j.date) : "";
    const time = /^\d{1,2}:\d{2}$/.test(String(j.time)) ? String(j.time).padStart(5, "0") : "";
    return json({
      kind: KINDS.includes(String(j.kind)) ? String(j.kind) : "기타",
      name: clip(j.name, 20).replace(/(고객님|회원님|님|씨)$/, ""),
      phone: clip(j.phone, 20).replace(/[^0-9]/g, ""),
      date, time,
      what: clip(j.what, 60),
      people: Math.max(0, Math.min(999, Math.round(Number(j.people) || 0))),
      request: clip(j.request, 200),
      summary: clip(j.summary, 300),
      todo: clip(j.todo, 120),
      reply: clip(j.reply, 400),
    });
  } catch (e) {
    console.error("gemini", String(e));
    return json({ error: "ai_error", why: String(e).slice(0, 160).replace(/key=[^&\s]+/g, ""), message: "녹음을 정리하지 못했어요. 잠시 뒤 다시 올려 주세요" }, 502);
  }
});
