/* response-quality v2 – always answer, no hang, no menu junk */
function isBadWebText(s) {
  if (!s || s.length < 30) return true;
  var lower = String(s).toLowerCase();
  var bad = [
    'javascript:print', 'lapinformációk', 'lapinformaciok', 'fájl feltöltése', 'fajl feltoltese',
    'nyomtatható változat', 'nyomtathato valtozat', 'nyomtatás', 'nyomtatas',
    'page contents not supported', 'markdown content', 'navigation menu', 'skip to content',
    'wikimédia commons', 'wikimedia commons', 'article wizard', 'osztály rendszertan',
    'médiaállomány', 'alternatively, you can', 'cookie', 'sign in', 'log in', 'create an account',
    'edit source', 'view history', 'disambiguation', 'may refer to',
    'létrehozás', 'áthelyezés', 'eszközök', 'kapcsolódó változások', 'speciális lapok',
    'permanent link', 'page information', 'cite this page', 'download as pdf',
    'upload file', 'printable version', 'what links here', 'you are making too many requests'
  ];
  for (var i = 0; i < bad.length; i++) if (lower.indexOf(bad[i]) >= 0) return true;
  if ((s.match(/\|/g) || []).length > 8) return true;
  return false;
}
function isScraperJunkReply(s) {
  return isBadWebText(s) || /javascript\s*:\s*print/i.test(String(s || ''));
}

