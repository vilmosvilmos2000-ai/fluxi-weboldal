(function(){var s=document.createElement('script');s.src='logo-inject.js';document.head.appendChild(s);})();

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
let knowledge = [];
let currentMode = 'learn';
let conversationHistory = [];

const modeHints = {
  learn: 'Tanulás mód: világosan és lépésről lépésre magyarázok.',
  research: 'Kutatás mód: röviden, de pontosan összegzem a fontos információkat.',
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

const simpleDefinitions = {};

function loadKnowledge() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) knowledge = JSON.parse(raw) || [];
  } catch (e) { knowledge = []; }
}

function saveKnowledge() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(knowledge.slice(-50)));
  } catch (e) {}
}

function rememberFact(fact) {
  if (!fact || fact.length < 3) return;
  if (!knowledge.includes(fact)) {
    knowledge.push(fact);
    saveKnowledge();
  }
}

function renderMemoryList() {
  if (!memoryList) return;
  memoryList.innerHTML = '';
  if (!knowledge.length) {
    memoryList.innerHTML = '<li class="empty">Még nincs megjegyzett dolog.</li>';
    return;
  }
  knowledge.slice().reverse().forEach((item, idx) => {
    const li = document.createElement('li');
    li.textContent = item;
    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Törlés';
    del.onclick = () => {
      knowledge = knowledge.filter(k => k !== item);
      saveKnowledge();
      renderMemoryList();
    };
    li.appendChild(del);
    memoryList.appendChild(li);
  });
}

function exportMemory() {
  const blob = new Blob([JSON.stringify(knowledge, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vilmosgpt-memory.json';
  a.click();
}

function importMemory(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        knowledge = data;
        saveKnowledge();
        renderMemoryList();
        addMessage('Memória importálva: ' + data.length + ' elem.', 'system');
      }
    } catch (err) {
      addMessage('Nem sikerült az import.', 'system');
    }
  };
  reader.readAsText(file);
}

function setMode(mode) {
  currentMode = mode || 'learn';
  document.querySelectorAll('.mode').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === currentMode);
  });
  if (modeLabel) modeLabel.textContent = modeHints[currentMode] || '';
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  try { localStorage.setItem('vilmosgpt-theme', isDark ? 'dark' : 'light'); } catch (e) {}
}

function renderPromptBank() {
  if (!promptBank) return;
  promptBank.innerHTML = '';
  promptLibrary.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'prompt-chip';
    btn.textContent = p;
    btn.onclick = () => { input.value = p; input.focus(); };
    promptBank.appendChild(btn);
  });
}

function renderMentorTips() {
  if (!mentorList) return;
  mentorList.innerHTML = '';
  mentorTips.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    mentorList.appendChild(li);
  });
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role || 'bot');
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (role === 'user' || role === 'bot') {
    conversationHistory.push({ role, text });
    if (conversationHistory.length > 40) conversationHistory = conversationHistory.slice(-40);
  }
}

function addTypingMessage() {
  const div = document.createElement('div');
  div.className = 'msg bot typing';
  div.id = 'typing-indicator';
  div.textContent = 'Írok…';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function removeLastMessageIfTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

function sanitizeText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/www\.\S+/g, ' ')
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/[#*_`~>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGarbageSentence(s) {
  if (!s || s.length < 15) return true;
  const lower = s.toLowerCase();
  if (/cookie|privacy|sign in|log in|facebook|twitter|instagram|subscribe|newsletter|accept all|reject all/i.test(lower)) return true;
  if (/^\s*[\d\W]+\s*$/.test(s)) return true;
  if ((s.match(/[a-záéíóöőúüű]/gi) || []).length < 8) return true;
  return false;
}

function extractUsefulSentences(raw, maxLen = 400) {
  let t = sanitizeText(raw)
    .replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in|Facebook|Wikipédia|Wikipedia)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const good = [];
  for (const s of parts) {
    if (isGarbageSentence(s)) continue;
    good.push(s);
    if (good.join(' ').length >= maxLen) break;
  }
  if (good.length) return good.join(' ').slice(0, maxLen);

  const cleaned = t.slice(0, maxLen).trim();
  if (cleaned.length > 50 && !isGarbageSentence(cleaned)) return cleaned;
  return '';
}

