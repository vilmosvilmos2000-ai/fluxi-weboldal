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

const AUTH_KEY = 'vilmosgpt-user-v1';
const MEMORY_PREFIX = 'vilmosgpt-memory-u:';
let knowledge = [];
let currentMode = 'learn';
let conversationHistory = [];

const modeHints = {
  learn: 'Tanulás mód: világosan és lépésről lépésre magyarázok.',
  research: 'Kutatás mód: röviden, de pontosan összegzem a fontos információkat.',
  practice: 'Gyakorlás mód: kérdéseket, feladatokat és példákat adok.',
  creative: 'Kreatív mód: ötleteket és új megközelítéseket kínálok.'
};

const promptLibrary = [
  'Magyarázd el egyszerűen, hogyan működik a természetes nyelvfeldolgozás.',
  'Mondd el, mi a különbség a tanulás és a memorizálás között.',
  'Segíts megérteni a különbséget a CPU és a RAM között.',
  'Magyarázd el, hogyan lehet gyorsan tanulni egy új témát.',
  'Hogyan lehet egyszerűen megérteni a fizikát?',
  'Adj 10 hasznos tanulási tippet kezdőknek.'
];

const mentorTips = [
  'Kérdezz bátran, ha valami nem érthető.',
  'A rövid, világos kérdések jobb válaszokat hoznak.',
  'A tanulás hatékonyabb, ha magyarázol és gyakorolsz.',
  'Ha nehéz egy téma, bontsd kisebb részekre.'
];

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}
function isLoggedIn() {
  const u = getCurrentUser();
  return !!(u && u.name);
}
function userStorageId() {
  const u = getCurrentUser();
  if (!u || !u.name) return null;
  if (u.email && String(u.email).includes('@')) return 'email:' + String(u.email).trim().toLowerCase();
  if (u.sub) return 'sub:' + String(u.sub);
  return 'local:' + String(u.name).trim().toLowerCase() + ':' + (u.provider || 'local');
}
function memoryKey() {
  const id = userStorageId();
  return id ? MEMORY_PREFIX + id : null;
}
function loadKnowledge() {
  const key = memoryKey();
  if (!key) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveKnowledge() {
  const key = memoryKey();
  if (!key) return false;
  localStorage.setItem(key, JSON.stringify(knowledge));
  return true;
}
function reloadUserKnowledge() {
  knowledge = loadKnowledge();
  renderMemoryList();
}

function renderPromptBank() {
  promptBank.innerHTML = '';
  promptLibrary.forEach(item => {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    const button = document.createElement('button');
    button.textContent = item;
    button.addEventListener('click', () => {
      input.value = item; input.focus();
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
  if (!isLoggedIn()) {
    const empty = document.createElement('div');
    empty.className = 'memory-item';
    empty.textContent = 'A mentett ismeretekhez jelentkezz be. Minden fióknak saját memóriája van.';
    memoryList.appendChild(empty);
    return;
  }
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
  if (!isLoggedIn()) { addMessage('A memória mentéséhez jelentkezz be.', 'system'); return; }
  const u = getCurrentUser();
  const payload = { version: 1, user: { email: u.email || '', name: u.name || '', id: userStorageId() }, knowledge, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vilmosgpt-memory-' + (u.email || u.name || 'user').replace(/[^\w.@-]+/g, '_') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importMemory(event) {
  if (!isLoggedIn()) { addMessage('A memória betöltéséhez jelentkezz be.', 'system'); event.target.value = ''; return; }
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      let list = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.knowledge) ? parsed.knowledge : null);
      if (!list) { addMessage('A fájl formátuma nem megfelelő.', 'system'); return; }
      const set = new Set(knowledge);
      list.forEach(item => { const s = String(item).trim(); if (s && !set.has(s)) { knowledge.push(s); set.add(s); } });
      saveKnowledge();
      renderMemoryList();
      addMessage('Memória betöltve a fiókodba (' + knowledge.length + ' tétel).', 'system');
    } catch { addMessage('A fájl nem volt olvasható.', 'system'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}
function personalizeReply(reply, mode) {
  const base = String(reply || '').trim();
  if (!base) return 'Próbálom megadni a lehető legjobb választ.';
  if (base.length > 180) return base;
  return base + '\n\n' + (modeHints[mode] || modeHints.learn);
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
  avatar.className = 'avatar';
  avatar.textContent = 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = 'Gondolkodom...';
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}
function removeLastMessageIfTyping() {
  const last = chat.lastElementChild;
  if (last && last.classList.contains('typing')) chat.removeChild(last);
}
function rememberFact(text) {
  if (!isLoggedIn()) return false;
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (!knowledge.includes(cleaned)) { knowledge.push(cleaned); saveKnowledge(); }
  return true;
}
function sanitizeText(text) {
  return String(text || '').replace(/!Image\s*\d*/gi, ' ').replace(/https?:\/\/\S+/gi, ' ').replace(/www\.\S+/gi, ' ').replace(/\d{4}-\d{2}-\d{2}T[\d:.]+/g, ' ').replace(/\[(.*?)\]\((.*?)\)/g, '$1').replace(/[#>*_`|]/g, ' ').replace(/\s+/g, ' ').trim();
}
function extractUsefulSentences(raw, maxLen) {
  maxLen = maxLen || 420;
  let t = sanitizeText(raw).replace(/\b(Image|Markdown Content|Cookie|Privacy|Sign in)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const parts = t.split(/(?<=[.!?])\s+/).map(function(s) { return s.trim(); }).filter(Boolean);
  const good = [];
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i];
    if (s.length < 35 || s.length > 220) continue;
    if ((s.match(/[a-záéíóöőúüű]/gi) || []).length < 20) continue;
    good.push(s);
    if (good.join(' ').length >= maxLen) break;
  }
  return good.length ? good.join(' ').slice(0, maxLen) : t.slice(0, maxLen);
}
function tryEvaluateMath(text) {
  const match = text.match(/-?\d+(?:\s*[-+*/^]\s*-?\d+)+/);
  if (!match) return null;
  try {
    const result = Function('"use strict"; return (' + match[0].replace(/\s+/g, '') + ')')();
    if (Number.isFinite(result)) return 'A számítás eredménye: ' + result;
  } catch (e) {}
  return null;
}
function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  return /^(szia|hello|hey|jó napot|sziasztok|üdv)\b/i.test(lower);
}
function isAboutHistory(text) {
  const lower = text.toLowerCase();
  return ['előbb miről', 'miről beszéltünk', 'mit mondtál', 'emlékszel', 'összefoglal', 'mit beszéltünk', 'miről volt'].some(function(p) { return lower.indexOf(p) !== -1; });
}
function summarizeConversation() {
  const real = conversationHistory.filter(function(m) { return m.role === 'user' || m.role === 'bot'; });
  if (real.length < 2) return 'Még alig beszéltünk. Kérdezz bármit.';
  const lines = real.slice(-8).map(function(m) {
    const who = m.role === 'user' ? 'Te' : 'Én';
    const short = m.text.replace(/\s+/g, ' ').trim().slice(0, 120);
    return '• ' + who + ': ' + short + (m.text.length > 120 ? '…' : '');
  });
  return 'Erről beszéltünk mostanában:\n\n' + lines.join('\n') + '\n\nFolytathatjuk innen.';
}
function localSmartAnswer(text) {
  const lower = text.toLowerCase();
  if (lower.indexOf('mi a neved') !== -1 || lower.indexOf('ki vagy') !== -1)
    return 'A nevem VilmosGPT. Személyes, tanuló AI vagyok.';
  if (lower.indexOf('vicc') !== -1)
    return 'Miért nem mondja a számítógép a viccet? Mert az „enter” problémája van. 😄';
  if (lower.indexOf('köszönöm') !== -1 || lower.indexOf('koszonom') !== -1)
    return 'Szívesen! Ha van még kérdésed, írd meg.';
  if (lower.indexOf('fizik') !== -1 && (lower.indexOf('tanul') !== -1 || lower.indexOf('hogyan') !== -1 || lower.indexOf('egyszerű') !== -1))
    return 'A fizika akkor egyszerű, ha a „miért”-et érted.\n1. Mindennapi példák\n2. Egy fogalom egyszerre\n3. Rajzolj\n4. Kis példák\n5. Magyarázd hangosan\n\nMondj egy konkrét témát!';
  if (lower.indexOf('cpu') !== -1 && lower.indexOf('ram') !== -1)
    return 'CPU = agy (számol). RAM = munkaasztal (éppen használt adatok).';
  if (lower.indexOf('segíts') !== -1) return 'Persze! Mondd el, miben segíthetek.';
  return null;
}
function shouldSearchWeb(text) {
  const lower = text.toLowerCase();
  if (!lower || lower.length < 8) return false;
  if (isGreeting(lower) || isAboutHistory(lower)) return false;
  if (lower.indexOf('jegyezz meg') !== -1 || lower.indexOf('emlékezz') !== -1) return false;
  if (localSmartAnswer(text)) return false;
  return true;
}
async function fetchWebAnswer(question) {
  const sources = [
    'https://r.jina.ai/http://https://duckduckgo.com/html/?q=' + encodeURIComponent(question + ' magyarázat'),
    'https://r.jina.ai/http://https://www.bing.com/search?q=' + encodeURIComponent(question)
  ];
  for (let i = 0; i < sources.length; i++) {
    try {
      const response = await fetch(sources[i], { headers: { Accept: 'text/plain' } });
      if (!response.ok) continue;
      const raw = await response.text();
      const marker = raw.indexOf('Markdown Content:') !== -1 ? raw.split('Markdown Content:')[1] : raw;
      const useful = extractUsefulSentences(marker, 450);
      if (useful && useful.length > 60) return useful;
    } catch (e) {}
  }
  return null;
}
function buildFriendlyReply(webText) {
  const cleaned = extractUsefulSentences(webText || '', 450);
  if (cleaned && cleaned.length > 50) return cleaned + '\n\nHa szeretnéd, részletesebben is elmagyarázom.';
  return null;
}
function fallbackAnswer(msg) {
  return 'Jó kérdés. Próbáljuk lépésről lépésre.\n1) Mit értesz már belőle?\n2) Hol akadtál el?';
}
async function answerUser(text) {
  const msg = text.trim();
  const lower = msg.toLowerCase();
  if (!msg) return 'Írj valamit, hogy tudjak válaszolni.';
  if (isAboutHistory(msg)) return summarizeConversation();
  if (lower.indexOf('jegyezz meg') !== -1 || lower.indexOf('tanulj meg') !== -1 || lower.indexOf('emlékezz') !== -1) {
    if (!isLoggedIn()) {
      return 'A „jegyezz meg” funkcióhoz be kell jelentkezned (jobb felső gomb). Így a jegyzeteid csak a te fiókodhoz tartoznak — más felhasználó nem látja őket.';
    }
    const fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg)[^\p{L}]*/iu, '').replace(/^hogy\s+/i, '').trim();
    if (fact) {
      rememberFact(fact);
      renderMemoryList();
      const u = getCurrentUser();
      return 'Rendben, megjegyeztem a fiókodhoz (' + (u.email || u.name) + '): ' + fact;
    }
    return 'Írd így: „jegyezz meg, hogy ...”';
  }
  if (isLoggedIn()) {
    const known = knowledge.find(function(item) { return lower.indexOf(item.toLowerCase()) !== -1 && item.length > 3; });
    if (known) return 'A te korábbi jegyzeteid szerint: ' + known;
  }
  const mathAnswer = tryEvaluateMath(msg);
  if (mathAnswer) return mathAnswer;
  if (isGreeting(msg)) return 'Szia! Mit szeretnél ma megkérdezni?';
  const local = localSmartAnswer(msg);
  if (local) return personalizeReply(local, currentMode);
  if (shouldSearchWeb(msg)) {
    const webText = await fetchWebAnswer(msg);
    const baseReply = buildFriendlyReply(webText);
    if (baseReply) return personalizeReply(baseReply, currentMode);
  }
  return personalizeReply(fallbackAnswer(msg), currentMode);
}
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  addTypingMessage();
  const reply = await answerUser(text);
  removeLastMessageIfTyping();
  addMessage(reply, 'bot');
}
function showPanel(panel) {
  sidebarLeft.classList.remove('visible');
  sidebarRight.classList.remove('visible');
  mainChat.style.display = '';
  document.querySelectorAll('.mobile-tabs button').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-panel') === panel);
  });
  if (panel === 'left') { sidebarLeft.classList.add('visible'); mainChat.style.display = 'none'; }
  else if (panel === 'right') { sidebarRight.classList.add('visible'); mainChat.style.display = 'none'; }
}
function onAuthChanged() { reloadUserKnowledge(); }

