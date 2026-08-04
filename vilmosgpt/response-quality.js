/* response-quality v3 – NO API keys, internet search only */
function isBadWebText(s) {
  if (!s || s.length < 40) return true;
  var lower = String(s).toLowerCase();
  var bad = [
    'javascript:print', 'lapinformációk', 'lapinformaciok', 'fájl feltöltése', 'fajl feltoltese',
    'nyomtatható változat', 'nyomtathato valtozat', 'nyomtatás', 'page contents not supported',
    'markdown content', 'navigation menu', 'skip to content', 'wikimédia commons', 'wikimedia commons',
    'article wizard', 'osztály rendszertan', 'médiaállomány', 'alternatively, you can',
    'cookie', 'sign in', 'log in', 'create an account', 'edit source', 'view history',
    'disambiguation', 'may refer to', 'létrehozás', 'áthelyezés', 'eszközök',
    'permanent link', 'page information', 'cite this page', 'download as pdf',
    'upload file', 'printable version', 'what links here', 'you are making too many requests',
    'enable javascript', 'captcha', 'privacy policy', 'terms of service'
  ];
  for (var i = 0; i < bad.length; i++) if (lower.indexOf(bad[i]) >= 0) return true;
  if ((s.match(/\|/g) || []).length > 8) return true;
  return false;
}

async function fetchOneUrl(url, ms) {
  if (typeof isOnline === 'function' && !isOnline()) {
    var err = new Error('offline'); err.code = 'OFFLINE'; throw err;
  }
  try {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms || 7000);
    var r = await fetch(url, {
      headers: { Accept: 'text/plain, text/html, application/json, */*' },
      signal: c.signal
    });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.text();
  } catch (e) {
    if (e && e.code === 'OFFLINE') throw e;
    return null;
  }
}

function parseExtract(raw) {
  var t = String(raw || '');
  if (!t || t.length < 30) return '';
  if (/too many requests/i.test(t)) return '';
  try {
    var j = JSON.parse(t);
    if (j && j.extract && String(j.extract).length > 40 && !isBadWebText(j.extract)) {
      return String(j.extract).replace(/\s+/g, ' ').trim();
    }
  } catch (e0) {}
  var m = t.match(/"extract"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var ex = JSON.parse('"' + m[1] + '"');
      if (ex && ex.length > 40 && !isBadWebText(ex)) return ex.replace(/\s+/g, ' ').trim();
    } catch (e) {}
  }
  if (t.indexOf('Markdown Content:') >= 0) {
    t = t.split('Markdown Content:').slice(1).join(' ');
  }
  if (t.indexOf('Title:') === 0 || t.indexOf('URL Source:') >= 0) {
    var lines = t.split('\n');
    var body = [];
    var skip = true;
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (/^Markdown Content:/i.test(line)) { skip = false; continue; }
      if (skip && /^(Title|URL Source|Published|Warning):/i.test(line)) continue;
      if (!skip || line.trim().length > 50) body.push(line);
    }
    t = body.join(' ');
  }
  t = t.replace(/https?:\/\/\S+/gi, ' ')
       .replace(/[#>*_`|\[\]{}]/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();
  if (isBadWebText(t)) return '';
  var parts = t.split(/(?<=[.!?])\s+/);
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (p.length < 45 || isBadWebText(p)) continue;
    out.push(p);
    if (out.join(' ').length > 500) break;
  }
  return out.length ? out.join(' ') : '';
}

function jina(url) {
  return 'https://r.jina.ai/' + url;
}

