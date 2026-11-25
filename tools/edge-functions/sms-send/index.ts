// 알아줌 문자 자동 발송 (시험) — 솔라피(SOLAPI) 연동
// - 로그인 + sms_senders에 등록된 사장님만 사용 (관리자가 등록)
// - 시크릿: SOLAPI_API_KEY, SOLAPI_API_SECRET (없으면 enabled:false)
// - 광고 문자: (광고)+가게 이름 앞에, 무료 수신거부 끝에, 밤 9시~아침 8시 막음
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function hmac(secret: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function solapiAuth(key: string, secret: string) {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID().replace(/-/g, "");
  return `HMAC-SHA256 apiKey=${key}, date=${date}, salt=${salt}, signature=${await hmac(secret, date + salt)}`;
}
const digits = (s: string) => String(s || "").replace(/[^0-9]/g, "");
const kstHour = () => (new Date().getUTCHours() + 9) % 24;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return J({ error: "method" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!, svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const KEY = Deno.env.get("SOLAPI_API_KEY") || "", SECRET = Deno.env.get("SOLAPI_API_SECRET") || "";
  const admin = createClient(url, svc, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return J({ enabled: false, error: "login", message: "로그인이 필요해요" }, 401);
  const uid = u.user.id;
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch (_) { /* empty */ }

  const { data: snd } = await admin.from("sms_senders").select("from_no,shop,optout,active,monthly_cap").eq("user_id", uid).maybeSingle();
  const ready = !!(KEY && SECRET && snd && snd.active);
  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  let used = 0;
  if (snd) {
    const { data: logs } = await admin.from("sms_log").select("ok").eq("user_id", uid).gte("created_at", monthStart.toISOString());
    used = (logs || []).reduce((a, r) => a + (r.ok || 0), 0);
  }
  const left = snd ? Math.max(0, snd.monthly_cap - used) : 0;
  if (body.check) return J({ enabled: ready, left, from: ready ? snd!.from_no : null, adReady: !!snd?.optout });
  if (!ready) return J({ error: "not_ready", message: "문자 자동 발송은 아직 준비 중이에요" }, 403);

  const ad = !!body.ad;
  const items = Array.isArray(body.items) ? (body.items as { to: string; text: string }[]) : [];
  if (!items.length) return J({ error: "empty", message: "받을 분이 없어요" }, 400);
  if (items.length > 50) return J({ error: "too_many", message: "한 번에 50분까지 보낼 수 있어요" }, 400);
  if (items.length > left) return J({ error: "cap", message: `이번 달 남은 문자는 ${left}건이에요` }, 400);
  if (ad) {
    if (!snd!.optout) return J({ error: "optout", message: "광고 문자는 무료 수신거부 번호를 먼저 등록해야 해요" }, 400);
    const h = kstHour();
    if (h >= 21 || h < 8) return J({ error: "night", message: "광고 문자는 밤 9시~아침 8시에 보낼 수 없어요" }, 400);
  }
  const shop = String(snd!.shop || "").trim();
  const msgs = [] as { to: string; from: string; text: string }[];
  for (const it of items) {
    const to = digits(it.to);
    let text = String(it.text || "").trim().slice(0, 900);
    if (!/^01\d{8,9}$/.test(to) || !text) continue;
    if (/\[[^\]]{1,10}\]/.test(text)) return J({ error: "blank", message: "[ ] 빈칸을 채운 뒤 보내 주세요" }, 400);
    if (ad) text = `(광고)${shop ? shop + " " : ""}\n${text.replace(/^\(광고\)\s*/, "")}\n무료수신거부 ${snd!.optout}`;
    msgs.push({ to, from: digits(snd!.from_no), text });
  }
  if (!msgs.length) return J({ error: "phone", message: "휴대폰 번호가 있는 고객이 없어요" }, 400);

  let ok = 0, fail = msgs.length, detail: unknown = null;
  try {
    const r = await fetch("https://api.solapi.com/messages/v4/send-many/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: await solapiAuth(KEY, SECRET) },
      body: JSON.stringify({ messages: msgs }),
    });
    const d = await r.json().catch(() => ({}));
    detail = d;
    if (r.ok) {
      const failed = Array.isArray(d.failedMessageList) ? d.failedMessageList.length : 0;
      ok = msgs.length - failed; fail = failed;
    }
  } catch (e) { detail = String(e); }
  await admin.from("sms_log").insert({ user_id: uid, n: msgs.length, ok, ad, kind: String(body.kind || "") });
  if (!ok) { console.log("solapi fail", JSON.stringify(detail).slice(0, 500)); return J({ error: "send", message: "문자 업체에서 보내기를 실패했어요. 잠시 뒤 다시 해 주세요", ok, fail }, 502); }
  return J({ ok, fail, left: left - ok });
});
