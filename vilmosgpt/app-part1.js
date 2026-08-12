(function(){var s=document.createElement('script');s.src='logo-inject.js?v=m4';document.head.appendChild(s);})();

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resetBtn = document.getElementById('reset');
const themeToggle = document.getElementById('theme-toggle');
const modeLabel = document.getElementById('mode-label');
const promptBank = document.getElementById('prompt-bank');
const mentorList = document.getElementById('mentor-list');
const memoryList = document.getElementById('memory-list');
const exportMemoryBtn = document.getElementById('export-memory');
const importMemoryInput = document.getElementById('import-memory');
const sidebarLeft = document.getElementById('sidebar-left');
const sidebarRight = document.getElementById('sidebar-right');
const mainChat = document.getElementById('main-chat');
const storageKey = 'vilmosgpt-memory-v2';
let knowledge = loadKnowledge();
let currentMode = 'learn';
let conversationHistory = [];

const modeHints = {
  learn: 'Tanulás mód: világosan és lépésről lépésre magyarázok.',
  research: 'Kutatás mód: 20+ forrást nézek át, a legjobbat összerakom.',
  practice: 'Gyakorlás mód: kérdéseket, feladatokat és példákat adok.',
  creative: 'Kreatív mód: ötleteket, forgatókönyveket és új megközelítéseket kínálok.'
};

const promptLibrary = [
  'Magyarázd el egyszerűen, hogyan működik a természetes nyelvfeldolgozás.',
  'Adj meg öt ötletet egy kreatív projekt megvalósítására.',
  'Mondd el, mi a különbség a tanulás és a memorizálás között.',
  'Segíts megérteni a különbséget a CPU és a RAM között.',
  'Mit jelent a „kritikus gondolkodás” röviden?',
  'Magyarázd el, hogyan lehet gyorsan tanulni egy új témát.',
  'Mit érdemes tenni, ha elfárad a figyelem?',
  'Javasolj egy jó kezdő programozási nyelvet.',
  'Hogyan lehet egyszerűen megérteni a fizikát?',
  'Mi az a metakogníció? Magyarázd el egyszerűen.',
  'Adj 10 hasznos tanulási tippet kezdőknek.',
  'Mit érdemes csinálni, ha elakadok egy feladatnál?'
];

const mentorTips = [
  'Kérdezz bátran, ha valami nem érthető: a jó kérdés gyakran jobb megoldáshoz vezet.',
  'A rövid, világos kérdések gyakran jobb válaszokat hoznak, mint a túl bonyolultak.',
  'A tanulás hatékonyabb, ha magyarázol, gyakorolsz és összefoglalod a lényeget.',
  'A memória erősödik, ha a tanult dolgokat rendszeresen visszahívod.',
  'Ha nehéz egy témát megérteni, bontsd kisebb részekre.',
  'A hibákból tanulni ugyanúgy fontos, mint a sikerekből.'
];

const simpleDefinitions = {
  kutya: 'A kutya (Canis familiaris) az ember egyik legrégebbi háziállata. A farkas leszármazottja, hűséges társ, őrző, vadásztárs vagy munkakutya is lehet. Sok fajtája van (pl. labrad[...],',
  csivava: 'A csivava (chihuahua) a legkisebb kutyafajták egyike. Mexikóból származik, kicsi, élénk, gyakran merész természetű. Hosszú és rövid szőrű változata is van.',
  chihuahua: 'A csivava (chihuahua) a legkisebb kutyafajták egyike. Mexikóból származik, kicsi, élénk, gyakran merész természetű.',
  labrador: 'A labrador (labrador retriever) barátságos, okos kutyafajta. Gyakori családi és segítő kutya; szeret apportírozni és vízben úszni.',
  'német juhász': 'A német juhász okos, hűséges munkakutya. Gyakran őrző, rendőrségi vagy vakvezető kutya.',
  yorkshire: 'A yorkshire terrier (yorkie) kis termetű, hosszú szőrű kutyafajta. Élénk, bátor, kedvelt társállat.',
  pudli: 'A pudli okos, fürge kutyafajta. Több méretben létezik; kevésbé vedlik.',
  husky: 'A szibériai husky erős, energikus kutyafajta. Eredetileg szánhúzó.',
  macska: 'A macska (Felis catus) kis termetű háziállat. Önálló, ügyes vadász, sokan tartják társállatként. Éjszakai látása kiváló, és jellegzetesen dorombol.'
};