async function fetchOneUrl(url, ms) {
  if (!isOnline()) {
    var err = new Error('offline');
    err.code = 'OFFLINE';
    throw err;
  }
  try {
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, ms || 5000);
    var r = await fetch(url, { headers: { Accept: 'application/json, text/plain, */*' }, signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.text();
  } catch (e) {
    if (e && e.code === 'OFFLINE') throw e;
    if (e && e.name === 'AbortError') return null;
    if (!isOnline()) {
      var e4 = new Error('offline');
      e4.code = 'OFFLINE';
      throw e4;
    }
    return null;
  }
}

function parseExtract(raw) {
  var t = String(raw || '');
  if (!t || t.length < 20) return '';
  if (/too many requests/i.test(t)) return '';
  try {
    var j = JSON.parse(t);
    if (j && j.extract && String(j.extract).length > 30 && !isBadWebText(j.extract)) {
      return String(j.extract).replace(/\s+/g, ' ').trim();
    }
  } catch (e0) {}
  var m = t.match(/"extract"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      var ex = JSON.parse('"' + m[1] + '"');
      if (ex && ex.length > 30 && !isBadWebText(ex)) return ex.replace(/\s+/g, ' ').trim();
    } catch (e) {}
  }
  if (t.indexOf('Markdown Content:') >= 0) t = t.split('Markdown Content:').slice(1).join(' ');
  t = t.replace(/https?:\/\/\S+/gi, ' ').replace(/[#>*_`|\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  if (isBadWebText(t)) return '';
  var parts = t.split(/(?<=[.!?])\s+/);
  var out = [];
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
  var topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|what is|what are|who is|define)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;
  topic = topic.slice(0, 80);
  var urls = [];
  var slug = encodeURIComponent(topic.replace(/\s+/g, '_'));
  var slug2 = encodeURIComponent(topic);
  if (lang === 'en') {
    urls.push('https://r.jina.ai/https://en.wikipedia.org/api/rest_v1/page/summary/' + slug2);
    urls.push('https://r.jina.ai/https://en.wikipedia.org/api/rest_v1/page/summary/' + slug);
  } else {
    urls.push('https://r.jina.ai/https://hu.wikipedia.org/api/rest_v1/page/summary/' + slug2);
    urls.push('https://r.jina.ai/https://hu.wikipedia.org/api/rest_v1/page/summary/' + slug);
    urls.push('https://r.jina.ai/https://en.wikipedia.org/api/rest_v1/page/summary/' + slug2);
  }
  for (var i = 0; i < urls.length; i++) {
    try {
      var raw = await fetchOneUrl(urls[i], 6000);
      if (!raw) continue;
      var extract = parseExtract(raw);
      if (extract && extract.length > 40 && !isBadWebText(extract)) {
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
  if (!raw || raw.length < 30 || isBadWebText(raw)) return null;
  var a = raw.slice(0, 450).trim();
  var lastDot = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('?'));
  if (lastDot > 60) a = a.slice(0, lastDot + 1);
  if (isBadWebText(a)) return null;
  return a;
}

function localDomainAnswer(msg, lang) {
  var lower = msg.toLowerCase();
  var isEn = lang === 'en';
  if (/kukirin|roller|scooter|e-?roller|elektromos\s*roller/i.test(lower)) {
    if (/g2|beáll|allas|setting|fék|fek|gumi|nyomás|nyomas|sebesség|sebesseg|akkumulátor|akku|tolt/i.test(lower) || true) {
      if (isEn) {
        return '**Electric scooter basics (e.g. Kukirin G2 family)**\n\n' +
          '- **Tyre pressure:** usually about **2.5–3.0 bar** (check sidewall).\n' +
          '- **Brakes:** mechanical disc – keep pads free of oil; tighten caliper bolts.\n' +
          '- **Speed modes:** start in low mode; only use higher modes on open, legal roads.\n' +
          '- **Battery:** avoid full 0% discharge; store around 40–60% if unused for weeks.\n' +
          '- **Safety:** helmet, lights, never modify controller limits illegally.\n\n' +
          'Tell me your exact model and what you want to change (speed, brake, tyre, battery).';
      }
      return '**Elektromos roller – alap beállítások (pl. Kukirin G2 típusok)**\n\n' +
        '- **Guminomás:** jellemzően **2,5–3,0 bar** (nézd meg a gumi oldalát).\n' +
        '- **Fék:** mechanikus tárcsa – ne legyen olaj a betéten; csavarok legyenek meghúzva.\n' +
        '- **Sebességmódok:** mindig alacsony módban indulj; magasabb mód csak biztonságos helyen.\n' +
        '- **Akku:** ne merítsd rendszeresen 0%-ra; tároláskor kb. 40–60%.\n' +
        '- **Biztonság:** sisak, világítás; ne hackeld a limitereket.\n\n' +
        'Írd meg a **pontos típust** (pl. G2 Max) és mit szeretnél: gumi, fék, sebesség, töltés.';
    }
  }
  if (/\b(html|css|javascript|js)\b/i.test(lower) && /(hogyan|how|kód|code|írj|irj|csinál|csinal)/i.test(lower)) {
    if (isEn) return 'I can help with HTML/CSS/JS. Describe what you want to build, and I will give a clear code example.';
    return 'Segítek HTML/CSS/JS-ben. Írd le pontosan mit szeretnél, és adok egy tiszta kódpéldát Markdownban.';
  }
  if (/roblox|luau/i.test(lower)) {
    if (isEn) return 'For Roblox Luau: tell me LocalScript or Server Script, and what should happen. I will outline steps and sample code.';
    return 'Roblox Luau: írd meg, hogy LocalScript vagy Server Script kell-e, és mi legyen a működés. Adok lépéseket és mintakódot.';
  }
  if (/fortnite/i.test(lower)) {
    if (isEn) return 'Ask a specific Fortnite question and I will answer clearly.';
    return 'Tegyél fel egy konkrét Fortnite kérdést, és világosan válaszolok.';
  }
  return null;
}

async function callBackendChat(message, lang) {
  var base = (typeof window !== 'undefined' && window.VILMOS_API_BASE) ? String(window.VILMOS_API_BASE).replace(/\/$/, '') : '';
  var endpoints = [];
  if (base) endpoints.push(base + '/api/chat');
  endpoints.push('/api/chat');
  endpoints.push('/vilmosgpt/api/chat');
  if (!isOnline()) {
    var err = new Error('offline');
    err.code = 'OFFLINE';
    throw err;
  }
  var hist = (typeof conversationHistory !== 'undefined' ? conversationHistory : []).slice(-10).map(function (m) {
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
      if (!r.ok) continue;
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
    } catch (e) {}
  }
  return null;
}

async function answerUser(text) {
  var msg = String(text || '').trim();
  var lower = msg.toLowerCase();
  var lang = detectLang(msg);
  try {
    if (!msg) return lang === 'en' ? 'Type something so I can answer.' : 'Írj valamit, hogy tudjak válaszolni.';
    if (typeof isAboutHistory === 'function' && isAboutHistory(msg)) return summarizeConversation();
    if (lower.indexOf('jegyezz meg') >= 0 || lower.indexOf('emlékezz') >= 0 || /\b(remember that|remember this)\b/.test(lower)) {
      var fact = msg.replace(/^(jegyezz meg|tanulj meg|emlékezz|emlékezz meg|remember that|remember this)[:\s-]*/i, '').replace(/^hogy\s+/i, '').replace(/^that\s+/i, '').trim();
      if (fact) {
        rememberFact(fact);
        renderMemoryList();
        return lang === 'en' ? ('Got it, I remembered: ' + fact) : ('Rendben, megjegyeztem: ' + fact);
      }
      return lang === 'en' ? 'Got it, remembered.' : 'Rendben, megjegyeztem.';
    }
    if (typeof knowledge !== 'undefined' && knowledge && knowledge.length) {
      var known = knowledge.find(function (item) { return lower.indexOf(String(item).toLowerCase()) >= 0 && String(item).length > 3; });
      if (known) return (lang === 'en' ? 'From what I remember: ' : 'A korábbi emlékeim szerint: ') + known;
    }
    var mathAnswer = tryEvaluateMath(msg);
    if (mathAnswer) return mathAnswer;
    if (isGreeting(msg)) return lang === 'en' ? 'Hi! Glad you are here. What would you like to ask?' : 'Szia! Örülök, hogy itt vagy. Mit szeretnél ma megkérdezni?';
    var local = localSmartAnswer(msg, lang);
    if (local) return personalizeReply(local, currentMode, lang);

    var domain = localDomainAnswer(msg, lang);
    if (domain) return personalizeReply(domain, currentMode, lang);

    try {
      var aiReply = await callBackendChat(msg, lang);
      if (aiReply && !isScraperJunkReply(aiReply)) return personalizeReply(aiReply, currentMode, lang);
      if (aiReply && isScraperJunkReply(aiReply)) {
        return lang === 'en'
          ? 'Error: The AI returned an invalid format. Please try again!'
          : 'Hiba: Az AI rossz formátumban válaszolt, kérlek próbáld újra!';
      }
    } catch (be) {
      if (be && be.code === 'OFFLINE') throw be;
    }

    if (shouldSearchWeb(msg)) {
      try {
        var webText = await fetchWebAnswer(msg, lang);
        var baseReply = buildFriendlyReply(webText);
        if (baseReply && !isScraperJunkReply(baseReply)) return personalizeReply(baseReply, currentMode, lang);
      } catch (webErr) {
        if (webErr && webErr.code === 'OFFLINE') throw webErr;
      }
    }

    return personalizeReply(fallbackAnswer(msg, lang), currentMode, lang);
  } catch (fatal) {
    if (fatal && fatal.code === 'OFFLINE') throw fatal;
    console.warn('answerUser', fatal);
    return lang === 'en'
      ? 'Something went wrong while answering. Please try again in a moment.'
      : 'Hiba történt a válasz során. Próbáld meg újra egy kicsit később.';
  }
}