let _lastAuthId = userStorageId();
setInterval(function() {
  const now = userStorageId();
  if (now !== _lastAuthId) { _lastAuthId = now; onAuthChanged(); }
}, 500);
window.addEventListener('vilmosgpt-auth-changed', onAuthChanged);
window.addEventListener('storage', function(e) { if (e.key === AUTH_KEY) onAuthChanged(); });

document.querySelectorAll('.mode').forEach(function(button) {
  button.addEventListener('click', function() { setMode(button.getAttribute('data-mode')); });
});
document.querySelectorAll('.mobile-tabs button').forEach(function(btn) {
  btn.addEventListener('click', function() { showPanel(btn.getAttribute('data-panel')); });
});
themeToggle.addEventListener('click', toggleTheme);
exportMemoryBtn.addEventListener('click', exportMemory);
importMemoryInput.addEventListener('change', importMemory);
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') { event.preventDefault(); sendMessage(); }
});
resetBtn.addEventListener('click', function() {
  if (!isLoggedIn()) {
    conversationHistory = [];
    chat.innerHTML = '';
    addMessage('A chat törölve. A memóriához jelentkezz be.', 'system');
    return;
  }
  knowledge = [];
  conversationHistory = [];
  saveKnowledge();
  renderMemoryList();
  chat.innerHTML = '';
  addMessage('A te fiókod memóriája és a chat törölve lett.', 'system');
});

knowledge = loadKnowledge();
renderPromptBank();
renderMentorTips();
renderMemoryList();
setMode(currentMode);
addMessage('Szia! Én vagyok a VilmosGPT.', 'bot');
addMessage('A „jegyezz meg” csak bejelentkezés után működik, és minden fióknak külön memóriája van. Másik gépre: Mentés → Betöltés.', 'system');
