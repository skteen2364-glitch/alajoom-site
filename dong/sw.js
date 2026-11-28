/* 알아줌 동네 — 단골 가게 알림 */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('push',function(e){
  var d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'알아줌 동네',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'단골 가게 새 소식',{body:d.body||'',icon:'/assets/icon-192.png',badge:'/assets/icon-192.png',tag:d.tag||'dong',renotify:true,data:{url:d.url||'/dong/'}}));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();var u=(e.notification.data&&e.notification.data.url)||'/dong/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){if(cs[i].url.indexOf('/dong/')>-1&&'focus' in cs[i]){cs[i].navigate(u);return cs[i].focus()}}
    return self.clients.openWindow(u);
  }));
});
