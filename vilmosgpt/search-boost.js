/* Multi-source web search – tiszta, értelmes válaszok */

function boostCleanText(text) {
  let t = String(text || '');
  // Jina / markdown zaj
  if (t.includes('Markdown Content:')) t = t.split('Markdown Content:').slice(1).join(' ');
  if (t.includes('Title:')) t = t.replace(/^Title:[^\n]*\n?/i, '');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/https?:\/\/\S+/gi, ' ');
  t = t.replace(/www\.\S+/gi, ' ');
  t = t.replace(/\d{4}-\d{2}-\d{2}T[\d:.Z+-]+/g, ' ');
  t = t.replace(/!Image\s*\d*/gi, ' ');
  t = t.replace(/[#>*_`|~\[\]{}]/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}

function boostIsGarbage(s) {
  if (!s || s.length < 30) return true;
  if (s.length > 320) return true;
  const lower = s.toLowerCase();
  const bad = [
    'cookie', 'accept all', 'privacy policy', 'sign in', 'log in', 'facebook',
    'markdown content', 'skip to', 'page contents not supported',
    'color automatic', 'light dark', 'this page is always',
    'please search for', 'you need to or create an account',
    'szócikk', 'vitalap', 'létrehozás', 'eszközök', 'áthelyezés',
    'oldalsávba', 'műveletek', 'általános', 'mi hivatkozik',
    'színek béta', 'automatikus világos', 'felolvastat',
    'wikipédia', 'wikipedia', 'edit source', 'view history',
    'create account', 'special page', 'main page', 'contents',
    'navigation menu', 'jump to', 'toggle menu', 'search results',
    'related searches', 'people also ask', 'see also',
    'advertisement', 'subscribe', 'newsletter', 'cookie settings',
    'javascript', 'enable cookies', 'all rights reserved'
  ];
  if (bad.some(b => lower.includes(b))) return true;
  // Túl sok rövid szótöredék / menü
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 6) return true;
  const shortRatio = words.filter(w => w.length <= 2).length / words.length;
  if (shortRatio > 0.45) return true;
  // Betűarány
  const letters = (s.match(/[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ]/g) || []).length;
  if (letters < 22) return true;
  // Ha majdnem csak nagybetűs szavak (menü)
  const caps = words.filter(w => /^[A-ZÁÉÍÓÖŐÚÜŰ]{2,}$/.test(w)).length;
  if (caps >= 4 && words.length < 15) return true;
  return false;
}

function boostExtract(raw, maxLen) {
  let t = boostCleanText(raw)
    .replace(/\b(Image|Markdown Content|Skip to|Cookie|Accept|Privacy|Sign in|Log in|Facebook|Wikipédia|Wikipedia|Title|URL Source)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Mondatok
  const parts = t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const good = [];
  const seen = new Set();
  for (const s of parts) {
    if (boostIsGarbage(s)) continue;
    const key = s.slice(0, 50).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    good.push(s);
    if (good.join(' ').length >= maxLen) break;
  }
  if (good.length) return good.join(' ').slice(0, maxLen).trim();

  // Ha nincs mondat, próbáljunk hosszabb blokkot
  const block = t.slice(0, maxLen).trim();
  if (block.length > 80 && !boostIsGarbage(block.slice(0, 120))) return block;
  return '';
}

// Gyakori magyar témák jobb wiki címmel
const TOPIC_MAP = {
  'tv': 'Televízió',
  'tévé': 'Televízió',
  'teve': 'Televízió',
  'televizio': 'Televízió',
  'televízió': 'Televízió',
  'pc': 'Személyi_számítógép',
  'ai': 'Mesterséges_intelligencia',
  'gpt': 'Generative_pre-trained_transformer',
  'wifi': 'Wi-Fi',
  'usb': 'USB',
  'cpu': 'Processzor',
  'gpu': 'Grafikus_processzor',
  'ram': 'Memória_(számítástechnika)',
  'html': 'HTML',
  'css': 'Cascading_Style_Sheets',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'python': 'Python_(programozási_nyelv)',
  'java': 'Java_(programozási_nyelv)',
  'internet': 'Internet',
  'wifi': 'Wi-Fi',
  'bluetooth': 'Bluetooth',
  'android': 'Android_(operációs_rendszer)',
  'ios': 'IOS',
  'windows': 'Microsoft_Windows',
  'linux': 'Linux',
  'dns': 'Domain_Name_System',
  'http': 'HTTP',
  'url': 'URL',
  'api': 'Alkalmazásprogramozási_interfész',
  'nft': 'Nem_helyettesíthető_token',
  'bitcoin': 'Bitcoin',
  'crypto': 'Kriptovaluta',
  'eu': 'Európai_Unió',
  'nato': 'Észak-atlanti_Szerződés_Szervezete',
  'usa': 'Amerikai_Egyesült_Államok',
  'uk': 'Egyesült_Királyság'
};

async function fetchWebAnswer(question) {
  const q = question.trim();
  let topic = q
    .replace(/^(mi az a|mi a|mi az|mit jelent|mi ez a|mi ez|mi az a|ki az a|ki a)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || q;

  const topicKey = topic.toLowerCase().replace(/\s+/g, ' ');
  const wikiTopic = TOPIC_MAP[topicKey] || topic.replace(/\s+/g, '_');

  const deep = (typeof currentMode !== 'undefined' && (currentMode === 'research' || currentMode === 'kutatás'));
  const j = (url) => 'https://r.jina.ai/' + url;

  // Elsődlegesen Wikipedia + definíciós keresések (tisztább szöveg)
  const baseSources = [
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
    j('https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
    j('https://hu.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://en.wikipedia.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' definíció site:hu.wikipedia.org')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' magyarázat')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' jelentése')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' wikipedia'))
  ];

  const researchSources = [
    j('https://simple.wikipedia.org/wiki/' + encodeURIComponent(wikiTopic)),
    j('https://www.britannica.com/search?query=' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:index.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:telex.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:24.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:hvg.hu')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' explained')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' definition')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(topic + ' magyarázat egyszerűen')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(q + ' explanation')),
    j('https://en.wiktionary.org/wiki/' + encodeURIComponent(topic)),
    j('https://hu.wiktionary.org/wiki/' + encodeURIComponent(topic)),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' összefoglaló')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' tények')),
    j('https://duckduckgo.com/html/?q=' + encodeURIComponent(q + ' site:edu')),
    j('https://www.bing.com/search?q=' + encodeURIComponent(topic + ' what is'))
  ];

  const sources = deep ? baseSources.concat(researchSources) : baseSources;
  const timeoutMs = deep ? 7000 : 5500;
  const maxSnippets = deep ? 8 : 4;
  const maxLen = deep ? 900 : 480;
  const perSourceLen = deep ? 220 : 260;

  const fetches = sources.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        headers: { Accept: 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) return null;
      const raw = await response.text();
      const useful = boostExtract(raw, perSourceLen);
      if (useful && useful.length > 60) return useful;
    } catch (e) {}
    return null;
  });

  const settled = await Promise.allSettled(fetches);
  const results = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value) results.push(s.value);
  }
  if (!results.length) return null;

  // Legjobb, ismétlés nélküli részek
  const combined = [];
  const seen = new Set();
  for (const r of results) {
    const key = r.slice(0, 55).toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    // Még egyszer szűrés
    if (boostIsGarbage(r.slice(0, 100))) continue;
    combined.push(r);
    if (combined.join(' ').length >= maxLen) break;
    if (combined.length >= maxSnippets) break;
  }

  if (!combined.length) return null;

  let answer = combined.join(' ').replace(/\s{2,}/g, ' ').slice(0, maxLen).trim();
  // Vágás mondatvégre
  const lastDot = Math.max(answer.lastIndexOf('.'), answer.lastIndexOf('!'), answer.lastIndexOf('?'));
  if (lastDot > 80) answer = answer.slice(0, lastDot + 1);

  if (deep && results.length) {
    answer = answer + '\n\n(Összefoglalva ' + results.length + ' forrásból.)';
  }
  return answer;
}
