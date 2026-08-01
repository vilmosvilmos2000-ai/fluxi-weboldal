/* Multi-source web search – SZIGORÚ tisztítás, releváns válasz */

function boostCleanText(text) {
  let t = String(text || '');
  if (t.includes('Markdown Content:')) t = t.split('Markdown Content:').slice(1).join(' ');
  t = t.replace(/^Title:[^\n]*\n?/gim, '');
  t = t.replace(/^URL Source:[^\n]*\n?/gim, '');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/https?:\/\/\S+/gi, ' ');
  t = t.replace(/www\.\S+/gi, ' ');
  t = t.replace(/\S*\.(org|com|hu|net|edu)\/\S*/gi, ' ');
  t = t.replace(/\d{4}-\d{2}-\d{2}T[\d:.Z+-]+/g, ' ');
  t = t.replace(/!Image\s*\d*/gi, ' ');
  // Wiki szekciószámok: "1 ", "8 ", "9 A", "10 0"
  t = t.replace(/(?:^|\s)\d{1,3}(?=\s+[A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű])/g, ' ');
  t = t.replace(/[#>*_`|~\[\]{}]/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}

function boostIsGarbage(s) {
  if (!s || s.length < 35) return true;
  if (s.length > 300) return true;
  const lower = s.toLowerCase();
  const bad = [
    'cookie', 'accept all', 'privacy', 'sign in', 'log in',
    'markdown content', 'skip to', 'page contents not supported',
    'color automatic', 'light dark', 'this page is always',
    'please search for', 'create an account', 'szócikk', 'vitalap',
    'létrehozás', 'eszközök', 'áthelyezés', 'oldalsávba', 'műveletek',
    'mi hivatkozik', 'színek béta', 'edit source', 'view history',
    'navigation menu', 'jump to', 'related searches', 'advertisement',
    'all rights reserved', 'feast of jordan', 'funeral feast',
    'orthodox christians', 'christmas–feast', 'descriptor is also used',
    'consumed by both', 'eves of christma', 'wiki/kutya',
    'disambiguation', 'may refer to', 'see also'
  ];
  if (bad.some(function(b){ return lower.indexOf(b) >= 0; })) return true;
  // Csak számok / töredék
  if (/^[\d\s.]+$/.test(s)) return true;
  if (/\b\d{1,2}\s+\d{1,2}\s*$/.test(s)) return true;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 7) return true;
  const letters = (s.match(/[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ]/g) || []).length;
  if (letters < 28) return true;
  return false;
}

function boostScoreSentence(s, topic) {
  if (boostIsGarbage(s)) return -1;
  var score = 0;
  var lower = s.toLowerCase();
  var t = (topic || '').toLowerCase();
  // Téma szó benne van
  if (t && lower.indexOf(t) >= 0) score += 5;
  // Magyar ékezet / tipikus szavak
  if (/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(s)) score += 3;
  if (/\b(egy|és|vagy|amely|amelyet|olyan|ez|az|van|volt|lehet)\b/i.test(s)) score += 2;
  // Definíció-szerű kezdet
  if (/^(a|az|egy)\s+/i.test(s.trim())) score += 2;
  // Angol túlsúly büntetés (ha van téma magyar)
  var enWords = (lower.match(/\b(the|and|is|are|of|to|for|with|that|this|from|by)\b/g) || []).length;
  if (enWords >= 4) score -= 4;
  // Hossz: közepes a legjobb
  if (s.length >= 60 && s.length <= 220) score += 2;
  return score;
}

function boostExtract(raw, maxLen, topic) {
  var t = boostCleanText(raw)
    .replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in|Facebook|Wikipédia|Wikipedia|Title|URL Source)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  var parts = t.split(/(?<=[.!?])\s+|\n+/).map(function(s){ return s.trim(); }).filter(Boolean);
  var scored = [];
  var seen = {};
  for (var i = 0; i < parts.length; i++) {
    var s = parts[i];
    // Vágd le a vezető számokat
    s = s.replace(/^\d{1,3}\s+/, '').trim();
    if (boostIsGarbage(s)) continue;
    var key = s.slice(0, 45).toLowerCase();
    if (seen[key]) continue;
    seen[key] = true;
    var sc = boostScoreSentence(s, topic);
    if (sc < 1) continue;
    scored.push({ s: s, sc: sc });
  }
  scored.sort(function(a, b){ return b.sc - a.sc; });

  var good = [];
  var total = 0;
  for (var j = 0; j < scored.length; j++) {
    good.push(scored[j].s);
    total += scored[j].s.length;
    if (total >= maxLen || good.length >= 3) break;
  }
  if (good.length) return good.join(' ').slice(0, maxLen).trim();
  return '';
}

