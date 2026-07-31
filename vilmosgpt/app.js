/* === Logo + favicon inject === */
(function injectLogo() {
  try {
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = 'logo.svg';
      document.head.appendChild(link);
      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = 'logo.svg';
      document.head.appendChild(apple);
    }
    const left = document.querySelector('.header-left');
    if (left && !left.querySelector('.header-logo')) {
      const img = document.createElement('img');
      img.className = 'header-logo';
      img.src = 'logo.svg';
      img.alt = 'VilmosGPT';
      img.width = 40;
      img.height = 40;
      left.insertBefore(img, left.firstChild);
      if (!document.getElementById('header-logo-style')) {
        const st = document.createElement('style');
        st.id = 'header-logo-style';
        st.textContent = '.header-logo{width:40px;height:40px;border-radius:10px;object-fit:cover;image-rendering:pixelated;background:#8fd4e8;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2)}';
        document.head.appendChild(st);
      }
    }
  } catch (e) {}
})();

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
  a.href = url;
  a.download = 'vilmosgpt-memory.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importMemory(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (Array.isArray(parsed)) {
        knowledge = parsed;
        saveKnowledge();
        renderMemoryList();
        addMessage('A memória sikeresen betöltődött.', 'system');
      }
    } catch {
      addMessage('A fájl nem volt olvasható JSON formátumban.', 'system');
    }
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

function loadKnowledge() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
  catch { return []; }
}

function saveKnowledge() {
  localStorage.setItem(storageKey, JSON.stringify(knowledge));
}