function tryEvaluateMath(text) {
  const match = text.match(/-?\d+(?:\s*[-+*/^]\s*-?\d+)+/);
  if (!match) return null;
  try {
    const result = Function('"use strict"; return (' + match[0].replace(/\s+/g, '') + ')')();
    if (Number.isFinite(result)) return 'A számítás eredménye: ' + result;
  } catch {}
  return null;
}

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  return /^(szia|hello|hey|jó napot|sziasztok|üdv)\b/i.test(lower) || lower === 'szia' || lower === 'hello';
}

function isAboutHistory(text) {
  const lower = text.toLowerCase();
  const patterns = [
    'előbb miről', 'elobb mirol', 'miről beszéltünk', 'mirol beszeltunk',
    'mit mondtál', 'mit mondtal', 'mit kérdeztem', 'mit kerdeztem',
    'emlékszel', 'emlekszel', 'korábban', 'korabban',
    'előző', 'elozo', 'összefoglal', 'osszefoglal',
    'miről volt szó', 'mirol volt szo', 'folytassuk',
    'mit beszéltünk', 'mit beszeltunk', 'miről volt', 'mi volt a kérdés'
  ];
  return patterns.some(p => lower.includes(p));
}

function summarizeConversation() {
  const real = conversationHistory.filter(m => m.role === 'user' || m.role === 'bot');
  if (real.length < 2) return 'Még alig beszéltünk. Kérdezz bármit, és innen folytatjuk.';
  const lines = [];
  for (const m of real.slice(-8)) {
    const who = m.role === 'user' ? 'Te' : 'Én';
    const short = m.text.replace(/\s+/g, ' ').trim().slice(0, 120);
    lines.push('• ' + who + ': ' + short + (m.text.length > 120 ? '…' : ''));
  }
  return 'Erről beszéltünk mostanában:\n\n' + lines.join('\n') + '\n\nFolytathatjuk innen, vagy kérdezz valami újat.';
}

function getLastUserTopic() {
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const m = conversationHistory[i];
    if (m.role === 'user' && !isAboutHistory(m.text) && !isGreeting(m.text)) return m.text;
  }
  return null;
}

function shouldSearchWeb(text) {
  const lower = text.toLowerCase();
  if (isGreeting(text) || isAboutHistory(text)) return false;
  if (/\d+\s*[+\-*/^]\s*\d+/.test(text)) return false;
  if (lower.includes('jegyezz meg') || lower.includes('tanulj meg')) return false;
  const triggers = ['mi az', 'mi a', 'mit jelent', 'ki az', 'hol van', 'mikor', 'hogyan', 'miért', 'mi ez', 'definiáld', 'magyarázd', 'mesélj', 'tudsz', 'keress', 'nézz utána'];
  return triggers.some(t => lower.includes(t)) || text.length > 25;
}

async function fetchWebAnswer(question) {
  const q = question.trim();
  const topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  // 8 forrás (max 10) – párhuzamos lekérés, pontosabb válasz
  const sources = [
    'https://r.jina.ai/https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://en.wikipedia.org/wiki/' + encodeURIComponent(topic),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:hu.wikipedia.org'),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat'),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(q),
    'https://r.jina.ai/https://www.bing.com/search?q=' + encodeURIComponent(q + ' magyar'),
    'https://r.jina.ai/https://www.bing.com/search?q=' + encodeURIComponent(q),
    'https://r.jina.ai/https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció')
  ];

  const fetches = sources.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url, {
        headers: { Accept: 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) return null;
      const raw = await response.text();
      const marker = raw.includes('Markdown Content:') ? raw.split('Markdown Content:')[1] : raw;
      const useful = extractUsefulSentences(marker, 300);
      if (useful && useful.length > 50) return useful;
    } catch {}
    return null;
  });

  const settled = await Promise.allSettled(fetches);
  const results = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value) results.push(s.value);
  }
  if (!results.length) return null;

  // Több forrásból a legjobb, ismétlés nélküli részek összerakása
  const combined = [];
  const seen = new Set();
  for (const r of results) {
    const key = r.slice(0, 50).toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(r);
    if (combined.join(' ').length >= 520) break;
    if (combined.length >= 5) break;
  }
  return combined.join(' ').slice(0, 560);
}

function buildFriendlyReply(webText) {
  const cleaned = extractUsefulSentences(webText || '', 420);
  if (!cleaned || cleaned.length < 40) return null;
  return cleaned;
}