const TOPIC_MAP = {
  'tv': 'Televízió', 'tévé': 'Televízió', 'teve': 'Televízió',
  'televizio': 'Televízió', 'televízió': 'Televízió',
  'kutya': 'Kutya', 'macska': 'Macska', 'ló': 'Ló',
  'pc': 'Személyi_számítógép', 'ai': 'Mesterséges_intelligencia',
  'wifi': 'Wi-Fi', 'cpu': 'Processzor', 'gpu': 'Grafikus_processzor',
  'ram': 'Memória_(számítástechnika)', 'python': 'Python_(programozási_nyelv)',
  'javascript': 'JavaScript', 'android': 'Android_(operációs_rendszer)',
  'internet': 'Internet', 'bitcoin': 'Bitcoin'
};

async function fetchWebAnswer(question) {
  var q = question.trim();
  var topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a|ki az a|ki a)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  var topicKey = topic.toLowerCase().replace(/\s+/g, ' ');
  var wikiTopic = TOPIC_MAP[topicKey] || topic.replace(/\s+/g, '_');

  var deep = (typeof currentMode !== 'undefined' && (currentMode === 'research' || currentMode === 'kutatás'));
  var j = function(url){ return 'https://r.jina.ai/' + url; };

  // Magyar wiki ELŐRE, angol csak állat/tech témánál dog stb.
  var baseSources = [
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció site:hu.wikipedia.org')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' jelentése magyarul')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat')),
    j('https://hu.wiktionary.org/wiki/' + encodeURIComponent(topic))
  ];

  // Angol wiki csak ha nem egyértelmű magyar szó / research
  if (deep || topicKey.length > 12) {
    baseSources.push(j('https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)));
    baseSources.push(j('https://simple.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)));
  }

  var researchSources = [
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:index.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:telex.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' magyarázat egyszerűen')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' magyar')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' összefoglaló'))
  ];

  var sources = deep ? baseSources.concat(researchSources) : baseSources;
  var timeoutMs = deep ? 7000 : 5000;
  var maxLen = deep ? 800 : 420;
  var perSourceLen = 240;

  var fetches = sources.map(async function(url) {
    try {
      var controller = new AbortController();
      var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);
      var response = await fetch(url, { headers: { Accept: 'text/plain' }, signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) return null;
      var raw = await response.text();
      var useful = boostExtract(raw, perSourceLen, topic);
      if (useful && useful.length > 55) return useful;
    } catch (e) {}
    return null;
  });

  var settled = await Promise.allSettled(fetches);
  var results = [];
  for (var i = 0; i < settled.length; i++) {
    if (settled[i].status === 'fulfilled' && settled[i].value) results.push(settled[i].value);
  }
  if (!results.length) return null;

  // Relevancia szerint újra pontoz
  var scored = results.map(function(r){
    return { r: r, sc: boostScoreSentence(r.slice(0, 120), topic) };
  }).filter(function(x){ return x.sc >= 1; });
  scored.sort(function(a,b){ return b.sc - a.sc; });

  var combined = [];
  var seen = {};
  var total = 0;
  for (var k = 0; k < scored.length; k++) {
    var r = scored[k].r;
    var key = r.slice(0, 50).toLowerCase().replace(/\s+/g, ' ');
    if (seen[key]) continue;
    seen[key] = true;
    combined.push(r);
    total += r.length;
    if (total >= maxLen || combined.length >= 3) break;
  }
  if (!combined.length) return null;

  var answer = combined.join(' ').replace(/\s{2,}/g, ' ').slice(0, maxLen).trim();
  var lastDot = Math.max(answer.lastIndexOf('.'), answer.lastIndexOf('!'), answer.lastIndexOf('?'));
  if (lastDot > 70) answer = answer.slice(0, lastDot + 1);

  // Végső szemétellenőrzés
  if (boostIsGarbage(answer.slice(0, 100))) return null;
  if (/feast of jordan|orthodox christians|funeral feast/i.test(answer)) return null;

  if (deep && results.length) {
    answer = answer + '\n\n(Összefoglalva ' + results.length + ' forrásból.)';
  }
  return answer;
}
