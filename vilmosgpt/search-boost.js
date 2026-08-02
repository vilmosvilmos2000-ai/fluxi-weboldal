/* Web search: Wikipedia REST summary = tiszta szöveg + nyelv */

function boostIsGarbage(s, preferHu) {
  if (!s || s.length < 40) return true;
  var lower = s.toLowerCase();
  var bad = [
    'cookie', 'sign in', 'log in', 'markdown content', 'skip to',
    'page contents not supported', 'wikimédia commons', 'wikimedia commons',
    'article wizard', 'submit a draft', 'request a new article',
    'search for', 'look for pages', 'other reasons this message',
    'szócikk', 'vitalap', 'létrehozás', 'eszközök', 'áthelyezés',
    'osztály rendszertan', 'rend rendszertan', 'médiaállomány',
    'alternatively, you can', 'disambiguation', 'may refer to',
    'edit source', 'view history', 'navigation menu',
    'feast of jordan', 'funeral feast', 'create an account'
  ];
  for (var i = 0; i < bad.length; i++) {
    if (lower.indexOf(bad[i]) >= 0) return true;
  }
  if (preferHu !== false) {
    var en = (lower.match(/\b(the|and|is|are|of|to|for|with|that|this|you|can|use)\b/g) || []).length;
    if (en >= 6) return true;
  }
  return false;
}

function boostClean(s) {
  var t = String(s || '');
  t = t.replace(/https?:\/\/\S+/gi, ' ');
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

function parseWikiSummary(raw) {
  var t = String(raw || '');
  var m = t.match(/"extract"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var extracted = JSON.parse('"' + m[1] + '"');
      if (extracted && extracted.length > 40) return boostClean(extracted);
    } catch (e) {}
  }
  m = t.match(/"description"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var d = JSON.parse('"' + m[1] + '"');
      if (d && d.length > 20 && !boostIsGarbage(d, true)) return boostClean(d);
    } catch (e2) {}
  }
  if (t.indexOf('Markdown Content:') >= 0) t = t.split('Markdown Content:').slice(1).join(' ');
  t = boostClean(t.replace(/[#>*_`|\[\]{}]/g, ' '));
  var parts = t.split(/(?<=[.!?])\s+/);
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (p.length < 40 || boostIsGarbage(p, true)) continue;
    out.push(p);
    if (out.join(' ').length > 350) break;
  }
  return out.length ? out.join(' ') : '';
}

const TOPIC_MAP = {
  'tv': 'Televízió', 'tévé': 'Televízió', 'teve': 'Televízió',
  'kutya': 'Kutya', 'macska': 'Macska', 'teknős': 'Teknős',
  'teknos': 'Teknős', 'ló': 'Ló', 'madár': 'Madarak',
  'internet': 'Internet', 'ai': 'Mesterséges_intelligencia',
  'wifi': 'Wi-Fi', 'python': 'Python_(programozási_nyelv)'
};

async function fetchOne(url, timeoutMs) {
  try {
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, timeoutMs || 5000);
    var response = await fetch(url, { headers: { Accept: 'text/plain' }, signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return null;
    return await response.text();
  } catch (e) {
    return null;
  }
}

async function fetchWebAnswer(question, lang) {
  lang = lang || (typeof detectLang === 'function' ? detectLang(question) : 'hu');
  var q = question.trim();
  var topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a|ki az a|ki a|what is|what are|who is|define)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  var topicKey = topic.toLowerCase().replace(/\s+/g, ' ');
  var wikiTopic = TOPIC_MAP[topicKey] || topic;
  var deep = (typeof currentMode !== 'undefined' && (currentMode === 'research' || currentMode === 'kutatás'));
  var j = function(url){ return 'https://r.jina.ai/' + url; };
  var preferHu = lang !== 'en';

  var summaryUrls;
  if (lang === 'en') {
    summaryUrls = [
      j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiTopic)),
      j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
      j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiTopic))
    ];
  } else {
    summaryUrls = [
      j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiTopic)),
      j('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)),
      j('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiTopic))
    ];
  }

  for (var i = 0; i < summaryUrls.length; i++) {
    var raw = await fetchOne(summaryUrls[i], 4500);
    if (!raw) continue;
    var extract = parseWikiSummary(raw);
    if (extract && extract.length > 50 && !boostIsGarbage(extract, preferHu)) {
      var ans = extract.slice(0, deep ? 700 : 450);
      var lastDot = Math.max(ans.lastIndexOf('.'), ans.lastIndexOf('!'), ans.lastIndexOf('?'));
      if (lastDot > 60) ans = ans.slice(0, lastDot + 1);
      return ans;
    }
  }

  var pageUrls;
  if (lang === 'en') {
    pageUrls = [
      j('https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
      j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definition'))
    ];
    if (deep) pageUrls.push(j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' explained')));
  } else {
    pageUrls = [
      j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
      j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció site:hu.wikipedia.org'))
    ];
    if (deep) {
      pageUrls.push(j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat')));
      pageUrls.push(j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:telex.hu')));
    }
  }

  for (var k = 0; k < pageUrls.length; k++) {
    var raw2 = await fetchOne(pageUrls[k], 5000);
    if (!raw2) continue;
    var extract2 = parseWikiSummary(raw2);
    if (extract2 && extract2.length > 50 && !boostIsGarbage(extract2, preferHu)) {
      return extract2.slice(0, deep ? 700 : 420);
    }
  }

  return null;
}
