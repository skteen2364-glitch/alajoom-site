import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// 무료 미니 도구: 글 다듬기 (가입 없이, IP당 하루 5번, 전체 하루 1000번)
// 사장님이 대충 쓴 이메일·문자·안내글을 붙여 넣으면 상황에 맞게 깔끔하게 다듬어 줌
const PER_IP = 5;
const CAP = 1000;
const MODEL = Deno.env.get("AI_MODEL") ?? "claude-haiku-5-5";
const ALLOWED = ["https://alajoom.com", "https://www.alajoom.com", "https://alajoom-site.pages.dev", "http://localhost:8765"];
function cors(origin: string | null) {
  const o = origin && (ALLOWED.includes(origin) || origin.endsWith(".alajoom-site.pages.dev")) ? origin : ALLOWED[0];
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
}
const KINDS: Record<string, string> = {
  email: "거래처·업체에 보내는 이메일 (인사, 용건, 마무리 인사를 갖춘 이메일 형식)",
  notice: "손님에게 보내는 안내 문자·카톡 (휴무, 예약 변경, 가격 안내 등. 짧고 알아보기 쉽게)",
  apology: "손님에게 보내는 사과 글 (변명 없이 사과, 앞으로의 조치, 다시 기회 부탁)",
  ask: "부탁·문의 글 (상대가 부담 없이 답할 수 있게, 원하는 것을 분명히)",
  post: "가게 공지 글 (게시판·SNS 공지, 핵심이 먼저 보이게)",
};
const TONES: Record<string, string> = { polite: "정중하고 깔끔하게", warm: "따뜻하고 다정하게", short: "짧고 간결하게" };
const SYSTEM = `너는 한국 1인 사장님이 대충 쓴 글을 보내기 좋게 다듬어 주는 도우미야.
- 사장님이 직접 쓴 것처럼 자연스러운 한국어로 다듬어. 딱딱한 번역투나 과한 존댓말은 피해.
- 원래 글의 뜻과 사실(날짜·시간·금액·이름·수량·장소)은 그대로 지켜. 없는 사실은 절대 지어내지 마.
- 꼭 필요한데 원래 글에 없는 정보(예: 날짜, 계좌, 연락처)는 지어내지 말고 [날짜]처럼 대괄호로 비워 둬.
- 맞춤법·띄어쓰기를 바로잡고, 순서를 읽기 좋게 정리해.
- '최고/1위/100%/치료/효과 보장' 같은 단정·효능 표현은 쓰지 마.
- 글이 아닌 요청(욕설만 있거나 관계없는 내용)이면 정중하게 다시 써 달라는 짧은 안내 한 줄만 써.
- 두 가지 버전을 써. 첫째는 상황에 맞게 잘 다듬은 글, 둘째는 핵심만 남긴 짧은 글.
- 출력 형식(이 형식만, 설명·제목 없이):
[다듬은 글]
(글)
[짧게]
(글)`;

function clip(v: unknown, n = 400) { return String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f]/g, " ").slice(0, n).trim(); }
function parse(t: string): string[] {
  return t.split(/\[(?:다듬은 글|짧게)\]/).map((s) => s.trim()).filter(Boolean).slice(-2);
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const text = clip(body.text, 1500);
  if (text.length < 5) return json({ error: "bad_request", message: "다듬을 글을 붙여 넣어 주세요." }, 400);
  const kind = KINDS[String(body.kind ?? "")] ?? KINDS.notice;
  const tone = TONES[String(body.tone ?? "")] ?? TONES.polite;
  const store = clip(body.store, 40);
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "ai_not_ready", message: "잠시 준비 중이에요." }, 503);

  const url = Deno.env.get("SUPABASE_URL")!;
  const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, svcKey, { auth: { persistSession: false } });
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("polish:" + ip + ":" + svcKey.slice(-12))))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const { data: ok, error: ge } = await admin.rpc("svc_consume_tool", { p_hash: hash, p_tool: "polish", p_per: PER_IP, p_cap: CAP });
  if (ge) { console.error("limit", ge.message); return json({ error: "server_error", message: "잠시 후 다시 해 주세요." }, 500); }
  if (!ok) return json({ error: "limit", message: "오늘 무료 글 다듬기를 다 썼어요. 알아줌에서는 매일 무료로 계속 쓸 수 있어요." }, 429);
  const refund = async () => {
    const day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    const { data: row } = await admin.from("tool_trials").select("count").eq("ip_hash", hash).eq("tool", "polish").eq("day", day).maybeSingle();
    if (row && row.count > 0) await admin.from("tool_trials").update({ count: row.count - 1 }).eq("ip_hash", hash).eq("tool", "polish").eq("day", day);
  };

  const user = [`글 종류: ${kind}`, store ? `보내는 가게 이름: ${store}` : "", `말투: ${tone}`, `사장님이 쓴 글:\n${text}`].filter(Boolean).join("\n");
  let why = "";
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 2000, system: SYSTEM, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) { why = "ai " + r.status + " " + (await r.text()).slice(0, 200); throw new Error(why); }
    const d = await r.json();
    const out = (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    const versions = parse(out);
    if (!versions.length) { why = "empty: " + out.slice(0, 200); throw new Error(why); }
    return json({ versions });
  } catch (e) {
    console.error("fail", String(e));
    await refund();
    return json({ error: "ai_error", message: "AI 연결이 잠시 끊겼어요. 다시 눌러 주세요.", why: why || String(e).slice(0, 200) }, 502);
  }
});
