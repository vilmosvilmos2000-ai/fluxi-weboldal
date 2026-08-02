function autoResizeInput() {
  var el = typeof input !== 'undefined' ? input : document.getElementById('input');
  if (!el) return;
  el.style.height = 'auto';
  var max = Math.round(1.4 * 16 * 5 + 24);
  var next = Math.min(el.scrollHeight, max);
  el.style.height = next + 'px';
  el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
}
function resetInputSize() {
  var el = typeof input !== 'undefined' ? input : document.getElementById('input');
  if (!el) return;
  el.style.height = '44px';
  el.style.overflowY = 'hidden';
}

function hideEmptyState() {
  var es = document.getElementById('empty-state');
  if (es) es.classList.add('hidden');
  var chatEl = document.getElementById('chat');
  if (chatEl) chatEl.classList.remove('is-empty');
}
function showEmptyState() {
  var es = document.getElementById('empty-state');
  if (es) es.classList.remove('hidden');
  var chatEl = document.getElementById('chat');
  if (chatEl) chatEl.classList.add('is-empty');
}
function initEmptyState() {
  try {
    var main = document.getElementById('main-chat') || document.querySelector('.main-chat');
    if (!main) return;
    if (!document.getElementById('empty-state')) {
      var es = document.createElement('div');
      es.id = 'empty-state';
      es.className = 'empty-state';
      es.innerHTML =
        '<div class="empty-inner">' +
          '<div class="empty-badge">0.4</div>' +
          '<h2 class="empty-title">Vilmos GPT</h2>' +
          '<p class="empty-sub">Szia! Kérdezz bármit — segítek kódban, tanulásban és kutatásban.</p>' +
          '<div class="empty-cards">' +
            '<button type="button" class="empty-card" data-q="Hogyan írjak egy admin panelt Roblox Luau-ban?">' +
              '<span class="empty-card-icon">🎮</span>' +
              '<span class="empty-card-text">Hogyan írjak egy admin panelt Roblox Luau-ban?</span>' +
            '</button>' +
            '<button type="button" class="empty-card" data-q="Mik a legjobb beállítások egy elektromos rollerhez?">' +
              '<span class="empty-card-icon">🛴</span>' +
              '<span class="empty-card-text">Mik a legjobb beállítások egy elektromos rollerhez?</span>' +
            '</button>' +
            '<button type="button" class="empty-card" data-q="Segíts egy HTML és CSS alapú kvíz kódolásában!">' +
              '<span class="empty-card-icon">💻</span>' +
              '<span class="empty-card-text">Segíts egy HTML és CSS alapú kvíz kódolásában!</span>' +
            '</button>' +
            '<button type="button" class="empty-card" data-q="Magyarázd el egyszerűen, mi az a mesterséges intelligencia.">' +
              '<span class="empty-card-icon">🤖</span>' +
              '<span class="empty-card-text">Magyarázd el egyszerűen, mi az a mesterséges intelligencia.</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      var chatEl = document.getElementById('chat');
      if (chatEl && chatEl.parentNode) chatEl.parentNode.insertBefore(es, chatEl);
      else main.insertBefore(es, main.firstChild);
    }
    document.querySelectorAll('.empty-card').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var q = btn.getAttribute('data-q') || '';
        q = String(q).trim();
        if (!q) return;
        hideEmptyState();
        input.value = q;
        if (typeof autoResizeInput === 'function') autoResizeInput();
        sendMessage();
      });
    });
    showEmptyState();
  } catch (e) { console.warn('empty state', e); }
}