async function fetchWebAnswer(question, lang) {
  lang = lang || (typeof detectLang === 'function' ? detectLang(question) : 'hu');
  var q = String(question || '').trim();
  if (!q) return null;
  var topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|what is|what are|who is|define|hogyan|how)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;
  topic = topic.slice(0, 90);

  var urls = [];
  if (lang === 'en') {
    urls.push(jina('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)));
  } else {
    urls.push(jina('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)));
    urls.push(jina('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic)));
  }
  var ddgQ = lang === 'en' ? (topic + ' explained') : (topic + ' magyarázat');
  urls.push(jina('https://duckduckgo.com/html/?q=' + encodeURIComponent(ddgQ)));
  if (typeof currentMode !== 'undefined' && currentMode === 'research') {
    urls.push(jina('https://duckduckgo.com/html/?q=' + encodeURIComponent(q)));
    if (lang !== 'en') {
      urls.push(jina('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' site:hu.wikipedia.org')));
    }
  }

  for (var i = 0; i < urls.length; i++) {
    try {
      var raw = await fetchOneUrl(urls[i], 8000);
      if (!raw) continue;
      var extract = parseExtract(raw);
      if (extract && extract.length > 50 && !isBadWebText(extract)) {
        var ans = extract.slice(0, 550);
        var d = Math.max(ans.lastIndexOf('.'), ans.lastIndexOf('!'), ans.lastIndexOf('?'));
        if (d > 80) ans = ans.slice(0, d + 1);
        return ans;
      }
    } catch (e) {
      if (e && e.code === 'OFFLINE') throw e;
    }
  }
  return null;
}

function buildFriendlyReply(webText) {
  var raw = String(webText || '').trim();
  if (!raw || raw.length < 40 || isBadWebText(raw)) return null;
  var a = raw.slice(0, 550).trim();
  var lastDot = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('?'));
  if (lastDot > 80) a = a.slice(0, lastDot + 1);
  if (isBadWebText(a)) return null;
  return a;
}

function shouldSearchWebAlways(text) {
  var lower = String(text || '').toLowerCase().trim();
  if (!lower || lower.length < 2) return false;
  if (typeof isGreeting === 'function' && isGreeting(lower)) return false;
  if (typeof isAboutHistory === 'function' && isAboutHistory(lower)) return false;
  if (lower.indexOf('mi a neved') >= 0 || lower.indexOf('vicc') >= 0) return false;
  if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0) return false;
  if (lower.indexOf('köszönöm') >= 0 || lower.indexOf('koszonom') >= 0) return false;
  return true;
}

async function answerUser(text) {
  var msg = String(text || '').trim();
  var lower = msg.toLowerCase();
  var lang = typeof detectLang === 'function' ? detectLang(msg) : 'hu';
  try {
    if (!msg) return lang === 'en' ? 'Type something so I can answer.' : 'Írj valamit, hogy tudjak válaszolni.';
    if (typeof isAboutHistory === 'function' && isAboutHistory(msg)) return summarizeConversation();
    if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0) {
      var fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg)[:\s-]*/i, '').replace(/^hogy\s+/i, '').trim();
      if (fact && typeof rememberFact === 'function') {
        rememberFact(fact);
        if (typeof renderMemoryList === 'function') renderMemoryList();
        return lang === 'en' ? ('Got it, I remembered: ' + fact) : ('Rendben, megjegyeztem: ' + fact);
      }
    }
    if (typeof knowledge !== 'undefined' && knowledge && knowledge.length) {
      var known = knowledge.find(function (item) {
        return lower.indexOf(String(item).toLowerCase()) >= 0 && String(item).length > 3;
      });
      if (known) return (lang === 'en' ? 'From what I remember: ' : 'A korábbi emlékeim szerint: ') + known;
    }
    if (typeof tryEvaluateMath === 'function') {
      var mathAnswer = tryEvaluateMath(msg);
      if (mathAnswer) return mathAnswer;
    }
    if (typeof isGreeting === 'function' && isGreeting(msg)) {
      return lang === 'en'
        ? 'Hi! Ask me anything – I will look it up on the web.'
        : 'Szia! Kérdezz bármit – a neten keresek választ.';
    }
    if (typeof localSmartAnswer === 'function') {
      var local = localSmartAnswer(msg, lang);
      if (local) {
        return typeof personalizeReply === 'function'
          ? personalizeReply(local, currentMode, lang)
          : local;
      }
    }

    if (shouldSearchWebAlways(msg) || (typeof shouldSearchWeb === 'function' && shouldSearchWeb(msg))) {
      try {
        var webText = await fetchWebAnswer(msg, lang);
        var baseReply = buildFriendlyReply(webText);
        if (baseReply) {
          return typeof personalizeReply === 'function'
            ? personalizeReply(baseReply, currentMode, lang)
            : baseReply;
        }
      } catch (webErr) {
        if (webErr && webErr.code === 'OFFLINE') throw webErr;
      }
    }

    var fb = typeof fallbackAnswer === 'function'
      ? fallbackAnswer(msg, lang)
      : (lang === 'en'
        ? 'I could not find a clear answer online. Try rephrasing.'
        : 'Nem találtam egyértelmű választ a neten. Próbáld meg másképp megfogalmazni.');
    return typeof personalizeReply === 'function' ? personalizeReply(fb, currentMode, lang) : fb;
  } catch (fatal) {
    if (fatal && fatal.code === 'OFFLINE') throw fatal;
    console.warn('answerUser', fatal);
    return lang === 'en'
      ? 'Something went wrong while searching. Please try again.'
      : 'Hiba történt a keresés közben. Próbáld újra.';
  }
}
