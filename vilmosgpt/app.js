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

const simpleDefinitions = {
  vonat: 'A vonat egy vasúti jármű, amely általában egy mozdonyból és a hozzá kapcsolt kocsikból áll. Személyeket vagy árut szállít síneken. Modern vonatok elektromos vagy dízel meghajtásúak, és a közlekedés egyik legfontosabb formája.',
  autó: 'Az autó (személygépkocsi) egy kerekeken közlekedő, motorral hajtott jármű, amelyet általában 2–5 ember szállítására terveztek. Közúton közlekedik, és a mindennapi közlekedés egyik leggyakoribb eszköze.',
  számítógép: 'A számítógép olyan elektronikus eszköz, amely adatokat dolgoz fel: programokat futtat, számol, tárol és kommunikál. Részei például a processzor (CPU), a memória (RAM) és a merevlemez.',
  internet: 'Az internet a világ számítógépeinek és hálózatainak összekapcsolt rendszere. Rajta keresztül böngészhetsz, üzeneteket küldhetsz, videót nézhetsz és rengeteg információhoz juthatsz.',
  ai: 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek képesek tanulni, felismerni mintákat, dönteni vagy emberihez hasonlóan válaszolni. Például a chatbotok is AI-t használnak.',
  'mesterséges intelligencia': 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek képesek tanulni, felismerni mintákat, dönteni vagy emberihez hasonlóan válaszolni. Például a chatbotok is AI-t használnak.',
  robot: 'A robot olyan gép, amely programozható feladatok elvégzésére. Lehet ipari (gyárban), háztartási (porszívó), vagy akár emberszerű humanoid is.',
  nap: 'A Nap a Naprendszer központi csillaga. Fényt és hőt ad a Földnek, és a földi élet energiaforrása. Körülötte keringenek a bolygók, köztük a Föld is.',
  hold: 'A Hold a Föld természetes műholdja. Körülöttünk kering, és hatással van a dagályra. Felszíne kráteres, és nincs légköre.',
  föld: 'A Föld a Naprendszer harmadik bolygója a Naptól. Ezen élünk: van légköre, óceánjai és szárazföldjei, és jelenleg az egyetlen ismert bolygó, ahol élet van.',
  víz: 'A víz (H₂O) a legfontosabb folyadék a Földön. Az élet alapja: az emberek, állatok és növények is függnek tőle. Folyékony, szilárd (jég) és gáz (gőz) állapotban is előfordul.',
  oxigén: 'Az oxigén egy kémiai elem (O). A levegő körülbelül 21%-át teszi ki, és az emberek, állatok légzéséhez elengedhetetlen.',
  gravitáció: 'A gravitáció az a vonzóerő, amellyel a testek egymást vonzzák. A Föld gravitációja tart a földön, és ez okozza, hogy a tárgyak leesnek.',
  energia: 'Az energia a munka végzésére való képesség. Formái: mozgási, hő, fény, elektromos, kémiai stb. Nem vész el, csak átalakul egyik formából a másikba.',
  atom: 'Az atom a kémiai elemek legkisebb részecskéje, amely még megtartja az elem tulajdonságait. Magja protonokból és neutronokból áll, körülötte elektronok keringenek.',
  sejt: 'A sejt az élőlények alapvető építőegysége. Minden élő szervezet sejtekből áll. Van sejtmagja, membránja, és benne zajlanak az életfolyamatok.',
  dna: 'A DNS (dezoxiribonukleinsav) az a molekula, amely az élőlények örökítőanyagát tárolja. Benne van a genetikai információ, ami meghatározza a tulajdonságainkat.',
  dns: 'A DNS (dezoxiribonukleinsav) az a molekula, amely az élőlények örökítőanyagát tárolja. Benne van a genetikai információ, ami meghatározza a tulajdonságainkat.',
  programozás: 'A programozás az a tevékenység, amikor utasításokat (kódot) írsz egy számítógépnek, hogy elvégezzen feladatokat. Nyelvek pl.: Python, JavaScript, Java.',
  algoritmus: 'Az algoritmus egy lépésről lépésre leírt megoldási módszer egy feladatra. A számítógépes programok algoritmusokra épülnek.',
  wifi: 'A Wi-Fi vezeték nélküli hálózati technológia, amellyel eszközök (telefon, laptop) csatlakozhatnak az internethez rádióhullámokon keresztül.',
  bluetooth: 'A Bluetooth rövid hatótávolságú vezeték nélküli kapcsolat eszközök között (pl. fülhallgató, egér, telefon).',
  okostelefon: 'Az okostelefon olyan mobiltelefon, amely számítógépszerű funkciókat is tud: alkalmazások, internet, kamera, GPS. Android vagy iOS rendszeren fut.',
  google: 'A Google egy nagy tech cég, legismertebb a keresőmotorjáról. Emellett van Gmail, YouTube, Maps, Android és sok más szolgáltatásuk is.',
  youtube: 'A YouTube a világ legnagyobb videómegosztó oldala. Videókat nézhetsz, tölthetsz fel, és csatornákat követhetsz.',
  facebook: 'A Facebook (Meta) egy közösségi oldal, ahol profilt készíthetsz, barátokkal kapcsolódhatsz, posztolhatsz és üzeneteket küldhetsz.',
  instagram: 'Az Instagram egy fénykép- és videómegosztó közösségi alkalmazás, ahol történeteket és posztokat oszthatsz meg.',
  tiktok: 'A TikTok rövid videók megosztására szolgáló közösségi alkalmazás. Zenés, táncos és humoros tartalmakról ismert.',
  minecraft: 'A Minecraft egy sandbox játék, ahol kockákból építhetsz világot, túlélhetsz, bányászhatsz és kreatívan alkothatsz. Egyjátékos és többjátékos módban is játszható.',
  roblox: 'A Roblox egy online platform, ahol játékokat játszhatsz és magad is készíthetsz. Sokféle felhasználók által készített játék van benne.',
  squishmallow: 'A Squishmallow puha, kitömött plüssfigura márka. Különböző állat- és karakterformákban kapható, gyűjtők körében népszerű.'
};

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
  if (base.length > 220) return base;
  return base + '\n\nHa szeretnéd, részletesebben is elmagyarázom, vagy példát adok.';
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
  bubble.textContent = 'Keresem több forrásban...';
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
  let t = String(text || '');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/https?:\/\/\S+/gi, ' ');
  t = t.replace(/www\.\S+/gi, ' ');
  t = t.replace(/\S+\.(com|hu|io|org|net|edu|me)\/\S*/gi, ' ');
  t = t.replace(/\d{4}-\d{2}-\d{2}T[\d:.Z+-]+/g, ' ');
  t = t.replace(/!Image\s*\d*/gi, ' ');
  t = t.replace(/\(\s*[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+\s+[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+\s*\)/g, ' ');
  t = t.replace(/\[\s*\]/g, ' ');
  t = t.replace(/[#!>*_`|~\[\](){}]/g, ' ');
  t = t.replace(/\s*[·•▪◦]+\s*/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}

function isGarbageSentence(s) {
  if (!s || s.length < 25) return true;
  if (s.length > 280) return true;
  const lower = s.toLowerCase();
  const bad = [
    'cookie', 'accept', 'privacy', 'sign in', 'log in', 'facebook',
    'markdown content', 'skip to', 'image', 'wikipédia', 'wikipedia',
    'felolvastatá', 'vezényszóra', 'beléjük lövet', 'vas gereben',
    'tolnai lajos', 'oszlop; kocsisor', 'állati vontatású'
  ];
  if (bad.some(b => lower.includes(b))) return true;
  if ((s.match(/[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ]/g) || []).length < 18) return true;
  if ((s.match(/[.!?]/g) || []).length > 4 && s.length < 100) return true;
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

function extractDefinitionKey(text) {
  const lower = text.toLowerCase().trim();
  let m = lower.match(/^(?:mi\s+az\s+a|mi\s+az|mi\s+a|mit\s+jelent\s+a|mit\s+jelent)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]/g, '').trim();
  m = lower.match(/^(?:mi\s+ez\s+a|mi\s+ez)\s+(.+?)\s*[?.!]*$/i);
  if (m) return m[1].replace(/[?.!]/g, '').trim();
  return null;
}

function localSmartAnswer(text) {
  const lower = text.toLowerCase().trim();

  if (lower.includes('mi a neved') || lower.includes('ki vagy')) {
    return 'A nevem VilmosGPT. Egy személyes, tanuló AI vagyok: segítek magyarázni, gyakorolni, emlékezni, és ha kell, utánanézek dolgoknak.';
  }
  if (lower.includes('vicc') || lower.includes('nevetés')) {
    return 'Persze! Miért nem mondja a számítógép a viccet? Mert a billentyűzeten van egy kis „enter” problémája. 😄';
  }
  if (lower.includes('köszönöm') || lower.includes('koszonom')) {
    return 'Szívesen! Ha van még kérdésed, csak írd meg.';
  }

  const defKey = extractDefinitionKey(text);
  if (defKey) {
    for (const [key, val] of Object.entries(simpleDefinitions)) {
      if (defKey === key || defKey.includes(key) || key.includes(defKey)) {
        return val;
      }
    }
  }
  for (const [key, val] of Object.entries(simpleDefinitions)) {
    if (lower === key || lower === 'mi az a ' + key || lower === 'mi a ' + key || lower === 'mi az ' + key) {
      return val;
    }
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
  if (!lower || lower.length < 3) return false;
  if (isGreeting(lower) || isAboutHistory(lower)) return false;
  if (lower.includes('mi a neved') || lower.includes('ki vagy')) return false;
  if (lower.includes('vicc') || lower.includes('jegyezz meg') || lower.includes('emlékezz')) return false;
  if (lower.includes('köszönöm') || lower.includes('folytasd')) return false;
  if (localSmartAnswer(text)) return false;
  return true;
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
  if (cleaned && cleaned.length > 45) {
    return cleaned;
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
