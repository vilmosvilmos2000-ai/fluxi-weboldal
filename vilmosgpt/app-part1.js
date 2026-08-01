(function(){var s=document.createElement('script');s.src='logo-inject.js?v=m2';document.head.appendChild(s);})();

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
  ló: 'A ló nagy testű háziállat, amelyet lovaglásra, fuvarozásra és sportban használnak. Gyors, erős, és több ezer éve él együtt az emberrel.',
  madár: 'A madár olyan gerinces állat, amelynek általában szárnya és tolla van, tojással szaporodik. Sok faj tud repülni.',
  hal: 'A hal vízben élő gerinces állat, kopoltyúval lélegzik. Sok fajtája van, egy részüket az ember élelemként fogyasztja.',
  egér: 'Az egér kis rágcsáló. Van vadon élő és házi változata; laboratóriumokban is gyakran használják.',
  nyúl: 'A nyúl hosszú fülű, ugró rágcsálóféléhez hasonló állat. Háziállatként és vadon is előfordul.',
  tehén: 'A tehén a szarvasmarha nősténye. Tejet ad, és a mezőgazdaság fontos állata.',
  disznó: 'A disznó (sertés) háziállat, amelyet főleg húsáért tartanak.',
  birka: 'A birka (juh) háziállat, gyapjáért és húsáért tartják.',
  oroszlán: 'Az oroszlán nagy termetű ragadozó macskaféle, a „vadak királya”. Főleg Afrikában él falkában.',
  tigris: 'A tigris a legnagyobb macskaféle, csíkos bundájú ragadozó. Ázsiában él.',
  elefánt: 'Az elefánt a legnagyobb szárazföldi emlős. Ormánya és agyarai vannak, nagyon intelligens.',
  tv: 'A TV (televízió) olyan eszköz és média, amellyel mozgóképet és hangot nézhetsz: filmeket, sorozatokat, híreket, sportot. Ma sok TV okostévé, internetes streaminggel.',
  tévé: 'A TV (televízió) olyan eszköz és média, amellyel mozgóképet és hangot nézhetsz: filmeket, sorozatokat, híreket, sportot. Ma sok TV okostévé, internetes streaminggel.',
  televízió: 'A televízió (TV) kép- és hangátviteli rendszer, illetve a készülék. Csatornákat vagy streamet (Netflix, YouTube) nézhetsz rajta.',
  televizio: 'A televízió (TV) kép- és hangátviteli rendszer, illetve a készülék. Csatornákat vagy streamet (Netflix, YouTube) nézhetsz rajta.',
  vonat: 'A vonat vasúti jármű: mozdony és kocsik. Síneken szállít embereket vagy árut.',
  autó: 'Az autó (személygépkocsi) motorral hajtott, kerekes jármű, általában 2–5 ember szállítására.',
  busz: 'A busz (autóbusz) nagyobb, több utas szállítására való közúti jármű.',
  repülő: 'A repülőgép levegőben közlekedő jármű, amellyel gyorsan lehet nagy távolságot megtenni.',
  kerékpár: 'A kerékpár (bicikli) kétkerekű, emberi erővel hajtott jármű.',
  számítógép: 'A számítógép elektronikus eszköz: programokat futtat, számol, tárol és kommunikál. Részei pl. processzor, memória, tárhely.',
  laptop: 'A laptop hordozható számítógép, beépített képernyővel és billentyűzettel.',
  telefon: 'A telefon hang- (és ma már adat-) kommunikációra szolgáló eszköz. Az okostelefon számítógépszerű funkciókat is tud.',
  internet: 'Az internet a világ hálózatainak összekapcsolt rendszere. Böngészés, üzenet, videó, információ mind ezen keresztül megy.',
  ai: 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek tanulnak, mintákat ismernek fel, döntenek vagy emberhez hasonlóan válaszolnak.',
  'mesterséges intelligencia': 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek tanulnak, mintákat ismernek fel, döntenek vagy emberhez hasonlóan válaszolnak.',
  robot: 'A robot programozható gép: ipari, háztartási vagy emberszerű is lehet.',
  nap: 'A Nap a Naprendszer központi csillaga. Fényt és hőt ad a Földnek.',
  hold: 'A Hold a Föld természetes műholdja. Kráteres a felszíne, nincs légköre.',
  föld: 'A Föld a Naprendszer harmadik bolygója. Van légköre, óceánja, szárazföldje – jelenleg az egyetlen ismert élő bolygó.',
  víz: 'A víz (H₂O) az élet alapja. Folyékony, jég és gőz formában is előfordul.',
  oxigén: 'Az oxigén (O) a levegő kb. 21%-a. A légzéshez elengedhetetlen.',
  gravitáció: 'A gravitáció a testek közötti vonzóerő. A Föld gravitációja tart a földön.',
  energia: 'Az energia a munka végzésére való képesség. Formái: mozgási, hő, fény, elektromos, kémiai…',
  atom: 'Az atom a kémiai elemek legkisebb, még jellemző tulajdonságú részecskéje.',
  sejt: 'A sejt az élőlények alapvető építőegysége.',
  dna: 'A DNS az örökítőanyagot tároló molekula.',
  dns: 'A DNS az örökítőanyagot tároló molekula.',
  programozás: 'A programozás: kóddal utasításokat adsz a számítógépnek.',
  algoritmus: 'Az algoritmus lépésről lépésre leírt megoldási módszer egy feladatra.',
  wifi: 'A Wi-Fi vezeték nélküli hálózat: telefon, laptop így csatlakozik az internethez.',
  bluetooth: 'A Bluetooth rövid távú vezeték nélküli kapcsolat (pl. fülhallgató, egér).',
  okostelefon: 'Az okostelefon modern mobiltelefon: appok, internet, kamera, GPS.',
  google: 'A Google tech cég; legismertebb a keresője. Van Gmail, YouTube, Maps, Android is.',
  youtube: 'A YouTube a legnagyobb videómegosztó oldal.',
  facebook: 'A Facebook (Meta) közösségi oldal: profil, posztok, üzenetek.',
  instagram: 'Az Instagram fénykép- és videómegosztó app.',
  tiktok: 'A TikTok rövid videós közösségi app.',
  minecraft: 'A Minecraft sandbox játék: kockákból építesz, túlélsz, bányászol.',
  roblox: 'A Roblox online platform, ahol játékokat játszhatsz és készíthetsz.',
  squishmallow: 'A Squishmallow puha plüssfigura márka.'
};
