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
function personalizeReply(reply, mode) {
  const base = String(reply || '').trim();
  if (!base) return 'Próbálom megadni a lehető legjobb választ.';
  return base;
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
  bubble.textContent = currentMode === 'research' ? 'Mély kutatás...' : 'Keresem...';
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
  if (m) return m[1].replace(/[?.!]+$/g, '').trim();
  m = lower.match(/^(?:mi\s+ez\s+a|mi\s+ez)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]+$/g, '').trim();
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
  if (lower.indexOf('cpu') >= 0 && lower.indexOf('ram') >= 0) return 'CPU = agy (számol). RAM = munkaasztal.';
  if (lower.indexOf('segíts') >= 0 || lower === 'help') return 'Persze! Mondd el, miben segíthetek.';
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
  try {
    var c = new AbortController();
    var t = setTimeout(function(){ c.abort(); }, ms || 5000);
    var r = await fetch(url, { headers: { Accept: 'text/plain' }, signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.text();
  } catch (e) { return null; }
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
  var parts = t.split(/(?<=[.!?])\s+/);
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (p.length < 40 || isBadWebText(p)) continue;
    out.push(p);
    if (out.join(' ').length > 350) break;
  }
  return out.length ? out.join(' ') : '';
}

async function fetchWebAnswer(question) {
  var q = question.trim();
  var topic = q.replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a|ki az a|ki a)\s+/i, '').replace(/[?.!]+$/g, '').trim() || q;
  var j = function(u){ return 'https://r.jina.ai/' + u; };
  var urls = [
    j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
    j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció'))
  ];
  for (var i = 0; i < urls.length; i++) {
    var raw = await fetchOneUrl(urls[i], 5000);
    if (!raw) continue;
    var extract = parseExtract(raw);
    if (extract && extract.length > 50) {
      var ans = extract.slice(0, 450);
      var d = Math.max(ans.lastIndexOf('.'), ans.lastIndexOf('!'), ans.lastIndexOf('?'));
      if (d > 60) ans = ans.slice(0, d + 1);
      return ans;
    }
  }
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
function fallbackAnswer(msg) {
  if (currentMode === 'research') return 'Erről most nem találtam elég tiszta forrást. Fogalmazd meg konkrétabban.';
  return 'Erről most nem találtam megbízható választ. Próbáld meg másképp megfogalmazni a kérdést.';
}
async function answerUser(text) {
  var msg = text.trim();
  var lower = msg.toLowerCase();
  if (!msg) return 'Írj valamit, hogy tudjak válaszolni.';
  if (isAboutHistory(msg)) return summarizeConversation();
  if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0) {
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
addMessage('Példák: „mi az a teknős?”, „mi az a csivava?”, „mennyi 1+1?”.', 'system');
