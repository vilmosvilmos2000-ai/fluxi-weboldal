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
      'Írj egy rövid, szép esszét a napfény szerepéről.',
      'Segíts megérteni a különbséget a CPU és a RAM között.',
      'Mit jelent a „kritikus gondolkodás” röviden?',
      'Adj egy 5 pontos tanulási tervet a magyar nyelvhez.',
      'Magyarázd el, hogyan lehet gyorsan tanulni egy új témát.',
      'Mondd el a legfontosabb 3 szabályt a hatékony jegyzeteléshez.',
      'Adj öt kérdést, amivel gyakorolhatom a matematikát.',
      'Mit érdemes tenni, ha elfárad a figyelem?',
      'Javasolj egy jó kezdő programozási nyelvet.',
      'Írj egy rövid, motiváló üzenetet a tanuláshoz.',
      'Magyarázd el, miért fontos a rendszeres ismétlés.',
      'Hogyan lehet jobban koncentrálni 25 perc alatt?',
      'Mi a különbség a tudás és a tapasztalat között?',
      'Adj 10 hasznos tanulási tippet kezdőknek.',
      'Mi az a metakogníció? Magyarázd el egyszerűen.',
      'Segíts összeállítani egy 7 napos tanulási tervet.',
      'Milyen technikák segítik a hosszú távú emlékezést?',
      'Mit jelent a „gyakorlat tesz mestert”?',
      'Hogyan lehet egyszerűen megérteni a fizikát?',
      'Írj egy rövid történetet egy okos robotról.',
      'Mit érdemes csinálni, ha elakadok egy feladatnál?'
    ];

    const mentorTips = [
      'Kérdezz bátran, ha valami nem érthető: a jó kérdés gyakran jobb megoldáshoz vezet.',
      'A rövid, világos kérdések gyakran jobb válaszokat hoznak, mint a túl bonyolultak.',
      'A tanulás hatékonyabb, ha magyarázol, gyakorolsz és összefoglalod a lényeget.',
      'A memória erősödik, ha a tanult dolgokat rendszeresen visszahívod.',
      'Próbáld meg mindig megkérdezni: „Mi a legfontosabb ötlet ebben?”',
      'Ha nehéz egy témát megérteni, bontsd kisebb részekre.',
      'A hibákból tanulni ugyanúgy fontos, mint a sikerekből.',
      'Ha tanulsz, tarts kis szüneteket, hogy jobban feldolgozd az információt.'
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
      const isLight = document.documentElement.classList.contains('light');
      themeToggle.textContent = isLight ? '🌙' : '☀️';
    }

    function exportMemory() {
      const blob = new Blob([JSON.stringify(knowledge, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'vilmosgpt-memory.json';
      anchor.click();
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
      const suffix = modeHints[mode] || modeHints.learn;
      return `${base}\n\n${suffix}`;
    }

    function loadKnowledge() {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch {
        return [];
      }
    }

    function saveKnowledge() {
      localStorage.setItem(storageKey, JSON.stringify(knowledge));
    }

    function addMessage(text, role = 'bot') {
      const msg = document.createElement('div');
      msg.className = `message ${role}`;
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = role === 'user' ? 'Te' : role === 'system' ? '✓' : 'AI';
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = text;
      if (role === 'user') {
        msg.appendChild(bubble);
        msg.appendChild(avatar);
      } else {
        msg.appendChild(avatar);
        msg.appendChild(bubble);
      }
      chat.appendChild(msg);
      chat.scrollTop = chat.scrollHeight;
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
      if (last && last.classList.contains('typing')) {
        chat.removeChild(last);
      }
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
        .replace(/\u00a0/g, ' ')
        .trim();
    }

    function extractUsefulSentences(raw, maxLen = 420) {
      let t = sanitizeText(raw);
      t = t
        .replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const parts = t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      const good = [];
      for (const s of parts) {
        if (s.length < 35) continue;
        if (s.length > 220) continue;
        if (/^\W*$/.test(s)) continue;
        if ((s.match(/[a-záéíóöőúüű]/gi) || []).length < 20) continue;
        good.push(s);
        if (good.join(' ').length >= maxLen) break;
      }
      if (good.length) return good.join(' ').slice(0, maxLen);
      return t.slice(0, maxLen);
    }

    function tryEvaluateMath(text) {
      const match = text.match(/-?\d+(?:\s*[-+*/^]\s*-?\d+)+/);
      if (!match) return null;
      const expression = match[0].replace(/\s+/g, '');
      try {
        const result = Function(`"use strict"; return (${expression})`)();
        if (Number.isFinite(result)) {
          return `A számítás eredménye: ${result}`;
        }
      } catch {}
      return null;
    }

    function isGreeting(text) {
      const lower = text.toLowerCase();
      return /^(szia|hello|hey|jó napot|sziasztok|üdv)\b/i.test(lower.trim()) ||
        lower === 'szia' || lower === 'hello';
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

      if ((lower.includes('fizik') || lower.includes('fizika')) &&
          (lower.includes('megért') || lower.includes('tanul') || lower.includes('egyszerű') || lower.includes('hogyan'))) {
        return `A fizika akkor lesz egyszerű, ha nem memorizálsz, hanem megérted a „miért”-et.\n\n1. Kezdj a mindennapi példákkal (esés, súrlódás, fény, hang).\n2. Egy fogalmat egyszerre tanulj: pl. erő → gyorsulás → energia.\n3. Rajzolj: nyilak, diagramok sokat segítenek.\n4. Oldj meg kis példákat, ne csak olvasd a képletet.\n5. Magyarázd el hangosan, mintha egy barátodnak mondanád.\n\nTipp: a „F = m·a” nem csak képlet — azt mondja: minél nagyobb a tömeg, annál nehezebb felgyorsítani. Ha ezt érzékeled, már érted a lényeget.\n\nHa akarod, mondj egy konkrét témát (pl. mozgás, elektromosság, hullámok), és lépésről lépésre elmagyarázom.`;
      }

      if ((lower.includes('tanul') || lower.includes('tanulni') || lower.includes('megjegyez') || lower.includes('memoriz')) &&
          (lower.includes('hogyan') || lower.includes('tipp') || lower.includes('módszer') || lower.includes('hatékony') || lower.includes('gyorsan'))) {
        return `Hatékony tanulás – röviden:\n\n1. Aktív visszahívás: zárd be a jegyzetet, és próbáld felidézni.\n2. Rövid, ismétlődő blokkok (pl. 25 perc + 5 perc szünet).\n3. Magyarázd el másoknak (vagy magadnak hangosan).\n4. Kapcsold a tudást példákhoz, ne csak definíciókhoz.\n5. Aludj eleget — az ismétlés az alvás alatt is zajlik.\n\nA legfontosabb: kevesebb „újraolvasás”, több „kipróbálás”. Mit szeretnél tanulni pontosan?`;
      }

      if (lower.includes('cpu') && lower.includes('ram')) {
        return `A CPU az „agy”: számol, utasításokat hajt végre.\nA RAM a „munkaasztal”: azon tartja az éppen használt programokat és adatokat.\n\nHa kevés a RAM, a gép lassul (mert a merevlemezre kell mentenie).\nHa gyenge a CPU, a számolás maga lassú.\nEgyszerűen: CPU = gondolkodás, RAM = rövid távú memória.`;
      }

      if (lower.includes('metakogníció') || lower.includes('metakognicio')) {
        return `A metakogníció azt jelenti: gondolkodsz a saját gondolkodásodról.\nPl. „Értem ezt, vagy csak memorizáltam?” / „Melyik módszer működik nálam?”\nAki metakognitívan tanul, jobban irányítja a tanulását, és gyorsabban javít a hibáin.`;
      }

      if (lower.includes('kritikus gondolkod')) {
        return `A kritikus gondolkodás azt jelenti, hogy nem fogadod el azonnal az információt, hanem megvizsgálod:\n– Honnan jön?\n– Van-e bizonyíték?\n– Mi a másik oldal?\n– Logikus-e a következtetés?\nÍgy kevesebb hibát hiszel el, és jobb döntéseket hozol.`;
      }

      if (lower.includes('figyelem') && (lower.includes('elfárad') || lower.includes('fenntart') || lower.includes('koncentr'))) {
        return `Ha elfárad a figyelem:\n1. Tartsd be a 25+5 perc ritmust (Pomodoro).\n2. Kapcsold ki az értesítéseket.\n3. Mozogj 2–3 percet a szünetben.\n4. Egy feladatra fókuszálj, ne többre egyszerre.\n5. Ha unalmas a téma, kösd egy konkrét célhoz („miért kell ez nekem?”).`;
      }

      if (lower.includes('programoz') && (lower.includes('kezdő') || lower.includes('nyelv') || lower.includes('melyik'))) {
        return `Kezdőnek általában a Python a legjobb választás: olvasható, sok tutorial van, és gyorsan látsz eredményt.\nHa weboldalt akarsz csinálni, kezdheted HTML + CSS-sel, aztán JavaScripttel.\nA lényeg: ne csak nézd a kódot — írj minden nap egy kis programot.`;
      }

      if (lower.includes('segíts') || lower === 'help') {
        return 'Persze! Tudok magyarázni, példát adni, tanulási tervet javasolni, vagy emlékezni a fontos dolgokra. Mondd el, miben segíthetek.';
      }

      return null;
    }

    function shouldSearchWeb(text) {
      const lower = text.toLowerCase();
      if (!lower || lower.length < 8) return false;
      if (isGreeting(lower)) return false;
      if (lower.includes('mi a neved') || lower.includes('ki vagy')) return false;
      if (lower.includes('vicc') || lower.includes('nevetés')) return false;
      if (lower.includes('jegyezz meg') || lower.includes('tanulj meg') || lower.includes('emlékezz')) return false;
      if (lower.includes('köszönöm') || lower.includes('koszonom')) return false;
      if (localSmartAnswer(text)) return false;
      return true;
    }

    async function fetchWebAnswer(question) {
      const sources = [
        `https://r.jina.ai/http://https://duckduckgo.com/html/?q=${encodeURIComponent(question + ' magyarázat')}`,
        `https://r.jina.ai/http://https://www.bing.com/search?q=${encodeURIComponent(question)}`
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

    function buildFriendlyReply(question, webText) {
      const cleaned = extractUsefulSentences(webText || '', 450);
      if (cleaned && cleaned.length > 50) {
        return `${cleaned}\n\nHa szeretnéd, részletesebben is elmagyarázom, vagy példát adok.`;
      }
      return null;
    }

    function fallbackAnswer(msg) {
      if (currentMode === 'practice') {
        return `Érdekes kérdés: „${msg}”.\n\nGyakorlás módhoz: próbáld meg saját szavaiddal megfogalmazni, mit tudsz már erről. Aztán írd meg, és segítek pontosítani vagy példát adni.`;
      }
      if (currentMode === 'creative') {
        return `Erre többféleképpen is gondolhatunk. Mondj egy szempontot (pl. történet, lista, ötletbörze), és abba az irányba megyünk.`;
      }
      if (currentMode === 'research') {
        return `Erről most nem találtam elég tiszta forrást. Fogalmazd meg a kérdést egy kicsit konkrétabban (pl. „mi a különbség X és Y között?”), és újra megpróbálom.`;
      }
      return `Jó kérdés. Próbáljuk lépésről lépésre.\n\n1) Mondd el, mit értesz már belőle.\n2) Hol akadtál el?\n\nÍgy célzottan tudok segíteni — vagy írd át a kérdést egy konkrét példára.`;
    }

    async function answerUser(text) {
      const msg = text.trim();
      const lower = msg.toLowerCase();
      if (!msg) return 'Írj valamit, hogy tudjak válaszolni.';

      if (lower.includes('jegyezz meg') || lower.includes('tanulj meg') || lower.includes('emlékezz')) {
        const fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg)[^\p{L}]* /iu, '').replace(/^hogy\s+/i, '');
        if (fact) {
          rememberFact(fact);
          renderMemoryList();
          return `Rendben, megjegyeztem: ${fact}`;
        }
        return 'Rendben, megjegyeztem a megadott információt.';
      }

      const known = knowledge.find(item => lower.includes(item.toLowerCase()) && item.length > 3);
      if (known) return `A korábbi emlékeim szerint: ${known}`;

      const mathAnswer = tryEvaluateMath(msg);
      if (mathAnswer) return mathAnswer;

      if (isGreeting(msg)) {
        return 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';
      }

      const local = localSmartAnswer(msg);
      if (local) return personalizeReply(local, currentMode);

      if (shouldSearchWeb(msg)) {
        const webText = await fetchWebAnswer(msg);
        const baseReply = buildFriendlyReply(msg, webText);
        if (baseReply) return personalizeReply(baseReply, currentMode);
      }

      return personalizeReply(fallbackAnswer(msg), currentMode);
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';
      const typing = addTypingMessage();
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
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });

    resetBtn.addEventListener('click', () => {
      knowledge = [];
      saveKnowledge();
      renderMemoryList();
      chat.innerHTML = '';
      addMessage('A memória törölve lett. Kezdhetjük újra!', 'system');
    });

    renderPromptBank();
    renderMentorTips();
    renderMemoryList();
    setMode(currentMode);

    addMessage('Szia! Én vagyok a VilmosGPT. Beszélgessünk — megpróbálok a lehető legjobb válaszokat adni, akár az interneten is utánanézek.', 'bot');
    addMessage('Példák: „mi a neved?”, „mennyi 1+1?”, „mondj egy viccet”, vagy „jegyezz meg, hogy szeretek tanulni”.', 'system');
