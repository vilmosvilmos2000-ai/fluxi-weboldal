(function(){var s=document.createElement('script');s.src='logo-inject.js?v=m3';document.head.appendChild(s);})();

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
  kutya: 'A kutya (Canis familiaris) az ember egyik legrégebbi háziállata. A farkas leszármazottja, hűséges társ, őrző, vadásztárs vagy munkakutya is lehet. Sok fajtája van (pl. labrador, német juhász, yorkshire).',
  macska: 'A macska (Felis catus) kis termetű háziállat. Önálló, ügyes vadász, sokan tartják társállatként. Éjszakai látása kiváló, és jellegzetesen dorombol.',
  teknős: 'A teknős (vagy teknősbéka) páncélos hüllő. A háta és hasa kemény teknővel védett. Van szárazföldi és vízi faja is; lassú mozgású, tojással szaporodik.',
  teknos: 'A teknős (vagy teknősbéka) páncélos hüllő. A háta és hasa kemény teknővel védett. Van szárazföldi és vízi faja is; lassú mozgású, tojással szaporodik.',
  teknősbéka: 'A teknősbéka páncélos hüllő. Kemény teknő védi a testét. Vannak szárazföldi és vízi teknősök.',
  kígyó: 'A kígyó lábatlan hüllő. Hosszú, hajlékony teste van. Van mérges és nem mérges faj is.',
  béka: 'A béka kétéltű: ebihal korában vízben él, felnőttként ugró lábakkal a szárazon is.',
  pók: 'A pók nyolclábú ízeltlábú. Hálót szőhet; nem rovar, hanem pókszabású.',
  méh: 'A méh rovar, nektárt gyűjt és mézet készít. Fontos beporzó.',
  hangya: 'A hangya kis rovar, államokban él.',
  delfin: 'A delfin okos vízi emlős. Úszik, hangokkal kommunikál.',
  cápa: 'A cápa porcos hal, ragadozó. Az óceánokban él.',
  medve: 'A medve nagy termetű emlős (pl. barna medve, jegesmedve).',
  farkas: 'A farkas vadon élő kutyaféle, a házi kutya őse. Falkában vadászik.',
  róka: 'A róka kisebb kutyaféle ragadozó, főleg éjjel aktív.',
  szarvas: 'A szarvas növényevő emlős; a bika agancsot visel.',
  zsiráf: 'A zsiráf a legmagasabb szárazföldi állat, hosszú nyakkal. Afrikában él.',
  majom: 'A majom főemlős: okos, gyakran fán él.',
  pingvin: 'A pingvin röpképtelen madár, ügyesen úszik.',
  papagáj: 'A papagáj színes madár, gyakran beszélni tanítható.',
  ló: 'A ló nagy testű háziállat: lovaglás, fuvar, sport.',
  madár: 'A madár gerinces, általában szárnnyal és tollal; tojással szaporodik.',
  hal: 'A hal vízben élő gerinces, kopoltyúval lélegzik.',
  egér: 'Az egér kis rágcsáló.',
  nyúl: 'A nyúl hosszú fülű, ugró állat.',
  tehén: 'A tehén a szarvasmarha nősténye; tejet ad.',
  disznó: 'A disznó (sertés) háziállat, főleg húsáért tartják.',
  birka: 'A birka (juh) háziállat, gyapjáért és húsáért tartják.',
  oroszlán: 'Az oroszlán nagy ragadozó macskaféle, a „vadak királya”.',
  tigris: 'A tigris a legnagyobb macskaféle, csíkos bundával.',
  elefánt: 'Az elefánt a legnagyobb szárazföldi emlős; ormánya és agyarai vannak.',
  tv: 'A TV (televízió) eszköz és média mozgóképhez és hanghoz: filmek, sorozatok, hírek.',
  tévé: 'A TV (televízió) eszköz és média mozgóképhez és hanghoz: filmek, sorozatok, hírek.',
  televízió: 'A televízió kép- és hangátviteli rendszer, illetve a készülék.',
  televizio: 'A televízió kép- és hangátviteli rendszer, illetve a készülék.',
  vonat: 'A vonat vasúti jármű: mozdony és kocsik a síneken.',
  autó: 'Az autó motorral hajtott, kerekes személygépkocsi.',
  busz: 'A busz (autóbusz) több utas szállítására való közúti jármű.',
  repülő: 'A repülőgép levegőben közlekedő jármű.',
  kerékpár: 'A kerékpár kétkerekű, emberi erővel hajtott jármű.',
  számítógép: 'A számítógép elektronikus eszköz: programok, számolás, tárolás.',
  laptop: 'A laptop hordozható számítógép.',
  telefon: 'A telefon kommunikációs eszköz; az okostelefon appokat is futtat.',
  internet: 'Az internet a világ hálózatainak összekapcsolt rendszere.',
  ai: 'Az AI (mesterséges intelligencia) tanuló, döntő, emberhez hasonlóan válaszoló rendszerek.',
  'mesterséges intelligencia': 'Az AI tanuló, döntő, emberhez hasonlóan válaszoló számítógépes rendszerek.',
  robot: 'A robot programozható gép.',
  nap: 'A Nap a Naprendszer központi csillaga.',
  hold: 'A Hold a Föld természetes műholdja.',
  föld: 'A Föld a Naprendszer harmadik bolygója, ahol élünk.',
  víz: 'A víz (H₂O) az élet alapja.',
  oxigén: 'Az oxigén a levegő kb. 21%-a; a légzéshez kell.',
  gravitáció: 'A gravitáció a testek közötti vonzóerő.',
  energia: 'Az energia a munka végzésére való képesség.',
  atom: 'Az atom a kémiai elemek legkisebb jellemző részecskéje.',
  sejt: 'A sejt az élőlények alapvető építőegysége.',
  dna: 'A DNS az örökítőanyagot tároló molekula.',
  dns: 'A DNS az örökítőanyagot tároló molekula.',
  programozás: 'A programozás: kóddal utasítod a számítógépet.',
  algoritmus: 'Az algoritmus lépésről lépésre leírt megoldási módszer.',
  wifi: 'A Wi-Fi vezeték nélküli internetkapcsolat.',
  bluetooth: 'A Bluetooth rövid távú vezeték nélküli kapcsolat.',
  okostelefon: 'Az okostelefon modern mobiltelefon appokkal és internettel.',
  google: 'A Google tech cég; legismertebb a keresője.',
  youtube: 'A YouTube a legnagyobb videómegosztó oldal.',
  facebook: 'A Facebook közösségi oldal.',
  instagram: 'Az Instagram fénykép- és videómegosztó app.',
  tiktok: 'A TikTok rövid videós app.',
  minecraft: 'A Minecraft sandbox játék: építés, túlélés, bányászat.',
  roblox: 'A Roblox online játékplatform.',
  squishmallow: 'A Squishmallow puha plüssfigura márka.'
};
