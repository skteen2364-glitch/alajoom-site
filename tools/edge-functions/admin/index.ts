import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const ALLOWED = ["https://alajoom.com", "https://www.alajoom.com", "https://alajoom-site.pages.dev", "http://localhost:8765"];
function cors(origin: string | null) {
  const o = origin && (ALLOWED.includes(origin) || origin.endsWith(".alajoom-site.pages.dev")) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const kstDay = (d: Date) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...h, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u, error: ue } = await admin.auth.getUser(jwt);
  if (ue || !u?.user) return json({ error: "login_required" }, 401);
  if ((u.user.app_metadata as Record<string, unknown> | undefined)?.role !== "admin") return json({ error: "forbidden" }, 403);

  // 회원 (auth.users: 이메일·가입일·마지막 로그인)
  const users: Array<{ id: string; email?: string; created_at: string; last_sign_in_at?: string | null }> = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return json({ error: "server_error" }, 500);
    users.push(...data.users.map((x) => ({ id: x.id, email: x.email, created_at: x.created_at, last_sign_in_at: x.last_sign_in_at })));
    if (data.users.length < 1000) break;
  }
  const { data: profs } = await admin.from("profiles").select("id,business_type,store_name,area,marketing_opt_in,marketing_opt_in_at,onboarded_at");
  const pm = new Map((profs ?? []).map((p) => [p.id, p]));

  const since = new Date(Date.now() - 30 * 86400e3).toISOString();
  const { data: ev } = await admin.from("usage_events").select("user_id,mate,tool,created_at").gte("created_at", since).limit(50000);
  const { data: daily } = await admin.from("usage_daily").select("user_id,day,count").gte("day", since.slice(0, 10)).limit(50000);

  const { data: fb } = await admin.from("feedback").select("id,user_id,mate,kind,message,page,created_at").order("created_at", { ascending: false }).limit(300);
  const emailOf = new Map(users.map((x) => [x.id, x.email ?? ""]));
  const today = kstDay(new Date());
  const members = users.map((x) => {
    const p = pm.get(x.id) ?? {} as Record<string, unknown>;
    return {
      email: x.email ?? "", joined: x.created_at, last_login: x.last_sign_in_at ?? null,
      business_type: (p as any).business_type ?? null, store_name: (p as any).store_name ?? null, area: (p as any).area ?? null,
      marketing: !!(p as any).marketing_opt_in, marketing_at: (p as any).marketing_opt_in_at ?? null,
      uses30: (daily ?? []).filter((d) => d.user_id === x.id).reduce((a, d) => a + (d.count ?? 0), 0),
    };
  }).sort((a, b) => b.joined.localeCompare(a.joined));

  const count = (arr: string[]) => Object.entries(arr.reduce((m: Record<string, number>, k) => { m[k] = (m[k] ?? 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const usesByDay: Record<string, number> = {};
  for (const d of daily ?? []) usesByDay[d.day] = (usesByDay[d.day] ?? 0) + (d.count ?? 0);
  const joinsByDay: Record<string, number> = {};
  for (const m of members) { const k = kstDay(new Date(m.joined)); joinsByDay[k] = (joinsByDay[k] ?? 0) + 1; }

  return json({
    today,
    totals: {
      members: members.length,
      today_joins: joinsByDay[today] ?? 0,
      onboarded: members.filter((m) => m.store_name).length,
      marketing: members.filter((m) => m.marketing).length,
      uses_today: usesByDay[today] ?? 0,
      uses_30: Object.values(usesByDay).reduce((a, b) => a + b, 0),
      active_7: new Set((daily ?? []).filter((d) => d.day >= kstDay(new Date(Date.now() - 6 * 86400e3))).map((d) => d.user_id)).size,
    },
    by_type: count(members.map((m) => m.business_type ?? "미입력")),
    by_area: count(members.map((m) => (m.area ?? "").trim() || "미입력")).slice(0, 15),
    by_tool: count((ev ?? []).map((e) => e.tool)),
    by_mate: count((ev ?? []).map((e) => e.mate)),
    joins_by_day: joinsByDay,
    uses_by_day: usesByDay,
    members,
    feedback: (fb ?? []).map((f) => ({ id: f.id, email: emailOf.get(f.user_id) ?? "", store_name: (pm.get(f.user_id) as any)?.store_name ?? null, mate: f.mate, kind: f.kind, message: f.message, page: f.page, created_at: f.created_at })),
  });
});
