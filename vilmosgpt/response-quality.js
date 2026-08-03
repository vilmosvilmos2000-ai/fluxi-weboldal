/* response-quality v1 – no menu/scraper junk */
function isBadWebText(s) {
  if (!s || s.length < 40) return true;
  var lower = String(s).toLowerCase();
  var bad = [
    'javascript:print', 'lapinformációk', 'lapinformaciok', 'fájl feltöltése', 'fajl feltoltese',
    'nyomtatható változat', 'nyomtathato valtozat', 'nyomtatás', 'nyomtatas',
    'page contents not supported', 'markdown content', 'navigation menu', 'skip to content',
    'wikimédia', 'wikimedia', 'article wizard', 'szócikk', 'vitalap', 'osztály rendszertan',
    'médiaállomány', 'alternatively', 'cookie', 'sign in', 'log in', 'create an account',
    'edit source', 'view history', 'disambiguation', 'may refer to', 'search for',
    'létrehozás', 'áthelyezés', 'eszközök', 'kapcsolódó változások', 'speciális lapok',
    'permanent link', 'page information', 'cite this page', 'download as pdf',
    'upload file', 'printable version', 'what links here'
  ];
  for (var i = 0; i < bad.length; i++) if (lower.indexOf(bad[i]) >= 0) return true;
  var pipes = (s.match(/\|/g) || []).length;
  if (pipes > 8) return true;
  return false;
}
function isScraperJunkReply(s) {
  return isBadWebText(s) || /javascript\s*:\s*print/i.test(String(s||''));
}
function parseExtract(raw) {
  var t = String(raw || '');
  var m = t.match(/"extract"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var ex = JSON.parse('"' + m[1] + '"');
      if (ex && ex.length > 40 && !isBadWebText(ex)) return ex.replace(/\s+/g, ' ').trim();
    } catch (e) {}
  }
  try {
    var j = JSON.parse(t);
    if (j && j.extract && String(j.extract).length > 40 && !isBadWebText(j.extract)) {
      return String(j.extract).replace(/\s+/g, ' ').trim();
    }
  } catch (e2) {}
  if (t.indexOf('Markdown Content:') >= 0) t = t.split('Markdown Content:').slice(1).join(' ');
  t = t.replace(/https?:\/\/\S+/gi, ' ').replace(/[#>*_`|\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  if (isBadWebText(t)) return '';
  var parts = t.split(/(?<=[.!?])\s+/), out = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (p.length < 40 || isBadWebText(p)) continue;
    out.push(p);
    if (out.join(' ').length > 350) break;
  }
  return out.length ? out.join(' ') : '';
}
async function fetchWebAnswer(question, lang) {
  lang = lang || detectLang(question);
  var q = question.trim();
  var topic = q.replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|what is|what are|who is|define)\s+/i, '').replace(/[?.!]+$/g, '').trim() || q;
  topic = topic.slice(0, 80);
  var urls = [];
  if (lang === 'en') {
    urls.push('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic));
    urls.push('https://r.jina.ai/https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic));
  } else {
    urls.push('https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic));
    urls.push('https://r.jina.ai/https://hu.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic));
    urls.push('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic));
  }
  for (var i = 0; i < urls.length; i++) {
    try {
      var raw = await fetchOneUrl(urls[i], 5000);
      if (!raw) continue;
      var extract = parseExtract(raw);
      if (extract && extract.length > 50 && !isBadWebText(extract)) {
        var ans = extract.slice(0, 450);
        var d = Math.max(ans.lastIndexOf('.'), ans.lastIndexOf('!'), ans.lastIndexOf('?'));
        if (d > 60) ans = ans.slice(0, d + 1);
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
  var a = raw.slice(0, 450).trim();
  var lastDot = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('?'));
  if (lastDot > 60) a = a.slice(0, lastDot + 1);
  if (isBadWebText(a)) return null;
  return a;
}
async function callBackendChat(message, lang) {
  var base = (typeof window !== 'undefined' && window.VILMOS_API_BASE) ? String(window.VILMOS_API_BASE).replace(/\/$/, '') : '';
  var endpoints = [];
  if (base) endpoints.push(base + '/api/chat');
  endpoints.push('/api/chat');
  endpoints.push('/vilmosgpt/api/chat');
  if (!isOnline()) { var err = new Error('offline'); err.code = 'OFFLINE'; throw err; }
  var hist = (typeof conversationHistory !== 'undefined' ? conversationHistory : []).slice(-10).map(function(m){
    return { role: m.role, text: String(m.text || '').slice(0, 800) };
  });
  var payload = JSON.stringify({
    message: message,
    lang: lang || 'hu',
    mode: typeof currentMode !== 'undefined' ? currentMode : 'learn',
    history: hist
  });
  for (var i = 0; i < endpoints.length; i++) {
    try {
      var r = await fetch(endpoints[i], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (!r.ok) {
        if (r.status === 404 || r.status === 405) continue;
        var e2 = new Error('http_' + r.status); e2.code = 'HTTP'; e2.status = r.status; throw e2;
      }
      var data = await r.json();
      var reply = '';
      if (data && data.reply) reply = String(data.reply).trim();
      else if (data && data.choices && data.choices[0] && data.choices[0].message)
        reply = String(data.choices[0].message.content || '').trim();
      if (reply && isScraperJunkReply(reply)) {
        return (lang === 'en')
          ? 'Error: The AI returned an invalid format. Please try again!'
          : 'Hiba: Az AI rossz formátumban válaszolt, kérlek próbáld újra!';
      }
      if (reply) return reply;
    } catch (e) {
      if (e && (e.code === 'OFFLINE' || e.code === 'HTTP')) {
        if (e.code === 'HTTP' && (e.status === 404 || e.status === 405)) continue;
        throw e;
      }
    }
  }
  return null;
}
async function answerUser(text) {
  var msg = text.trim();
  var lower = msg.toLowerCase();
  var lang = detectLang(msg);
  if (!msg) return lang === 'en' ? 'Type something so I can answer.' : 'Írj valamit, hogy tudjak válaszolni.';
  if (isAboutHistory(msg)) return summarizeConversation();
  if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0 || /\b(remember that|remember this)\b/.test(lower)) {
    var fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg|remember that|remember this)[^\p{L}]*/iu, '').replace(/^hogy\s+/i, '').replace(/^that\s+/i, '').trim();
    if (fact) { rememberFact(fact); renderMemoryList(); return lang === 'en' ? ('Got it, I remembered: ' + fact) : ('Rendben, megjegyeztem: ' + fact); }
    return lang === 'en' ? 'Got it, remembered.' : 'Rendben, megjegyeztem.';
  }
  var known = knowledge.find(function(item){ return lower.indexOf(item.toLowerCase()) >= 0 && item.length > 3; });
  if (known) return (lang === 'en' ? 'From what I remember: ' : 'A korábbi emlékeim szerint: ') + known;
  var mathAnswer = tryEvaluateMath(msg);
  if (mathAnswer) return mathAnswer;
  if (isGreeting(msg)) return lang === 'en' ? 'Hi! Glad you are here. What would you like to ask?' : 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';
  var local = localSmartAnswer(msg, lang);
  if (local) return personalizeReply(local, currentMode, lang);

  var aiReply = await callBackendChat(msg, lang);
  if (aiReply && !isScraperJunkReply(aiReply)) return personalizeReply(aiReply, currentMode, lang);
  if (aiReply && isScraperJunkReply(aiReply)) {
    return lang === 'en'
      ? 'Error: The AI returned an invalid format. Please try again!'
      : 'Hiba: Az AI rossz formátumban válaszolt, kérlek próbáld újra!';
  }

  if (shouldSearchWeb(msg)) {
    try {
      var webText = await fetchWebAnswer(msg, lang);
      var baseReply = buildFriendlyReply(webText);
      if (baseReply && !isScraperJunkReply(baseReply)) return personalizeReply(baseReply, currentMode, lang);
    } catch (webErr) {
      if (webErr && (webErr.code === 'OFFLINE' || webErr.code === 'HTTP' || webErr.code === 'TIMEOUT')) throw webErr;
    }
  }
  return personalizeReply(fallbackAnswer(msg, lang), currentMode, lang);
}
