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

// Load logic parts then multi-source search
(function(){
  var scripts = ['logic0.js', 'logic1.js', 'logic2.js', 'search-boost.js'];
  var i = 0;
  function next() {
    if (i >= scripts.length) return;
    var s = document.createElement('script');
    s.src = scripts[i++];
    s.onload = next;
    s.onerror = function(){ console.error('fail', scripts[i-1]); next(); };
    document.head.appendChild(s);
  }
  next();
})();