function isMobileView() {
  return window.innerWidth <= 960;
}
function renderPromptBank() {
  promptBank.innerHTML = '';
  promptLibrary.forEach(item => {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    const button = document.createElement('button');
    button.textContent = item;
    button.addEventListener('click', () => {
      input.value = item;
      autoResizeInput();
      if (isMobileView()) {
        showPanel('chat');
        setTimeout(function(){ sendMessage(); }, 80);
      } else {
        input.focus();
      }
    });
    div.appendChild(button);
    promptBank.appendChild(div);
  });
}
function renderMentorTips() {
  mentorList.innerHTML = '';
  mentorTips.forEach(item => {
    const div = document.createElement('div');
    div.className = 'mentor-item';
    div.textContent = item;
    mentorList.appendChild(div);
  });
}
function renderMemoryList() {
  memoryList.innerHTML = '';
  if (!knowledge.length) {
    const empty = document.createElement('div');
    empty.className = 'memory-item';
    empty.textContent = 'Még nincs mentett memória. Írd: „jegyezz meg, hogy ...”';
    memoryList.appendChild(empty);
    return;
  }
  knowledge.slice(-10).reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'memory-item';
    div.textContent = item;
    memoryList.appendChild(div);
  });
}
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });
  const labels = { learn: 'Tanulás', research: 'Kutatás', practice: 'Gyakorlás', creative: 'Kreatív' };
  modeLabel.textContent = labels[mode] || 'Tanulás';
}
function toggleTheme() {
  document.documentElement.classList.toggle('light');
  themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
}
function exportMemory() {
  const blob = new Blob([JSON.stringify(knowledge, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'vilmosgpt-memory.json'; a.click();
  URL.revokeObjectURL(url);
}
function importMemory(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (Array.isArray(parsed)) { knowledge = parsed; saveKnowledge(); renderMemoryList(); addMessage('A memória sikeresen betöltődött.', 'system'); }
    } catch { addMessage('A fájl nem volt olvasható.', 'system'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}
function detectLang(text) {
  var t = String(text || '').toLowerCase().trim();
  if (!t) return 'hu';
  if (/[áéíóöőúüű]/.test(t)) return 'hu';
  var huWords = ['mi','az','egy','hogy','nem','van','vagy','kell','lehet','miért','hogyan','mennyi','ki','hol','mikor','köszönöm','szia','igen','kérem','segíts','magyar'];
  var enWords = ['what','who','where','when','why','how','the','is','are','was','were','this','that','please','hello','thanks','thank','can','you','tell','me','about','define','meaning'];
  var words = t.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  var hu = 0, en = 0;
  words.forEach(function(w){
    if (huWords.indexOf(w) >= 0) hu++;
    if (enWords.indexOf(w) >= 0) en++;
  });
  if (en > hu && en >= 1) return 'en';
  if (en >= 1 && !/[áéíóöőúüű]/.test(t) && /^[a-z0-9\s?'".,!-]+$/i.test(t)) return 'en';
  return 'hu';
}
function ensureLang(reply, lang) {
  var r = String(reply || '').trim();
  if (!r) return lang === 'en' ? 'I could not find a good answer. Try rephrasing.' : 'Nem találtam jó választ. Próbáld másképp megfogalmazni.';
  return r;
}
function personalizeReply(reply, mode, lang) {
  lang = lang || 'hu';
  var base = String(reply || '').trim();
  if (!base) return lang === 'en' ? 'I will try to give the best answer I can.' : 'Próbálom megadni a lehető legjobb választ.';
  return ensureLang(base, lang);
}
function loadKnowledge() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
}
function saveKnowledge() { localStorage.setItem(storageKey, JSON.stringify(knowledge)); }

var userPinnedToBottom = true;
var SCROLL_BOTTOM_THRESHOLD = 80;
var lastFailedQuestion = '';
var typewriterToken = 0;

function isNearBottom(el) {
  if (!el) return true;
  var gap = el.scrollHeight - el.scrollTop - el.clientHeight;
  return gap <= SCROLL_BOTTOM_THRESHOLD;
}
function scrollToBottom(force) {
  var el = typeof chat !== 'undefined' ? chat : document.getElementById('chat');
  if (!el) return;
  if (!force && !userPinnedToBottom) return;
  requestAnimationFrame(function() {
    try {
      if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      else el.scrollTop = el.scrollHeight;
    } catch (e) { el.scrollTop = el.scrollHeight; }
    setTimeout(function() {
      if (force || userPinnedToBottom) { try { el.scrollTop = el.scrollHeight; } catch (e2) {} }
    }, 120);
  });
}
function bindChatScrollTracker() {
  var el = typeof chat !== 'undefined' ? chat : document.getElementById('chat');
  if (!el || el._vilmosScrollBound) return;
  el._vilmosScrollBound = true;
  el.addEventListener('scroll', function() { userPinnedToBottom = isNearBottom(el); }, { passive: true });
}
bindChatScrollTracker();

function isOnline() {
  try { if (typeof navigator !== 'undefined' && navigator.onLine === false) return false; } catch (e) {}
  return true;
}
function addErrorMessage(detailText, retryText) {
  var msg = document.createElement('div');
  msg.className = 'message error';
  msg.setAttribute('data-error', '1');
  var avatar = document.createElement('div');
  avatar.className = 'avatar error-avatar';
  avatar.textContent = '!';
  var bubble = document.createElement('div');
  bubble.className = 'bubble error-bubble';
  var main = 'Hoppá, a Vilmos GPT most nem tud válaszolni. Kérlek, ellenőrizd az internetkapcsolatot vagy próbáld újra később!';
  var extra = detailText ? ('<div class="error-detail">' + String(detailText).replace(/</g, '<') + '</div>') : '';
  var q = retryText || lastFailedQuestion || '';
  bubble.innerHTML =
    '<div class="error-row"><span class="error-icon" aria-hidden="true">⚠</span><div class="error-body">' +
    '<div class="error-title">Kapcsolati hiba</div><div class="error-text">' + main + '</div>' + extra +
    (q ? '<button type="button" class="error-retry-btn">Újrapróbálkozás</button>' : '') +
    '</div></div>';
  msg.appendChild(avatar); msg.appendChild(bubble); chat.appendChild(msg);
  var btn = bubble.querySelector('.error-retry-btn');
  if (btn && q) {
    btn.addEventListener('click', function() {
      try {
        var nodes = chat.querySelectorAll('[data-error="1"]');
        for (var i = 0; i < nodes.length; i++) if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      } catch (e) {}
      input.value = q; autoResizeInput(); sendMessage();
    });
  }
  scrollToBottom(true);
  return msg;
}
function typewriterEffect(bubble, fullText, opts) {
  opts = opts || {};
  var plain = String(fullText == null ? '' : fullText);
  var baseDelay = typeof opts.delay === 'number' ? opts.delay : 22;
  var token = ++typewriterToken;
  bubble.classList.add('markdown', 'typing-out');
  bubble.textContent = '';
  if (!plain) { bubble.classList.remove('typing-out'); return Promise.resolve(); }
  if (plain.length <= 4) {
    bubble.classList.remove('typing-out');
    bubble.innerHTML = renderMarkdown(plain);
    scrollToBottom(false);
    return Promise.resolve();
  }
  var chunks = plain.match(/\S+\s*|\s+/g) || [plain];
  var delay = baseDelay;
  if (plain.length > 600) delay = 10;
  else if (plain.length > 300) delay = 14;
  else if (plain.length > 120) delay = 18;
  var i = 0, acc = '';
  return new Promise(function(resolve) {
    function finish() {
      if (token !== typewriterToken) { resolve(); return; }
      bubble.classList.remove('typing-out');
      try { bubble.innerHTML = renderMarkdown(plain); } catch (e) { bubble.textContent = plain; }
      scrollToBottom(false); resolve();
    }
    function tick() {
      if (token !== typewriterToken) { resolve(); return; }
      if (i >= chunks.length) { finish(); return; }
      var step = plain.length > 800 ? 3 : (plain.length > 400 ? 2 : 1);
      var end = Math.min(i + step, chunks.length);
      while (i < end) acc += chunks[i++];
      bubble.textContent = acc;
      if (userPinnedToBottom) scrollToBottom(true);
      setTimeout(tick, delay);
    }
    tick();
  });
}
function renderMarkdown(text) {
  var raw = String(text == null ? '' : text);
  try {
    if (window.marked && typeof marked.parse === 'function') {
      if (marked.setOptions) marked.setOptions({ breaks: true, gfm: true });
      return marked.parse(raw);
    }
  } catch (e) {}
  return raw.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br>');
}
function addMessage(text, role) {
  role = role || 'bot';
  const msg = document.createElement('div');
  msg.className = 'message ' + role;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'Te' : role === 'system' ? '✓' : 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  var typePromise = Promise.resolve();
  if (role === 'user') bubble.textContent = text;
  else if (role === 'bot') { bubble.classList.add('markdown'); typePromise = typewriterEffect(bubble, text); }
  else { bubble.classList.add('markdown'); bubble.innerHTML = renderMarkdown(text); }
  if (role === 'user') { msg.appendChild(bubble); msg.appendChild(avatar); }
  else { msg.appendChild(avatar); msg.appendChild(bubble); }
  chat.appendChild(msg);
  if (role === 'user') { userPinnedToBottom = true; scrollToBottom(true); }
  else scrollToBottom(false);
  if (role === 'user' || role === 'bot') {
    conversationHistory.push({ role: role, text: String(text) });
    if (conversationHistory.length > 40) conversationHistory = conversationHistory.slice(-40);
  }
  return typePromise;
}
function addTypingMessage() {
  const msg = document.createElement('div');
  msg.className = 'message bot typing';
  msg.setAttribute('data-typing', '1');
  const avatar = document.createElement('div');
  avatar.className = 'avatar'; avatar.textContent = 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'bubble typing-bubble';
  var label = currentMode === 'research' ? 'Kutatás' : 'Gondolkodom';
  bubble.innerHTML = '<div class="typing-indicator" aria-label="' + label + '"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div><span class="typing-label">' + label + '…</span>';
  msg.appendChild(avatar); msg.appendChild(bubble); chat.appendChild(msg);
  scrollToBottom(true);
  return msg;
}
function removeLastMessageIfTyping() {
  try {
    var nodes = chat.querySelectorAll('.message.typing, [data-typing="1"]');
    for (var i = 0; i < nodes.length; i++) if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
  } catch (e) {
    var last = chat.lastElementChild;
    if (last && last.classList.contains('typing')) chat.removeChild(last);
  }
}
function rememberFact(text) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (!knowledge.includes(cleaned)) { knowledge.push(cleaned); saveKnowledge(); }
  return true;
}
function tryEvaluateMath(text) {
  var match = text.match(/-?\d+(?:\s*[-+*/^]\s*-?\d+)+/);
  if (!match) return null;
  try {
    var result = Function('"use strict"; return (' + match[0].replace(/\s+/g, '') + ')')();
    if (Number.isFinite(result)) return 'A számítás eredménye: ' + result;
  } catch (e) {}
  return null;
}
function isGreeting(text) {
  var lower = text.toLowerCase().trim();
  return /^(szia|hello|hey|hi|jó napot|sziasztok|üdv)\b/i.test(lower) || lower === 'szia' || lower === 'hello' || lower === 'hi';
}
function isAboutHistory(text) {
  var lower = text.toLowerCase();
  var patterns = ['előbb miről','miről beszéltünk','mit mondtál','mit kérdeztem','emlékszel','korábban','előző','összefoglal','miről volt szó','mit beszéltünk','what did we talk','summarize'];
  return patterns.some(function(p){ return lower.indexOf(p) >= 0; });
}
function summarizeConversation() {
  var real = conversationHistory.filter(function(m){ return m.role === 'user' || m.role === 'bot'; });
  if (real.length < 2) return 'Még alig beszéltünk. Kérdezz bármit.';
  var lines = [];
  real.slice(-8).forEach(function(m){
    var who = m.role === 'user' ? 'Te' : 'Én';
    var short = m.text.replace(/\s+/g, ' ').trim().slice(0, 120);
    lines.push('• ' + who + ': ' + short + (m.text.length > 120 ? '…' : ''));
  });
  return 'Erről beszéltünk:\n\n' + lines.join('\n');
}
function extractDefinitionKey(text) {
  var lower = text.toLowerCase().trim();
  var m = lower.match(/^(?:mi\s+az\s+a|mi\s+az|mi\s+a|mit\s+jelent\s+a|mit\s+jelent)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]+$/g, '').trim();
  m = lower.match(/^(?:mi\s+ez\s+a|mi\s+ez)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]+$/g, '').trim();
  m = lower.match(/^(?:what\s+is\s+(?:a|an|the)?|define|what\s+does)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]+$/g, '').trim();
  return null;
}
function localSmartAnswer(text, lang) {
  lang = lang || detectLang(text);
  var lower = text.toLowerCase().trim();
  if (lang === 'en') {
    if (/\b(what is your name|who are you)\b/.test(lower)) return 'My name is VilmosGPT. I am a personal learning AI.';
    if (/\bjoke\b/.test(lower)) return 'Why do computers never tell jokes? Because they always hit Enter too soon.';
    if (/\b(thank|thanks)\b/.test(lower)) return 'You are welcome! Ask me anything else.';
    if (/\b(help|help me)\b/.test(lower) || lower === 'help') return 'Of course! Tell me what you need help with.';
  }
  if (lower.indexOf('mi a neved') >= 0 || lower.indexOf('ki vagy') >= 0) return 'A nevem VilmosGPT. Egy személyes, tanuló AI vagyok.';
  if (lower.indexOf('vicc') >= 0) return 'Miért nem mondja a számítógép a viccet? Mert a billentyűzeten van egy kis „enter” problémája. 😄';
  if (lower.indexOf('köszönöm') >= 0 || lower.indexOf('koszonom') >= 0) return 'Szívesen! Ha van még kérdésed, csak írd meg.';
  var defKey = extractDefinitionKey(text);
  if (defKey) {
    var keys = Object.keys(simpleDefinitions);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (defKey === key || defKey.indexOf(key) >= 0 || key.indexOf(defKey) >= 0) return simpleDefinitions[key];
    }
  }
  var keys2 = Object.keys(simpleDefinitions);
  for (var j = 0; j < keys2.length; j++) {
    var k = keys2[j];
    if (lower === k || lower === 'mi az a ' + k || lower === 'mi a ' + k || lower === 'mi az ' + k) return simpleDefinitions[k];
  }
  if (lower.indexOf('cpu') >= 0 && lower.indexOf('ram') >= 0) return 'CPU = agy (számol). RAM = munkaasztal.';
  if (lower.indexOf('segíts') >= 0 || lower === 'help') return lang === 'en' ? 'Of course! Tell me what you need.' : 'Persze! Mondd el, miben segíthetek.';
  return null;
}
function shouldSearchWeb(text) {
  var lower = text.toLowerCase();
  if (!lower || lower.length < 3) return false;
  if (isGreeting(lower) || isAboutHistory(lower)) return false;
  if (lower.indexOf('mi a neved') >= 0 || lower.indexOf('vicc') >= 0 || lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('köszönöm') >= 0) return false;
  if (localSmartAnswer(text)) return false;
  return true;
}
function isBadWebText(s) {
  if (!s || s.length < 40) return true;
  var lower = s.toLowerCase();
  var bad = ['wikimédia','wikimedia','article wizard','szócikk','osztály rendszertan','médiaállomány','alternatively','page contents','cookie','sign in','markdown content','létrehozás'];
  for (var i = 0; i < bad.length; i++) if (lower.indexOf(bad[i]) >= 0) return true;
  return false;
}
async function fetchOneUrl(url, ms) {
  if (!isOnline()) { var err = new Error('offline'); err.code = 'OFFLINE'; throw err; }
  try {
    var c = new AbortController();
    var t = setTimeout(function(){ c.abort(); }, ms || 5000);
    var r = await fetch(url, { headers: { Accept: 'text/plain' }, signal: c.signal });
    clearTimeout(t);
    if (!r.ok) {
      if (r.status === 429 || r.status >= 500) { var e2 = new Error('http_' + r.status); e2.code = 'HTTP'; e2.status = r.status; throw e2; }
      return null;
    }
    return await r.text();
  } catch (e) {
    if (e && (e.code === 'OFFLINE' || e.code === 'HTTP')) throw e;
    if (e && e.name === 'AbortError') { var e3 = new Error('timeout'); e3.code = 'TIMEOUT'; throw e3; }
    if (!isOnline()) { var e4 = new Error('offline'); e4.code = 'OFFLINE'; throw e4; }
    return null;
  }
}
function parseExtract(raw) {
  var t = String(raw || '');
  var m = t.match(/"extract"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var ex = JSON.parse('"' + m[1] + '"');
      if (ex && ex.length > 40 && !isBadWebText(ex)) return ex.replace(/\s+/g, ' ').trim();
    } catch (e) {}
  }
  if (t.indexOf('Markdown Content:') >= 0) t = t.split('Markdown Content:').slice(1).join(' ');
  t = t.replace(/https?:\/\/\S+/gi, ' ').replace(/[#>*_`|\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  var parts = t.split(/(?<=[.!?])\s+/), out = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (p.length < 40 || isBadWebText(p)) continue;
    out.push(p);
    if (out.join(' ').length > 350) break;
  }
  return out.length ? out.join(' ') : '';
}
async function fetchWebAnswer(question, lang) {
  lang = lang || detectLang(question);
  var q = question.trim();
  var topic = q.replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a|ki az a|ki a|what is|what are|who is|define)\s+/i, '').replace(/[?.!]+$/g, '').trim() || q;
  var j = function(u){ return 'https://r.jina.ai/' + u; };
  var urls = lang === 'en' ? [
    j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
    j('https://en.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definition')),
    j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic))
  ] : [
    j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció magyarul')),
    j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic))
  ];
  var sawNetworkHardFail = null;
  for (var i = 0; i < urls.length; i++) {
    try {
      var raw = await fetchOneUrl(urls[i], 5000);
      if (!raw) continue;
      var extract = parseExtract(raw);
      if (extract && extract.length > 50) {
        var ans = extract.slice(0, 450);
        var d = Math.max(ans.lastIndexOf('.'), ans.lastIndexOf('!'), ans.lastIndexOf('?'));
        if (d > 60) ans = ans.slice(0, d + 1);
        return ans;
      }
    } catch (e) {
      if (e && e.code === 'OFFLINE') throw e;
      sawNetworkHardFail = e; continue;
    }
  }
  if (sawNetworkHardFail && !isOnline()) { var off = new Error('offline'); off.code = 'OFFLINE'; throw off; }
  return null;
}
function buildFriendlyReply(webText) {
  var raw = String(webText || '').trim();
  if (!raw || raw.length < 40 || isBadWebText(raw)) return null;
  var a = raw.slice(0, 450).trim();
  var lastDot = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('?'));
  if (lastDot > 60) a = a.slice(0, lastDot + 1);
  return a;
}
function fallbackAnswer(msg, lang) {
  lang = lang || detectLang(msg || '');
  if (lang === 'en') {
    if (currentMode === 'research') return 'I could not find a clear source for this. Please rephrase more specifically.';
    return 'I could not find a reliable answer. Try rephrasing your question.';
  }
  if (currentMode === 'research') return 'Erről most nem találtam elég tiszta forrást. Fogalmazd meg konkrétabban.';
  return 'Erről most nem találtam megbízható választ. Próbáld meg másképp megfogalmazni a kérdést.';
}
async function callBackendChat(message, lang) {
  var base = (typeof window !== 'undefined' && window.VILMOS_API_BASE) ? String(window.VILMOS_API_BASE).replace(/\/$/, '') : '';
  if (!base) return null;
  if (!isOnline()) { var err = new Error('offline'); err.code = 'OFFLINE'; throw err; }
  try {
    var hist = (typeof conversationHistory !== 'undefined' ? conversationHistory : []).slice(-10).map(function(m){
      return { role: m.role, text: String(m.text || '').slice(0, 800) };
    });
    var r = await fetch(base + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, lang: lang || 'hu', mode: typeof currentMode !== 'undefined' ? currentMode : 'learn', history: hist })
    });
    if (!r.ok) { var e2 = new Error('http_' + r.status); e2.code = 'HTTP'; e2.status = r.status; throw e2; }
    var data = await r.json();
    if (data && data.reply) return String(data.reply).trim();
  } catch (e) {
    if (e && (e.code === 'OFFLINE' || e.code === 'HTTP' || e.code === 'TIMEOUT')) throw e;
    if (!isOnline()) { var e3 = new Error('offline'); e3.code = 'OFFLINE'; throw e3; }
    console.warn('backend chat', e);
  }
  return null;
}
async function answerUser(text) {
  var msg = text.trim();
  var lower = msg.toLowerCase();
  var lang = detectLang(msg);
  if (!msg) return lang === 'en' ? 'Type something so I can answer.' : 'Írj valamit, hogy tudjak válaszolni.';
  if (isAboutHistory(msg)) return summarizeConversation();
  if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0 || /\b(remember that|remember this)\b/.test(lower)) {
    var fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg|remember that|remember this)[^\p{L}]*/iu, '').replace(/^hogy\s+/i, '').replace(/^that\s+/i, '').trim();
    if (fact) { rememberFact(fact); renderMemoryList(); return lang === 'en' ? ('Got it, I remembered: ' + fact) : ('Rendben, megjegyeztem: ' + fact); }
    return lang === 'en' ? 'Got it, remembered.' : 'Rendben, megjegyeztem.';
  }
  var known = knowledge.find(function(item){ return lower.indexOf(item.toLowerCase()) >= 0 && item.length > 3; });
  if (known) return (lang === 'en' ? 'From what I remember: ' : 'A korábbi emlékeim szerint: ') + known;
  var mathAnswer = tryEvaluateMath(msg);
  if (mathAnswer) return mathAnswer;
  if (isGreeting(msg)) return lang === 'en' ? 'Hi! Glad you are here. What would you like to ask?' : 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';
  var local = localSmartAnswer(msg, lang);
  if (local) return personalizeReply(local, currentMode, lang);
  var aiReply = await callBackendChat(msg, lang);
  if (aiReply) return personalizeReply(aiReply, currentMode, lang);
  if (shouldSearchWeb(msg)) {
    try {
      var webText = await fetchWebAnswer(msg, lang);
      var baseReply = buildFriendlyReply(webText);
      if (baseReply) return personalizeReply(baseReply, currentMode, lang);
    } catch (webErr) {
      if (webErr && (webErr.code === 'OFFLINE' || webErr.code === 'HTTP' || webErr.code === 'TIMEOUT')) throw webErr;
    }
  }
  return personalizeReply(fallbackAnswer(msg, lang), currentMode, lang);
}
async function sendMessage() {
  var text = input.value.trim();
  if (!text) return;
  lastFailedQuestion = text;
  userPinnedToBottom = true;
  hideEmptyState();
  addMessage(text, 'user');
  input.value = '';
  resetInputSize();
  try {
    var oldErr = chat.querySelectorAll('[data-error="1"]');
    for (var i = 0; i < oldErr.length; i++) if (oldErr[i].parentNode) oldErr[i].parentNode.removeChild(oldErr[i]);
  } catch (e) {}
  addTypingMessage();
  scrollToBottom(true);
  var reply = null, failed = false, failDetail = '';
  try {
    if (!isOnline()) { var off = new Error('offline'); off.code = 'OFFLINE'; throw off; }
    reply = await answerUser(text);
  } catch (err) {
    failed = true;
    console.warn('sendMessage', err);
    if (err && err.code === 'OFFLINE') failDetail = 'Nincs internetkapcsolat.';
    else if (err && err.code === 'TIMEOUT') failDetail = 'Időtúllépés — a szolgáltatás lassú vagy nem elérhető.';
    else if (err && err.code === 'HTTP') {
      if (err.status === 429) failDetail = 'Túl sok kérés (429). Várj egy kicsit, majd próbáld újra.';
      else if (err.status === 401 || err.status === 403) failDetail = 'Hitelesítési hiba (' + err.status + ').';
      else if (err.status >= 500) failDetail = 'A szerver átmenetileg hibás (' + err.status + ').';
      else failDetail = 'HTTP hiba: ' + (err.status || '?');
    } else failDetail = 'Váratlan hiba történt.';
  } finally { removeLastMessageIfTyping(); }
  if (failed) { addErrorMessage(failDetail, text); return; }
  lastFailedQuestion = '';
  await addMessage(reply || 'Nem kaptam választ. Próbáld újra.', 'bot');
  scrollToBottom(false);
}
function showPanel(panel) {
  sidebarLeft.classList.remove('visible');
  sidebarRight.classList.remove('visible');
  mainChat.style.display = '';
  document.querySelectorAll('.mobile-tabs button').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-panel') === panel);
  });
  if (panel === 'left') { sidebarLeft.classList.add('visible'); mainChat.style.display = 'none'; }
  else if (panel === 'right') { sidebarRight.classList.add('visible'); mainChat.style.display = 'none'; }
  else { try { input.focus(); } catch (e) {} }
}
document.querySelectorAll('.mode').forEach(function(button){
  button.addEventListener('click', function(){
    setMode(button.getAttribute('data-mode'));
    if (isMobileView()) showPanel('chat');
  });
});
document.querySelectorAll('.mobile-tabs button').forEach(function(btn){
  btn.addEventListener('click', function(){ showPanel(btn.getAttribute('data-panel')); });
});
themeToggle.addEventListener('click', toggleTheme);
exportMemoryBtn.addEventListener('click', exportMemory);
importMemoryInput.addEventListener('change', importMemory);
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('input', function(){ autoResizeInput(); });
input.addEventListener('keydown', function(event){
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
});
resetBtn.addEventListener('click', function(){
  knowledge = []; conversationHistory = []; saveKnowledge(); renderMemoryList();
  chat.innerHTML = '';
  showEmptyState();
});
renderPromptBank();
renderMentorTips();
renderMemoryList();
setMode(currentMode);
initEmptyState();
