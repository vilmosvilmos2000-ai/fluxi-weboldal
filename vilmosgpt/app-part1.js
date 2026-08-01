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
  tv: 'A TV (televízió) egy elektronikus eszköz és médiaforma, amely mozgóképet és hangot továbbít. A tévékészüléken filmeket, sorozatokat, híreket és sportot nézhetsz. Manapság sok TV okostévé (pl. Android TV), internetes streaminggel is.',
  tévé: 'A TV (televízió) egy elektronikus eszköz és médiaforma, amely mozgóképet és hangot továbbít. A tévékészüléken filmeket, sorozatokat, híreket és sportot nézhetsz. Manapság sok TV okostévé (pl. Android TV), internetes streaminggel is.',
  televízió: 'A televízió (TV) kép- és hangátviteli rendszer, illetve a készülék, amin nézed. Adásokat sugároz (csatornák), vagy streamel (Netflix, YouTube). Az okostévék internetre csatlakoznak és alkalmazásokat futtatnak.',
  televizio: 'A televízió (TV) kép- és hangátviteli rendszer, illetve a készülék, amin nézed. Adásokat sugároz (csatornák), vagy streamel (Netflix, YouTube). Az okostévék internetre csatlakoznak és alkalmazásokat futtatnak.',
  vonat: 'A vonat egy vasúti jármű, amely általában egy mozdonyból és a hozzá kapcsolt kocsikból áll. Személyeket vagy árut szállít síneken.',
  autó: 'Az autó (személygépkocsi) egy kerekeken közlekedő, motorral hajtott jármű, amelyet általában 2–5 ember szállítására terveztek.',
  számítógép: 'A számítógép olyan elektronikus eszköz, amely adatokat dolgoz fel: programokat futtat, számol, tárol és kommunikál.',
  internet: 'Az internet a világ számítógépeinek és hálózatainak összekapcsolt rendszere.',
  ai: 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek képesek tanulni, felismerni mintákat, dönteni vagy emberihez hasonlóan válaszolni.',
  'mesterséges intelligencia': 'Az AI (mesterséges intelligencia) olyan számítógépes rendszerek gyűjtőneve, amelyek képesek tanulni, felismerni mintákat, dönteni vagy emberihez hasonlóan válaszolni.',
  robot: 'A robot olyan gép, amely programozható feladatok elvégzésére.',
  nap: 'A Nap a Naprendszer központi csillaga. Fényt és hőt ad a Földnek.',
  hold: 'A Hold a Föld természetes műholdja.',
  föld: 'A Föld a Naprendszer harmadik bolygója a Naptól.',
  víz: 'A víz (H₂O) a legfontosabb folyadék a Földön. Az élet alapja.',
  oxigén: 'Az oxigén egy kémiai elem (O). A levegő körülbelül 21%-át teszi ki.',
  gravitáció: 'A gravitáció az a vonzóerő, amellyel a testek egymást vonzzák.',
  energia: 'Az energia a munka végzésére való képesség.',
  atom: 'Az atom a kémiai elemek legkisebb részecskéje.',
  sejt: 'A sejt az élőlények alapvető építőegysége.',
  dna: 'A DNS az örökítőanyagot tároló molekula.',
  dns: 'A DNS az örökítőanyagot tároló molekula.',
  programozás: 'A programozás: utasításokat (kódot) írsz a számítógépnek.',
  algoritmus: 'Az algoritmus lépésről lépésre leírt megoldási módszer.',
  wifi: 'A Wi-Fi vezeték nélküli hálózati technológia.',
  bluetooth: 'A Bluetooth rövid hatótávolságú vezeték nélküli kapcsolat.',
  okostelefon: 'Az okostelefon olyan mobiltelefon, amely számítógépszerű funkciókat is tud.',
  google: 'A Google egy nagy tech cég, legismertebb a keresőmotorjáról.',
  youtube: 'A YouTube a világ legnagyobb videómegosztó oldala.',
  facebook: 'A Facebook (Meta) egy közösségi oldal.',
  instagram: 'Az Instagram fénykép- és videómegosztó alkalmazás.',
  tiktok: 'A TikTok rövid videók megosztására szolgáló alkalmazás.',
  minecraft: 'A Minecraft egy sandbox játék, ahol kockákból építhetsz világot.',
  roblox: 'A Roblox online játékplatform.',
  squishmallow: 'A Squishmallow puha plüssfigura márka.'
};
