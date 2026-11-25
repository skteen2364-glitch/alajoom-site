import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// AI 사진 보정(구글 Gemini 이미지 편집). 사진 속 음식·제품·공간은 그대로 두고 빛·색·배경·정리만 바꾼다.
const DAILY = 3;
const MODELS = [Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-nano-banana-2.1", "gemini-3.1-flash-image"];
const ALLOWED = ["https://alajoom.com", "https://www.alajoom.com", "https://alajoom-site.pages.dev", "http://localhost:8765"];
function cors(origin: string | null) {
  const o = origin && (ALLOWED.includes(origin) || origin.endsWith(".alajoom-site.pages.dev")) ? origin : ALLOWED[0];
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
}

const KEEP_FOOD = "ABSOLUTE RULE: the food must stay 100% identical — same dish, same portion size, same toppings, same garnish, same bowl/plate, same arrangement. Do not add, remove, enlarge or 'improve' any food item. Do not add steam, sauce, or ingredients that are not in the photo.";
const KEEP_SPACE = "ABSOLUTE RULE: this is a real shop. Keep the room layout, walls, windows, furniture, beds, equipment and products exactly as they are — same positions, same shapes, same count. Do not add furniture, plants, decorations or equipment. Do not make the room look bigger or like a different place.";
const KEEP_PRODUCT = "ABSOLUTE RULE: keep the product itself 100% identical — same shape, size, color, label text and logo, cap and container. Do not redraw or translate any label text.";
const COMMON = "Never add text, letters, logos, watermarks, people or hands. If a person is in the photo, keep their face, body and skin exactly unchanged (no beautification). Output one photorealistic photo that looks like it was shot by a professional photographer with a real camera — not CGI, not illustration.";

const MODES: Record<string, Record<string, string>> = {
  food: {
    pro: `${KEEP_FOOD}\nTask: professional food-photo retouch of this casual phone snapshot. Remove the yellow/orange kitchen light cast and set a natural white balance. Relight it like soft daylight from a window at the side: bright, clean highlights, gentle shadows, appetizing natural colors (not oversaturated). Sharpen the food texture. Tidy the table: remove crumbs, stains, tissue, receipts, phones and clutter. Keep the same camera angle and framing.`,
    delivery: `${KEEP_FOOD}\nTask: make a delivery-app main photo (Baemin/Coupang Eats style). Keep the dish exactly the same and the same angle. Replace only the surroundings with a clean, bright, plain light table surface, nothing distracting. Bright even lighting, crisp and appetizing, the dish fills most of the frame.`,
    store: `${KEEP_FOOD}\nTask: restaurant-styled editorial photo. Keep the dish exactly the same. Keep the same camera angle and keep the dish the same size in the frame (do not zoom out — the dish should still fill most of the photo). Place it on a tasteful wooden or stone restaurant table with soft warm natural light and a softly blurred, empty cozy restaurant background (no people). At most one or two simple matching props (cutlery, napkin, a glass of water). Calm, premium, magazine look.`,
  },
  space: {
    pro: `${KEEP_SPACE}\nTask: retouch this casual phone photo of a small shop room (treatment room, studio or small classroom) like a professional interior photographer. Balanced exposure (bright but not blown out, recover dark corners), neutral clean white balance (remove yellow/green cast), straighten vertical lines, gentle clarity. Tidy only small mess: hide cables, trash, bags, clothes, stray papers and bottles left lying around, wrinkled towels made neat. Clean, calm, inviting, trustworthy.`,
    product: `${KEEP_PRODUCT}\nTask: turn this casual product snapshot into a premium skincare/beauty product photo. Keep the product exactly the same and in the same orientation. Replace the background with a clean minimal studio set (soft beige or white backdrop, a light stone or linen surface) with soft diffused light and a natural soft shadow. Elegant and calm.`,
    mood: `${KEEP_SPACE}\nIf the photo is a product or a hands-on treatment close-up instead of a room, keep every object and person exactly the same.\nTask: editorial mood shot of this same scene. Keep composition and every object. Soft, warm, diffused natural window light, calm muted tones, gentle depth, clean and serene premium spa / studio magazine look. Remove only small clutter.`,
    clean: `${KEEP_PRODUCT}\nTask: clean e-commerce cut. Keep the product/subject exactly the same. Replace the background with a pure bright white seamless background, soft even light, subtle natural shadow under it, centered.`,
  },
};
const GROUP: Record<string, string> = { food: "food", skin: "space", pilates: "space", nail: "space", hair: "space", academy: "space", cafe: "food", bakery: "food" };

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u, error: ue } = await admin.auth.getUser(jwt);
  if (ue || !u?.user) return json({ error: "login_required", message: "카카오로 로그인한 뒤 써 주세요." }, 401);
  const uid = u.user.id;
  const isAdmin = (u.user.app_metadata as Record<string, unknown> | undefined)?.role === "admin";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const mate = String(body.mate ?? "");
  const g = GROUP[mate];
  const mode = String(body.mode ?? "pro");
  const img = typeof body.image === "string" ? body.image : "";
  if (!g || !MODES[g][mode]) return json({ error: "bad_request", message: "보정 종류가 올바르지 않아요." }, 400);
  if (!img || !/^[A-Za-z0-9+/=]+$/.test(img) || img.length > 3_000_000) return json({ error: "bad_request", message: "사진이 너무 크거나 올바르지 않아요." }, 400);

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "ai_not_ready", message: "AI 사진 보정을 준비 중이에요." }, 503);

  // 하루 한도(한국 시간 기준)
  const kst = new Date(Date.now() + 9 * 3600e3); kst.setUTCHours(0, 0, 0, 0);
  const since = new Date(kst.getTime() - 9 * 3600e3).toISOString();
  const { count } = await admin.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("tool", "aiphoto").gte("created_at", since);
  const used = count ?? 0;
  if (!isAdmin && used >= DAILY) return json({ error: "limit", message: `AI 사진 보정은 하루 ${DAILY}장까지예요. 내일 다시 써 주세요!`, used, limit: DAILY }, 429);
  const { data: ev } = await admin.from("usage_events").insert({ user_id: uid, mate, tool: "aiphoto" }).select("id").single();

  const payload = {
    contents: [{ role: "user", parts: [{ text: MODES[g][mode] + "\n" + COMMON }, { inlineData: { mimeType: "image/jpeg", data: img } }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { imageSize: "1K" } },
  };
  try {
    let out: { data: string; mimeType: string } | null = null, last = "";
    for (const m of MODELS) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: JSON.stringify(payload),
      });
      if (r.status === 404) { last = "404 " + m; continue; }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { last = r.status + " " + JSON.stringify(d).slice(0, 300); break; }
      const parts = d?.candidates?.[0]?.content?.parts ?? [];
      const p = parts.find((x: Record<string, unknown>) => x.inlineData || x.inline_data);
      const id = p && (p.inlineData ?? p.inline_data);
      if (id?.data) { out = { data: id.data, mimeType: id.mimeType ?? id.mime_type ?? "image/png" }; break; }
      last = "noimage " + JSON.stringify(d?.candidates?.[0]?.finishReason ?? d?.promptFeedback ?? {}).slice(0, 200); break;
    }
    if (!out) throw new Error(last);
    return json({ image: out.data, mimeType: out.mimeType, used: isAdmin ? 0 : used + 1, limit: DAILY });
  } catch (e) {
    console.error("gemini", String(e));
    if (ev?.id) await admin.from("usage_events").delete().eq("id", ev.id);
    return json({ error: "ai_error", message: "AI 보정이 잠시 안 됐어요. 다시 시도해 주세요. (횟수는 차감되지 않아요)" }, 502);
  }
});