function addMessage(text, role = 'bot') {
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
    conversationHistory.push({ role, text: String(text) });
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
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (!knowledge.includes(cleaned)) {
    knowledge.push(cleaned);
    saveKnowledge();
  }
  return true;
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/!Image\s*\d*/gi, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.\S+/gi, ' ')
    .replace(/\S+\.(com|hu|io|org|net|edu)\/\S*/gi, ' ')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUsefulSentences(raw, maxLen = 420) {
  let t = sanitizeText(raw)
    .replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in|Facebook)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const good = [];
  for (const s of parts) {
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

function localSmartAnswer(text) {
  const lower = text.toLowerCase();
  if (lower.includes('mi a neved') || lower.includes('ki vagy')) {
    return 'A nevem VilmosGPT. Egy személyes, tanuló AI vagyok: segítek magyarázni, gyakorolni, emlékezni, és ha kell, utánanézek dolgoknak.';
  }
  if (lower.includes('vicc') || lower.includes('nevetés')) {
    return 'Persze! Miért nem mondja a számítógép a viccet? Mert a billentyűzeten van egy kis „enter” problémája. 😄';
  }
  if (lower.includes('köszönöm') || lower.includes('koszonom')) {
    return 'Szívesen! Ha van még kérdésed, csak írd meg.';
  }
  if ((lower.includes('fizik')) && (lower.includes('megért') || lower.includes('tanul') || lower.includes('egyszerű') || lower.includes('hogyan'))) {
    return 'A fizika akkor lesz egyszerű, ha nem memorizálsz, hanem megérted a „miért”-et.\n\n1. Kezdj a mindennapi példákkal (esés, súrlódás, fény, hang).\n2. Egy fogalmat egyszerre tanulj: pl. erő → gyorsulás → energia.\n3. Rajzolj: nyilak, diagramok sokat segítenek.\n4. Oldj meg kis példákat, ne csak olvasd a képletet.\n5. Magyarázd el hangosan, mintha egy barátodnak mondanád.\n\nTipp: a „F = m·a” azt mondja: minél nagyobb a tömeg, annál nehezebb felgyorsítani.\n\nMondj egy konkrét témát, és lépésről lépésre elmagyarázom.';
  }
  if ((lower.includes('tanul') || lower.includes('megjegyez')) && (lower.includes('hogyan') || lower.includes('tipp') || lower.includes('hatékony') || lower.includes('gyorsan'))) {
    return 'Hatékony tanulás – röviden:\n\n1. Aktív visszahívás: zárd be a jegyzetet, és próbáld felidézni.\n2. Rövid blokkok (25 perc + 5 perc szünet).\n3. Magyarázd el hangosan.\n4. Kapcsold példákhoz.\n5. Aludj eleget.\n\nKevesebb újraolvasás, több kipróbálás. Mit szeretnél tanulni?';
  }
  if (lower.includes('cpu') && lower.includes('ram')) {
    return 'A CPU az „agy”: számol, utasításokat hajt végre.\nA RAM a „munkaasztal”: az éppen használt programok és adatok helye.\n\nKevés RAM → lassulás. Gyenge CPU → lassú számolás.\nEgyszerűen: CPU = gondolkodás, RAM = rövid távú memória.';
  }
  if (lower.includes('metakogníció') || lower.includes('metakognicio')) {
    return 'A metakogníció: gondolkodsz a saját gondolkodásodról.\nPl. „Értem ezt, vagy csak memorizáltam?”\nAki így tanul, jobban irányítja a tanulását.';
  }
  if (lower.includes('kritikus gondolkod')) {
    return 'A kritikus gondolkodás: nem fogadod el azonnal az információt, hanem megvizsgálod:\n– Honnan jön?\n– Van-e bizonyíték?\n– Mi a másik oldal?\n– Logikus-e a következtetés?';
  }
  if (lower.includes('figyelem') && (lower.includes('elfárad') || lower.includes('koncentr'))) {
    return 'Ha elfárad a figyelem:\n1. 25+5 perc ritmus (Pomodoro).\n2. Kapcsold ki az értesítéseket.\n3. Mozogj a szünetben.\n4. Egy feladatra fókuszálj.\n5. Kösd a témát egy konkrét célhoz.';
  }
  if (lower.includes('programoz') && (lower.includes('kezdő') || lower.includes('nyelv'))) {
    return 'Kezdőnek a Python a legjobb: olvasható, sok tutorial, gyors eredmény.\nWebhez: HTML + CSS, aztán JavaScript.\nÍrj minden nap egy kis programot.';
  }
  if (lower.includes('segíts') || lower === 'help') {
    return 'Persze! Tudok magyarázni, példát adni, tanulási tervet javasolni, vagy emlékezni a fontos dolgokra. Mondd el, miben segíthetek.';
  }
  return null;
}

function shouldSearchWeb(text) {
  const lower = text.toLowerCase();
  if (!lower || lower.length < 8) return false;
  if (isGreeting(lower) || isAboutHistory(lower)) return false;
  if (lower.includes('mi a neved') || lower.includes('ki vagy')) return false;
  if (lower.includes('vicc') || lower.includes('jegyezz meg') || lower.includes('emlékezz')) return false;
  if (lower.includes('köszönöm') || lower.includes('folytasd')) return false;
  if (localSmartAnswer(text)) return false;
  return true;
}

async function fetchWebAnswer(question) {
  const sources = [
    'https://r.jina.ai/http://https://duckduckgo.com/html/?q=' + encodeURIComponent(question + ' magyarázat'),
    'https://r.jina.ai/http://https://www.bing.com/search?q=' + encodeURIComponent(question)
  ];
  for (const url of sources) {
    try {
      const response = await fetch(url, { headers: { Accept: 'text/plain' } });
      if (!response.ok) continue;
      const raw = await response.text();
      const marker = raw.includes('Markdown Content:') ? raw.split('Markdown Content:')[1] : raw;
      const useful = extractUsefulSentences(marker, 450);
      if (useful && useful.length > 60) return useful;
    } catch {}
  }
  return null;
}

function buildFriendlyReply(webText) {
  const cleaned = extractUsefulSentences(webText || '', 450);
  if (cleaned && cleaned.length > 50) {
    return cleaned + '\n\nHa szeretnéd, részletesebben is elmagyarázom, vagy példát adok.';
  }
  return null;
}

function fallbackAnswer(msg) {
  if (currentMode === 'practice') {
    return 'Érdekes kérdés: „' + msg + '”.\n\nPróbáld meg saját szavaiddal megfogalmazni, mit tudsz már erről — aztán segítek pontosítani.';
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

renderPromptBank();
renderMentorTips();
renderMemoryList();
setMode(currentMode);
addMessage('Szia! Én vagyok a VilmosGPT. Beszélgessünk — emlékszem a beszélgetésünkre, és segítek, amiben tudok.', 'bot');
addMessage('Példák: „mennyi 1+1?”, „hogyan tanuljak fizikát?”, vagy „előbb miről beszéltünk?”.', 'system');