function localSmartAnswer(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('ki vagy') || lower.includes('mi a neved') || lower.includes('mi vagy te')) {
    return 'A nevem VilmosGPT. Egy személyes, tanuló AI vagyok: segítek magyarázni, gyakorolni, emlékezni, és ha kell, utánanézek dolgoknak.';
  }
  if (lower.includes('mit tudsz') || lower.includes('miben segítesz')) {
    return 'Tudok magyarázni, számolni, utánanézni az interneten, megjegyezni dolgokat, és segíteni a tanulásban. Kérdezz bátran!';
  }
  return null;
}

function personalizeReply(text, mode) {
  if (!text) return text;
  if (mode === 'practice') {
    return text + '\n\nGyakorlásként: próbáld meg saját szavaiddal elmondani, mit értettél belőle.';
  }
  if (mode === 'creative') {
    return text + '\n\nHa szeretnéd, tovább is tudom vinni kreatív irányba (példa, történet, lista).';
  }
  return text;
}

function fallbackAnswer(msg) {
  if (currentMode === 'practice') {
    return 'Ez egy jó gyakorló kérdés. Próbáld meg először saját magad megfogalmazni a választ, aztán segítek pontosítani.';
  }
  if (currentMode === 'creative') {
    return 'Erre többféleképpen is gondolhatunk. Mondj egy szempontot (történet, lista, ötletbörze), és abba az irányba megyünk.';
  }
  if (currentMode === 'research') {
    return 'Erről most nem találtam elég tiszta forrást. Fogalmazd meg konkrétabban a kérdést, és újra megpróbálom.';
  }
  return 'Jó kérdés. Próbáljuk lépésről lépésre.\n\n1) Mit értesz már belőle?\n2) Hol akadtál el?\n\nÍgy célzottan tudok segíteni.';
}

async function answerUser(text) {
  const msg = text.trim();
  const lower = msg.toLowerCase();
  if (!msg) return 'Írj valamit, hogy tudjak válaszolni.';

  if (isAboutHistory(msg)) return summarizeConversation();

  if (lower.includes('folytasd') || lower.includes('erről még') || lower === 'és?' || lower === 'tovább') {
    const last = getLastUserTopic();
    if (last) return 'Az előző témád ez volt: „' + last.slice(0, 100) + '”. Mondd el, mit szeretnél még erről, és rátérek.';
  }

  if (lower.includes('jegyezz meg') || lower.includes('tanulj meg') || lower.includes('emlékezz')) {
    const fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg)[^\p{L}]*/iu, '').replace(/^hogy\s+/i, '').trim();
    if (fact) {
      rememberFact(fact);
      renderMemoryList();
      return 'Rendben, megjegyeztem: ' + fact;
    }
    return 'Rendben, megjegyeztem a megadott információt.';
  }

  const known = knowledge.find(item => lower.includes(item.toLowerCase()) && item.length > 3);
  if (known) return 'A korábbi emlékeim szerint: ' + known;

  const mathAnswer = tryEvaluateMath(msg);
  if (mathAnswer) return mathAnswer;

  if (isGreeting(msg)) return 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';

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
  document.querySelectorAll('.mobile-tabs button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-panel') === panel);
  });
  if (panel === 'left') {
    sidebarLeft.classList.add('visible');
    mainChat.style.display = 'none';
  } else if (panel === 'right') {
    sidebarRight.classList.add('visible');
    mainChat.style.display = 'none';
  }
}

document.querySelectorAll('.mode').forEach(button => {
  button.addEventListener('click', () => setMode(button.getAttribute('data-mode')));
});
document.querySelectorAll('.mobile-tabs button').forEach(btn => {
  btn.addEventListener('click', () => showPanel(btn.getAttribute('data-panel')));
});
themeToggle.addEventListener('click', toggleTheme);
exportMemoryBtn.addEventListener('click', exportMemory);
importMemoryInput.addEventListener('change', importMemory);
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); sendMessage(); }
});
resetBtn.addEventListener('click', () => {
  knowledge = [];
  conversationHistory = [];
  saveKnowledge();
  renderMemoryList();
  chat.innerHTML = '';
  addMessage('A memória törölve lett. Kezdhetjük újra!', 'system');
});

loadKnowledge();
renderPromptBank();
renderMentorTips();
renderMemoryList();
setMode(currentMode);
try {
  if (localStorage.getItem('vilmosgpt-theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
} catch (e) {}
addMessage('Szia! Én vagyok a VilmosGPT. Beszélgessünk — emlékszem a beszélgetésünkre, és segítek, amiben tudok.', 'bot');
addMessage('Példák: „mennyi 1+1?”, „hogyan tanuljak fizikát?”, vagy „előbb miről beszéltünk?”.', 'system');
