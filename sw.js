// 알아줌 service worker: 항상 새로 받고(network-first), 인터넷이 끊기면 마지막으로 받은 화면·스크립트로 열기
const C = 'alajoom-v5';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['/', '/assets/icon-192.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const keep = (r, res) => { if (res && res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r, { cache: 'no-store' }).then(res => keep(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('/'))));
    return;
  }
  // 메이트가 쓰는 스크립트·아이콘·매니페스트: 새로 받되, 끊기면 저장해 둔 것으로
  if (/\.(js|webmanifest|png)$/.test(u.pathname) && !u.pathname.startsWith('/admin/')) {
    e.respondWith(fetch(r).then(res => keep(r, res)).catch(() => caches.match(r).then(m => m || caches.match(r, { ignoreSearch: true }))));
  }
});
