function renderPromptBank() {
  promptBank.innerHTML = '';
  promptLibrary.forEach(item => {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    const button = document.createElement('button');
    button.textContent = item;
    button.addEventListener('click', () => {
      input.value = item;
      input.focus();
      if (window.innerWidth <= 960) showPanel('chat');
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
function personalizeReply(reply, mode) {
  const base = String(reply || '').trim();
  if (!base) return 'Próbálom megadni a lehető legjobb választ.';
  if (base.length > 220) return base;
  return base + '\n\nHa szeretnéd, részletesebben is elmagyarázom.';
}
function loadKnowledge() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
}
function saveKnowledge() { localStorage.setItem(storageKey, JSON.stringify(knowledge)); }
function addMessage(text, role) {
  role = role || 'bot';
  const msg = document.createElement('div');
  msg.className = 'message ' + role;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'Te' : role === 'system' ? '✓' : 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  if (role === 'user') { msg.appendChild(bubble); msg.appendChild(avatar); }
  else { msg.appendChild(avatar); msg.appendChild(bubble); }
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  if (role === 'user' || role === 'bot') {
    conversationHistory.push({ role: role, text: String(text) });
    if (conversationHistory.length > 40) conversationHistory = conversationHistory.slice(-40);
  }
}
function addTypingMessage() {
  const msg = document.createElement('div');
  msg.className = 'message typing';
  const avatar = document.createElement('div');
  avatar.className = 'avatar'; avatar.textContent = 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = currentMode === 'research' ? 'Mély kutatás: 20+ forrást nézek át...' : 'Keresem több forrásban...';
  msg.appendChild(avatar); msg.appendChild(bubble);
  chat.appendChild(msg); chat.scrollTop = chat.scrollHeight;
  return msg;
}
function removeLastMessageIfTyping() {
  const last = chat.lastElementChild;
  if (last && last.classList.contains('typing')) chat.removeChild(last);
}
function rememberFact(text) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (!knowledge.includes(cleaned)) { knowledge.push(cleaned); saveKnowledge(); }
  return true;
}
function sanitizeText(text) {
  let t = String(text || '');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/https?:\/\/\S+/gi, ' ');
  t = t.replace(/www\.\S+/gi, ' ');
  t = t.replace(/\d{4}-\d{2}-\d{2}T[\d:.Z+-]+/g, ' ');
  t = t.replace(/!Image\s*\d*/gi, ' ');
  t = t.replace(/[#!>*_`|~\[\](){}]/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}
function isGarbageSentence(s) {
  if (!s || s.length < 30) return true;
  if (s.length > 320) return true;
  const lower = s.toLowerCase();
  const bad = ['cookie','accept','privacy','sign in','log in','markdown content','skip to','page contents not supported','color automatic','light dark','this page is always','please search for','create an account','szócikk','vitalap','létrehozás','eszközök','áthelyezés','oldalsávba','műveletek','mi hivatkozik','színek béta','edit source','view history','navigation menu','jump to','related searches','advertisement','all rights reserved'];
  if (bad.some(function(b){ return lower.indexOf(b) >= 0; })) return true;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 6) return true;
  if ((s.match(/[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ]/g) || []).length < 22) return true;
  return false;
}
function extractUsefulSentences(raw, maxLen) {
  maxLen = maxLen || 400;
  var t = sanitizeText(raw).replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in|Facebook|Wikipédia|Wikipedia)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  var parts = t.split(/(?<=[.!?])\s+/).map(function(s){ return s.trim(); }).filter(Boolean);
  var good = [];
  for (var i = 0; i < parts.length; i++) {
    if (isGarbageSentence(parts[i])) continue;
    good.push(parts[i]);
    if (good.join(' ').length >= maxLen) break;
  }
  if (good.length) return good.join(' ').slice(0, maxLen);
  var cleaned = t.slice(0, maxLen).trim();
  if (cleaned.length > 50 && !isGarbageSentence(cleaned)) return cleaned;
  return '';
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
  return /^(szia|hello|hey|jó napot|sziasztok|üdv)\b/i.test(lower) || lower === 'szia' || lower === 'hello';
}
function isAboutHistory(text) {
  var lower = text.toLowerCase();
  var patterns = ['előbb miről','miről beszéltünk','mit mondtál','mit kérdeztem','emlékszel','korábban','előző','összefoglal','miről volt szó','mit beszéltünk'];
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
function getLastUserTopic() {
  for (var i = conversationHistory.length - 1; i >= 0; i--) {
    var m = conversationHistory[i];
    if (m.role === 'user' && !isAboutHistory(m.text) && !isGreeting(m.text)) return m.text;
  }
  return null;
}
function extractDefinitionKey(text) {
  var lower = text.toLowerCase().trim();
  var m = lower.match(/^(?:mi\s+az\s+a|mi\s+az|mi\s+a|mit\s+jelent\s+a|mit\s+jelent)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]/g, '').trim();
  m = lower.match(/^(?:mi\s+ez\s+a|mi\s+ez)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]/g, '').trim();
  return null;
}
function localSmartAnswer(text) {
  var lower = text.toLowerCase().trim();
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
  if (lower.indexOf('cpu') >= 0 && lower.indexOf('ram') >= 0) return 'CPU = agy (számol). RAM = munkaasztal (éppen használt adatok).';
  if (lower.indexOf('metakogníció') >= 0 || lower.indexOf('metakognicio') >= 0) return 'A metakogníció: gondolkodsz a saját gondolkodásodról.';
  if (lower.indexOf('kritikus gondolkod') >= 0) return 'Kritikus gondolkodás: nem fogadod el azonnal az infót — megvizsgálod a forrást és a bizonyítékot.';
  if (lower.indexOf('programoz') >= 0 && (lower.indexOf('kezdő') >= 0 || lower.indexOf('nyelv') >= 0)) return 'Kezdőnek a Python a legjobb. Webhez: HTML + CSS, aztán JavaScript.';
  if (lower.indexOf('segíts') >= 0 || lower === 'help') return 'Persze! Tudok magyarázni, példát adni, vagy emlékezni. Mondd el, miben segíthetek.';
  return null;
}
function shouldSearchWeb(text) {
  var lower = text.toLowerCase();
  if (!lower || lower.length < 3) return false;
  if (isGreeting(lower) || isAboutHistory(lower)) return false;
  if (lower.indexOf('mi a neved') >= 0 || lower.indexOf('ki vagy') >= 0) return false;
  if (lower.indexOf('vicc') >= 0 || lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0) return false;
  if (lower.indexOf('köszönöm') >= 0 || lower.indexOf('folytasd') >= 0) return false;
  if (currentMode === 'research') {
    if (localSmartAnswer(text) && text.trim().length < 12) return false;
    return true;
  }
  if (localSmartAnswer(text)) return false;
  return true;
}
async function fetchWebAnswer(question) {
  var q = question.trim();
  var topic = q.replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a)\s+/i, '').replace(/[?.!]+$/g, '').trim() || q;
  var sources = [
    'https://r.jina.ai/https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://en.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q),
    'https://r.jina.ai/https://www.bing.com/search?q=' + encodeURIComponent(q)
  ];
  var fetches = sources.map(async function(url) {
    try {
      var controller = new AbortController();
      var timer = setTimeout(function(){ controller.abort(); }, 5500);
      var response = await fetch(url, { headers: { Accept: 'text/plain' }, signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) return null;
      var raw = await response.text();
      var marker = raw.indexOf('Markdown Content:') >= 0 ? raw.split('Markdown Content:')[1] : raw;
      var useful = extractUsefulSentences(marker, 280);
      if (useful && useful.length > 50) return useful;
    } catch (e) {}
    return null;
  });
  var settled = await Promise.allSettled(fetches);
  var results = [];
  settled.forEach(function(s){ if (s.status === 'fulfilled' && s.value) results.push(s.value); });
  if (!results.length) return null;
  var combined = []; var seen = {};
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var key = r.slice(0, 50).toLowerCase().replace(/\s+/g, ' ');
    if (seen[key]) continue; seen[key] = true; combined.push(r);
    if (combined.join(' ').length >= 500 || combined.length >= 4) break;
  }
  return combined.join(' ').slice(0, 520);
}
function buildFriendlyReply(webText) {
  var maxL = currentMode === 'research' ? 900 : 420;
  var raw = String(webText || '').trim();
  if (!raw || raw.length < 40) return null;
  var cleaned = extractUsefulSentences(raw, maxL);
  if (cleaned && cleaned.length > 50) return cleaned;
  var lower = raw.toLowerCase();
  var looksBad = ['szócikk','page contents','létrehozás','cookie','sign in','markdown'].some(function(b){ return lower.indexOf(b) >= 0; });
  if (!looksBad && raw.length > 60) {
    var a = raw.slice(0, maxL).trim();
    var lastDot = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('?'));
    if (lastDot > 60) a = a.slice(0, lastDot + 1);
    return a;
  }
  return null;
}
function fallbackAnswer(msg) {
  if (currentMode === 'practice') return 'Érdekes kérdés. Próbáld meg saját szavaiddal — aztán segítek.';
  if (currentMode === 'creative') return 'Erre többféleképpen is gondolhatunk. Mondj egy szempontot.';
  if (currentMode === 'research') return 'Erről most nem találtam elég tiszta forrást. Fogalmazd meg konkrétabban.';
  return 'Jó kérdés. Próbáljuk lépésről lépésre: mit értesz már belőle?';
}
async function answerUser(text) {
  var msg = text.trim();
  var lower = msg.toLowerCase();
  if (!msg) return 'Írj valamit, hogy tudjak válaszolni.';
  if (isAboutHistory(msg)) return summarizeConversation();
  if (lower.indexOf('folytasd') >= 0 || lower.indexOf('erről még') >= 0 || lower === 'és?' || lower === 'tovább') {
    var last = getLastUserTopic();
    if (last) return 'Az előző témád: „' + last.slice(0, 100) + '”. Mit szeretnél még erről?';
  }
  if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('tanulj meg') >= 0 || lower.indexOf('emlékezz') >= 0) {
    var fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg)[^\p{L}]*/iu, '').replace(/^hogy\s+/i, '').trim();
    if (fact) { rememberFact(fact); renderMemoryList(); return 'Rendben, megjegyeztem: ' + fact; }
    return 'Rendben, megjegyeztem.';
  }
  var known = knowledge.find(function(item){ return lower.indexOf(item.toLowerCase()) >= 0 && item.length > 3; });
  if (known) return 'A korábbi emlékeim szerint: ' + known;
  var mathAnswer = tryEvaluateMath(msg);
  if (mathAnswer) return mathAnswer;
  if (isGreeting(msg)) return 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';
  var local = localSmartAnswer(msg);
  if (local) return personalizeReply(local, currentMode);
  if (shouldSearchWeb(msg)) {
    var webText = await fetchWebAnswer(msg);
    var baseReply = buildFriendlyReply(webText);
    if (baseReply) return personalizeReply(baseReply, currentMode);
  }
  return personalizeReply(fallbackAnswer(msg), currentMode);
}
async function sendMessage() {
  var text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  addTypingMessage();
  var reply = await answerUser(text);
  removeLastMessageIfTyping();
  addMessage(reply, 'bot');
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
}
document.querySelectorAll('.mode').forEach(function(button){
  button.addEventListener('click', function(){ setMode(button.getAttribute('data-mode')); });
});
document.querySelectorAll('.mobile-tabs button').forEach(function(btn){
  btn.addEventListener('click', function(){ showPanel(btn.getAttribute('data-panel')); });
});
themeToggle.addEventListener('click', toggleTheme);
exportMemoryBtn.addEventListener('click', exportMemory);
importMemoryInput.addEventListener('change', importMemory);
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', function(event){
  if (event.key === 'Enter') { event.preventDefault(); sendMessage(); }
});
resetBtn.addEventListener('click', function(){
  knowledge = []; conversationHistory = []; saveKnowledge(); renderMemoryList();
  chat.innerHTML = '';
  addMessage('A memória törölve lett. Kezdhetjük újra!', 'system');
});
renderPromptBank();
renderMentorTips();
renderMemoryList();
setMode(currentMode);
addMessage('Szia! Én vagyok a VilmosGPT. Beszélgessünk — emlékszem a beszélgetésünkre, és segítek, amiben tudok.', 'bot');
addMessage('Példák: „mi az a TV?”, „mennyi 1+1?”, vagy „előbb miről beszéltünk?”.', 'system');
