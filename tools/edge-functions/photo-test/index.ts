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
    store: `${KEEP_FOOD}\nTask: restaurant-styled editorial photo. Keep the dish exactly the same. Place it on a tasteful wooden or stone restaurant table with soft warm natural light, a softly blurred cozy restaurant background, and at most one or two simple matching props (spoon, small side dish already typical for this meal). Calm, premium, magazine look.`,
  },
  space: {
    pro: `${KEEP_SPACE}\nTask: retouch this casual phone photo of a small treatment room / studio like a professional interior photographer. Balanced exposure (bright but not blown out, recover dark corners), neutral clean white balance (remove yellow/green cast), straighten vertical lines, gentle clarity. Tidy only small mess: hide cables, trash, bags, clothes, stray papers and bottles left lying around, wrinkled towels made neat. Clean, calm, inviting, trustworthy.`,
    product: `${KEEP_PRODUCT}\nTask: turn this casual product snapshot into a premium skincare/beauty product photo. Keep the product exactly the same and in the same orientation. Replace the background with a clean minimal studio set (soft beige or white backdrop, a light stone or linen surface) with soft diffused light and a natural soft shadow. Elegant and calm.`,
    clean: `${KEEP_PRODUCT}\nTask: clean e-commerce cut. Keep the product/subject exactly the same. Replace the background with a pure bright white seamless background, soft even light, subtle natural shadow under it, centered.`,
  },
};
const GROUP: Record<string, string> = { food: "food", skin: "space", pilates: "space", nail: "space", hair: "space" };

Deno.serve(async (req) => {
  // 임시 품질 테스트용 (테스트 후 삭제)
  if (req.headers.get("x-test") !== "555f40d9f59d2c3b5dd8ad013581ff43") return new Response("no", { status: 403 });
  const b = await req.json();
  const g = GROUP[b.mate], key = Deno.env.get("GEMINI_API_KEY")!;
  const payload = { contents: [{ role: "user", parts: [{ text: MODES[g][b.mode] + "\n" + COMMON }, { inlineData: { mimeType: "image/jpeg", data: b.image } }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { imageSize: "1K" } } };
  const tried = [];
  for (const m of MODELS) {
    const t0 = Date.now();
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, { method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json().catch(() => ({}));
    tried.push(m + " " + r.status + " " + (Date.now() - t0) + "ms");
    if (r.status === 404) continue;
    const p = (d?.candidates?.[0]?.content?.parts ?? []).find((x) => x.inlineData);
    return new Response(JSON.stringify({ tried, image: p?.inlineData?.data ?? null, err: p ? null : JSON.stringify(d).slice(0, 500) }), { headers: { "content-type": "application/json" } });
  }
  return new Response(JSON.stringify({ tried }), { headers: { "content-type": "application/json" } });
});