/* === START: sanitize + addMessage wrapper ===
   This wrapper ensures bot messages are sanitized before display
   v2: strong clean – no web links, no DuckDuckGo/Image garbage
*/
(function(){
  // inject small stylesheet for source badges
  try {
    var st = document.createElement('style');
    st.textContent = '\n  .vilmos-sources{display:flex;align-items:center;gap:8px;margin-top:8px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);font-size:12px;color:#94a3b8}\n  .vilmos-source-icons{display:flex;align-items:center;gap:6px}\n  .vilmos-source-badge{width:28px;height:28px;border-radius:999px;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:#fff;border:1px solid rgba(0,0,0,0.06)}\n  .vilmos-source-badge img{width:20px;height:20px;display:block}\n  .vilmos-sources .vilmos-source-count{margin-left:6px;color:#94a3b8}\n    ';
    document.head.appendChild(st);
  } catch (e) {}

  function extractDomains(text) {
    var domains = [];
    if (!text || typeof text !== 'string') return domains;
    // find explicit URLs
    var urlRegex = /https?:\/\/[^\s)]+/gi;
    var m;
    while ((m = urlRegex.exec(text)) !== null) {
      try {
        var u = new URL(m[0]);
        domains.push(u.hostname.replace(/^www\./, ''));
      } catch (e) {}
    }
    // common site name mapping (if LLM mentions site names without URLs)
    var mapping = {
      'wikip': 'wikipedia.org',
      'wikipedia': 'wikipedia.org',
      'github': 'github.com',
      'duckduckgo': 'duckduckgo.com',
      'google': 'google.com',
      'bing': 'bing.com',
      'roblox': 'roblox.com'
    };
    var lower = text.toLowerCase();
    Object.keys(mapping).forEach(function(k){
      if (lower.indexOf(k) !== -1) domains.push(mapping[k]);
    });
    // dedupe and limit
    var out = [];
    domains.forEach(function(d){ if (d && out.indexOf(d) === -1) out.push(d); });
    return out;
  }

  // remove URLs and known site name artefacts from body text – STRONG version
  function sanitizeResponse(text) {
    if (!text || typeof text !== 'string') return text;
    var t = String(text);

    // remove explicit URLs entirely (http, https, www)
    t = t.replace(/https?:\/\/[^\s)\]]+/gi, ' ');
    t = t.replace(/\bwww\.[^\s)\]]+/gi, ' ');

    // remove Image N / ! Image N markers (with or without parens/brackets)
    t = t.replace(/\(?\s*!\s*Image\s*\d+\s*\)?/gi, ' ');
    t = t.replace(/\(?\s*\[?Image\s*\d+\]?\s*\)?/gi, ' ');
    t = t.replace(/\bImage\s*\d+\b/gi, ' ');

    // remove parenthetical site names: ( "DuckDuckGo" ), (DuckDuckGo), etc.
    t = t.replace(/\(\s*["']?(duckduckgo|google|bing|wikipedia|github|roblox|jina\.ai)["']?\s*\)/gi, ' ');

    // remove standalone or quoted site names
    t = t.replace(/["']?(duckduckgo|google|bing|wikipedia|github|roblox|jina\.ai)["']?/gi, ' ');

    // remove search-result style headers: "Something Documentation - SiteName"
    t = t.replace(/\b[A-Za-z0-9 _-]+\s+Documentation\s*[-–—]\s*[A-Za-z0-9 _.-]+/gi, ' ');
    t = t.replace(/\bCreator Hub\b/gi, ' ');
    t = t.replace(/\bRoblox Creator\b/gi, ' ');

    // collapse leftover messy parentheses and brackets
    t = t.replace(/\(\s*["']?\s*\)/g, ' ');
    t = t.replace(/\(\s*\(/g, ' ');
    t = t.replace(/\)\s*\)/g, ' ');
    t = t.replace(/\[\s*\]/g, ' ');
    t = t.replace(/\{\s*\}/g, ' ');

    // remove leftover quote-only or punctuation garbage at start
    t = t.replace(/^\s*[("']+\s*/g, '');
    t = t.replace(/\s*[)"]+\s*$/g, '');

    // cleanup invisible chars and excessive whitespace
    t = t.replace(/[\u200B-\u200D\uFEFF]/g, '');
    t = t.replace(/[^\S\r\n]{2,}/g, ' ');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/^\s+|\s+$/g, '');

    // final safety: if still looks like pure garbage (mostly punctuation / short), return empty so fallback kicks in
    var cleanCheck = t.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s.,!?]/g, '').trim();
    if (cleanCheck.length < 30) return '';

    return t;
  }

  // After message added, attach source badges under the last bot message element
  function attachSourceBadges(domains) {
    if (!domains || !domains.length) return;
    try {
      var chatEl = document.getElementById('chat');
      if (!chatEl) return;
      var messages = chatEl.querySelectorAll('.message');
      if (!messages || messages.length === 0) return;
      var last = messages[messages.length - 1];
      if (!last) return;
      // avoid duplicating source bar
      if (last.querySelector('.vilmos-sources')) return;

      var container = document.createElement('div');
      container.className = 'vilmos-sources';

      var icons = document.createElement('div');
      icons.className = 'vilmos-source-icons';

      var maxShow = 5;
      for (var i = 0; i < Math.min(domains.length, maxShow); i++) {
        var d = domains[i];
        var badge = document.createElement('div');
        badge.className = 'vilmos-source-badge';
        var img = document.createElement('img');
        // use google favicon service (works for most sites)
        img.src = 'https://www.google.com/s2/favicons?sz=64&domain=' + encodeURIComponent(d);
        img.alt = d;
        badge.appendChild(img);
        icons.appendChild(badge);
      }
      container.appendChild(icons);

      var countSpan = document.createElement('span');
      countSpan.className = 'vilmos-source-count';
      countSpan.textContent = (domains.length === 1) ? '1 webhely' : (domains.length + ' webhely');
      container.appendChild(countSpan);

      // append to bubble area; prefer inside bubble for mobile compactness
      var bubble = last.querySelector('.bubble');
      if (bubble) bubble.appendChild(container); else last.appendChild(container);
    } catch (e) {
      console.warn('attachSourceBadges', e);
    }
  }

  // Poll and wrap addMessage
  var attempts = 0;
  var maxAttempts = 80;
  var interval = setInterval(function(){
    attempts++;
    try {
      if (typeof window.addMessage === 'function' && window.addMessage._isSanitized !== true) {
        var orig = window.addMessage;
        var wrapped = function() {
          var args = Array.prototype.slice.call(arguments);
          var raw = (typeof args[0] === 'string') ? args[0] : '';

          // extract domains BEFORE we sanitize the body
          var domains = extractDomains(raw);

          // sanitize body so no links or site names remain inline
          if (typeof args[0] === 'string') {
            args[0] = sanitizeResponse(args[0]);
            // if after strong clean nothing useful left → force fallback style short message
            if (!args[0] || args[0].length < 25) {
              args[0] = (typeof detectLang === 'function' && detectLang(raw) === 'en')
                ? 'I could not extract a clean answer. Please rephrase the question.'
                : 'Nem sikerült tiszta választ kinyerni. Próbáld másképp megfogalmazni a kérdést.';
            }
          }

          // call original
          var ret = orig.apply(this, args);

          // attach badges async (allow original to render)
          setTimeout(function(){ attachSourceBadges(domains); }, 30);

          return ret;
        };
        wrapped._isSanitized = true;
        window.addMessage = wrapped;
        window._vilmos_sanitizeResponse = sanitizeResponse;
        clearInterval(interval);
        return;
      }
    } catch (e) {}
    if (attempts >= maxAttempts) clearInterval(interval);
  }, 200);

})();
/* === END: sanitize + addMessage wrapper === */
